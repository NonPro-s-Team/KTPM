import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
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
      <Link
        to="/properties"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Quay lại danh sách nhà trọ
      </Link>

      {error && <Alert variant="error">{error}</Alert>}

      {property && (
        <div className="flex items-start justify-between gap-4 border border-border p-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{property.name}</h1>
            <p className="mt-1 text-sm text-muted">{property.address}</p>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <dt className="text-muted">Tổng số phòng</dt>
                <dd className="font-semibold">{property.totalRooms}</dd>
              </div>
              <div>
                <dt className="text-muted">Phòng trống</dt>
                <dd className="font-semibold">{property.vacantRooms}</dd>
              </div>
              <div>
                <dt className="text-muted">Phòng đã thuê</dt>
                <dd className="font-semibold">{property.occupiedRooms}</dd>
              </div>
            </dl>
            <Link
              to={`/properties/${id}/rooms`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg transition-colors duration-150 hover:text-muted"
            >
              Xem danh sách phòng
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Button variant="secondary" onClick={() => setEditingProperty(true)}>
            <Pencil className="size-4" aria-hidden />
            Sửa
          </Button>
        </div>
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
