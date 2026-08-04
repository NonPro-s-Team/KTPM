import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DetailView } from '../../components/shared/DetailView'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { useToast } from '../../components/shared/Toast'
import { EMPTY_VALUE, formatDateOnly, formatDateTime } from '../../lib/format'
import { tenantService } from '../../services/tenantService'
import { TENANT_GENDER_LABELS, type TenantDetail } from '../../types/tenant'
import { TenantFormModal } from '../../components/tenants/TenantFormModal'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [tenant, setTenant] = useState<TenantDetail>()
  const [error, setError] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    if (!id) return
    setError(undefined)
    try {
      setTenant(await tenantService.getById(id))
    } catch (err) {
      setError(
        tenantService.getErrorMessage(err) ??
          'Không tìm thấy hồ sơ người thuê hoặc không thể tải dữ liệu.',
      )
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleDelete = async () => {
    if (!tenant) return
    await tenantService.remove(tenant.id)
    setIsDeleting(false)
    showToast('Đã xoá hồ sơ người thuê.')
    navigate('/tenants')
  }

  if (!id) return null

  return (
    <AppLayout>
      {error && <Alert variant="error">{error}</Alert>}

      {tenant && (
        <DetailView
          backTo="/tenants"
          backLabel="Quay lại danh sách người thuê"
          title={tenant.fullName}
          subtitle={`CCCD/CMND: ${tenant.idNumber}`}
          actions={
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Pencil className="size-4" aria-hidden />
                Sửa
              </Button>
              <Button variant="ghost" onClick={() => setIsDeleting(true)}>
                <Trash2 className="size-4" aria-hidden />
                Xoá
              </Button>
            </>
          }
          fields={[
            { label: 'Số điện thoại', value: tenant.phoneNumber },
            {
              label: 'Ngày sinh',
              value: formatDateOnly(tenant.dateOfBirth),
            },
            {
              label: 'Giới tính',
              value:
                tenant.gender != null
                  ? TENANT_GENDER_LABELS[tenant.gender]
                  : EMPTY_VALUE,
            },
            { label: 'Email', value: tenant.email || EMPTY_VALUE },
            { label: 'Quê quán', value: tenant.hometown, fullWidth: true },
            { label: 'Ngày tạo hồ sơ', value: formatDateTime(tenant.createdAt) },
            {
              label: 'Cập nhật lần cuối',
              value: formatDateTime(tenant.updatedAt),
            },
          ]}
        />
      )}

      {isEditing && tenant && (
        <TenantFormModal
          mode="edit"
          tenant={tenant}
          onClose={() => setIsEditing(false)}
          onSaved={(saved) => {
            setIsEditing(false)
            setTenant(saved)
            showToast('Đã lưu thay đổi hồ sơ.')
          }}
        />
      )}

      {isDeleting && tenant && (
        <ConfirmDialog
          title="Xoá hồ sơ người thuê"
          message={`Bạn có chắc chắn muốn xoá hồ sơ "${tenant.fullName}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </AppLayout>
  )
}
