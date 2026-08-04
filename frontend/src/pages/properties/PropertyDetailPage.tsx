import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Pencil } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DetailView } from '../../components/shared/DetailView'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { formatDateTime } from '../../lib/format'
import { propertyService } from '../../services/propertyService'
import type { PropertyDetail } from '../../types/property'
import { PropertyFormModal } from './PropertyFormModal'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  // ?edit=1 để trang khác (vd: trang Phòng khi hết hạn mức) link thẳng vào form sửa,
  // người dùng không phải tự mò tìm nút Sửa.
  const [searchParams, setSearchParams] = useSearchParams()

  const [property, setProperty] = useState<PropertyDetail>()
  const [error, setError] = useState<string>()
  const [editingProperty, setEditingProperty] = useState(
    () => searchParams.get('edit') === '1',
  )

  const closeEditModal = () => {
    setEditingProperty(false)
    // Bỏ query param đi, không thì F5 lại tự mở form lần nữa
    if (searchParams.has('edit')) {
      searchParams.delete('edit')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const loadProperty = async () => {
    if (!id) return
    try {
      setProperty(await propertyService.getById(id))
    } catch {
      setError('Không tìm thấy nhà trọ hoặc không thể tải dữ liệu.')
    }
  }

  useEffect(() => {
    loadProperty()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!id) return null

  return (
    <AppLayout>
      {error && <Alert variant="error">{error}</Alert>}

      {property && (
        <DetailView
          backTo="/properties"
          backLabel="Quay lại danh sách nhà trọ"
          title={property.name}
          subtitle={property.address}
          actions={
            <Button variant="secondary" onClick={() => setEditingProperty(true)}>
              <Pencil className="size-4" aria-hidden />
              Sửa
            </Button>
          }
          fields={[
            { label: 'Tổng số phòng', value: property.totalRooms },
            { label: 'Phòng trống', value: property.vacantRooms },
            { label: 'Phòng đã thuê', value: property.occupiedRooms },
            { label: 'Ngày tạo', value: formatDateTime(property.createdAt) },
            {
              label: 'Cập nhật lần cuối',
              value: formatDateTime(property.updatedAt),
            },
          ]}
        >
          <Link
            to={`/properties/${id}/rooms`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg transition-colors duration-150 hover:text-muted"
          >
            Xem danh sách phòng
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </DetailView>
      )}

      {editingProperty && property && (
        <PropertyFormModal
          property={property}
          onClose={closeEditModal}
          onSaved={() => {
            closeEditModal()
            loadProperty()
          }}
        />
      )}
    </AppLayout>
  )
}
