import { useEffect, useState } from 'react'
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DataTable } from '../../components/shared/DataTable'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { TableSkeleton } from '../../components/shared/TableSkeleton'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { useToast } from '../../components/shared/Toast'
import { tenantService } from '../../services/tenantService'
import type { Tenant, TenantDetail } from '../../types/tenant'
import { TenantFormModal } from '../../components/tenants/TenantFormModal'

export default function TenantsPage() {
  const { showToast } = useToast()

  const [tenants, setTenants] = useState<Tenant[]>()
  const [error, setError] = useState<string>()
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  // 'new' = tạo mới; TenantDetail = sửa (phải fetch vì list DTO thiếu quê quán/ngày sinh/...)
  const [formTarget, setFormTarget] = useState<TenantDetail | 'new'>()
  const [loadingEditId, setLoadingEditId] = useState<string>()
  const [deleteTarget, setDeleteTarget] = useState<Tenant>()

  // Chờ người dùng ngừng gõ rồi mới gọi API, tránh bắn request mỗi ký tự
  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  const load = async (searchTerm: string) => {
    setError(undefined)
    try {
      setTenants(await tenantService.getAll(searchTerm))
    } catch {
      setError('Không thể tải danh sách người thuê. Vui lòng thử lại.')
    }
  }

  useEffect(() => {
    load(appliedSearch)
  }, [appliedSearch])

  const openEdit = async (tenant: Tenant) => {
    setLoadingEditId(tenant.id)
    try {
      setFormTarget(await tenantService.getById(tenant.id))
    } catch {
      showToast('Không thể tải thông tin người thuê.', 'error')
    } finally {
      setLoadingEditId(undefined)
    }
  }

  const handleSaved = (mode: 'create' | 'edit') => {
    setFormTarget(undefined)
    showToast(
      mode === 'edit' ? 'Đã lưu thay đổi hồ sơ.' : 'Đã thêm người thuê mới.',
    )
    load(appliedSearch)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await tenantService.remove(deleteTarget.id)
    } catch (err) {
      showToast(
        tenantService.getErrorMessage(err) ?? 'Không thể xoá hồ sơ người thuê.',
        'error',
      )
      throw err
    }
    setDeleteTarget(undefined)
    showToast('Đã xoá hồ sơ người thuê.')
    load(appliedSearch)
  }

  const isSearching = appliedSearch.trim() !== ''

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Người thuê</h1>
        <Button onClick={() => setFormTarget('new')}>
          <Plus className="size-4" aria-hidden />
          Thêm người thuê
        </Button>
      </div>

      <div className="relative mb-6">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên hoặc số CCCD/CMND"
          aria-label="Tìm người thuê"
          className="w-full border border-border bg-bg py-2.5 pr-3 pl-10 text-sm text-fg transition-colors duration-150 placeholder:text-muted focus:border-border-strong"
        />
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {tenants === undefined && !error ? (
        <TableSkeleton columns={3} />
      ) : tenants && tenants.length === 0 ? (
        isSearching ? (
          <EmptyState
            icon={Search}
            title="Không tìm thấy người thuê"
            description={`Không có hồ sơ nào khớp với "${appliedSearch}". Thử từ khoá khác xem sao.`}
            action={
              <Button variant="secondary" onClick={() => setSearch('')}>
                Xoá tìm kiếm
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Chưa có người thuê nào"
            description="Thêm hồ sơ người thuê đầu tiên để bắt đầu quản lý."
            action={
              <Button variant="secondary" onClick={() => setFormTarget('new')}>
                Thêm người thuê đầu tiên
              </Button>
            }
          />
        )
      ) : tenants ? (
        <DataTable
          data={tenants}
          keyField={(t) => t.id}
          cardTitle={(t) => t.fullName}
          columns={[
            { header: 'Họ tên', hideOnCard: true, render: (t) => t.fullName },
            { header: 'Số CCCD/CMND', render: (t) => t.idNumber },
            { header: 'Số điện thoại', render: (t) => t.phoneNumber },
          ]}
          actions={(t) => (
            <>
              <button
                type="button"
                onClick={() => openEdit(t)}
                disabled={loadingEditId === t.id}
                aria-label={`Sửa ${t.fullName}`}
                className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg disabled:cursor-wait disabled:opacity-50"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(t)}
                aria-label={`Xoá ${t.fullName}`}
                className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </>
          )}
        />
      ) : null}

      {formTarget && (
        <TenantFormModal
          mode={formTarget === 'new' ? 'create' : 'edit'}
          tenant={formTarget === 'new' ? undefined : formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={() => handleSaved(formTarget === 'new' ? 'create' : 'edit')}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá hồ sơ người thuê"
          message={`Bạn có chắc chắn muốn xoá hồ sơ "${deleteTarget.fullName}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(undefined)}
        />
      )}
    </AppLayout>
  )
}
