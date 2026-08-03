import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DataTable } from '../../components/shared/DataTable'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { propertyService } from '../../services/propertyService'
import type { Property } from '../../types/property'
import { PropertyFormModal } from './PropertyFormModal'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>()
  const [error, setError] = useState<string>()
  const [formTarget, setFormTarget] = useState<Property | 'new'>()
  const [deleteTarget, setDeleteTarget] = useState<Property>()

  const load = async () => {
    setError(undefined)
    try {
      setProperties(await propertyService.getAll())
    } catch {
      setError('Không thể tải danh sách nhà trọ. Vui lòng thử lại.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSaved = () => {
    setFormTarget(undefined)
    load()
  }

  const handleDeleted = async () => {
    if (!deleteTarget) return
    await propertyService.remove(deleteTarget.id)
    setDeleteTarget(undefined)
    load()
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Nhà trọ</h1>
        <Button onClick={() => setFormTarget('new')}>
          <Plus className="size-4" aria-hidden />
          Thêm nhà trọ
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {properties === undefined && !error ? (
        <p className="text-sm text-muted">Đang tải...</p>
      ) : properties && properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Chưa có nhà trọ nào"
          description="Thêm nhà trọ đầu tiên để bắt đầu quản lý phòng."
          action={
            <Button variant="secondary" onClick={() => setFormTarget('new')}>
              Thêm nhà trọ
            </Button>
          }
        />
      ) : properties ? (
        <DataTable
          data={properties}
          keyField={(p) => p.id}
          cardTitle={(p) => (
            <Link to={`/properties/${p.id}`} className="hover:underline">
              {p.name}
            </Link>
          )}
          columns={[
            {
              header: 'Tên nhà trọ',
              hideOnCard: true,
              render: (p) => (
                <Link to={`/properties/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
              ),
            },
            { header: 'Địa chỉ', render: (p) => p.address },
            { header: 'Tổng số phòng', render: (p) => p.totalRooms },
          ]}
          actions={(p) => (
            <>
              <button
                type="button"
                onClick={() => setFormTarget(p)}
                aria-label={`Sửa ${p.name}`}
                className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(p)}
                aria-label={`Xoá ${p.name}`}
                className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </>
          )}
        />
      ) : null}

      {formTarget && (
        <PropertyFormModal
          property={formTarget === 'new' ? undefined : formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá nhà trọ"
          message={`Bạn có chắc chắn muốn xoá "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDeleted}
          onCancel={() => setDeleteTarget(undefined)}
        />
      )}
    </AppLayout>
  )
}
