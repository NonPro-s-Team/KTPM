import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, DoorOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DataTable } from '../../components/shared/DataTable'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { propertyService } from '../../services/propertyService'
import { roomService } from '../../services/roomService'
import type { PropertyDetail } from '../../types/property'
import type { Room } from '../../types/room'
import { PropertyFormModal } from './PropertyFormModal'
import { RoomFormModal } from './RoomFormModal'

const currency = new Intl.NumberFormat('vi-VN')

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [property, setProperty] = useState<PropertyDetail>()
  const [rooms, setRooms] = useState<Room[]>()
  const [error, setError] = useState<string>()
  const [editingProperty, setEditingProperty] = useState(false)
  const [roomFormTarget, setRoomFormTarget] = useState<Room | 'new'>()
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room>()

  const loadProperty = async () => {
    if (!id) return
    try {
      setProperty(await propertyService.getById(id))
    } catch {
      setError('Không tìm thấy nhà trọ hoặc không thể tải dữ liệu.')
    }
  }

  const loadRooms = async () => {
    if (!id) return
    setRooms(await roomService.getByPropertyId(id))
  }

  useEffect(() => {
    loadProperty()
    loadRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleDeleteRoom = async () => {
    if (!deleteRoomTarget) return
    await roomService.remove(deleteRoomTarget.id)
    setDeleteRoomTarget(undefined)
    loadRooms()
  }

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
        <>
          <div className="mb-8 flex items-start justify-between gap-4 border border-border p-6">
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
            </div>
            <Button variant="secondary" onClick={() => setEditingProperty(true)}>
              <Pencil className="size-4" aria-hidden />
              Sửa
            </Button>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Phòng</h2>
            <Button onClick={() => setRoomFormTarget('new')}>
              <Plus className="size-4" aria-hidden />
              Thêm phòng
            </Button>
          </div>

          {rooms === undefined ? (
            <p className="text-sm text-muted">Đang tải...</p>
          ) : rooms.length === 0 ? (
            <EmptyState
              icon={DoorOpen}
              title="Chưa có phòng nào"
              description="Thêm phòng đầu tiên cho nhà trọ này."
              action={
                <Button variant="secondary" onClick={() => setRoomFormTarget('new')}>
                  Thêm phòng
                </Button>
              }
            />
          ) : (
            <DataTable
              data={rooms}
              keyField={(r) => r.id}
              cardTitle={(r) => r.name}
              columns={[
                { header: 'Tên phòng', hideOnCard: true, render: (r) => r.name },
                {
                  header: 'Giá phòng',
                  render: (r) => `${currency.format(r.basePrice)} đ`,
                },
                {
                  header: 'Giá dịch vụ',
                  render: (r) => `${currency.format(r.servicePrice)} đ`,
                },
                { header: 'Số người tối đa', render: (r) => r.maxOccupancy },
                {
                  header: 'Giảm giá ở 1 mình',
                  render: (r) =>
                    r.singleOccupantDiscount != null
                      ? `${currency.format(r.singleOccupantDiscount)} đ`
                      : '—',
                },
              ]}
              actions={(r) => (
                <>
                  <button
                    type="button"
                    onClick={() => setRoomFormTarget(r)}
                    aria-label={`Sửa ${r.name}`}
                    className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteRoomTarget(r)}
                    aria-label={`Xoá ${r.name}`}
                    className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </>
              )}
            />
          )}
        </>
      )}

      {editingProperty && property && (
        <PropertyFormModal
          property={property}
          onClose={() => setEditingProperty(false)}
          onSaved={() => {
            setEditingProperty(false)
            loadProperty()
          }}
        />
      )}

      {roomFormTarget && (
        <RoomFormModal
          propertyId={id}
          room={roomFormTarget === 'new' ? undefined : roomFormTarget}
          onClose={() => setRoomFormTarget(undefined)}
          onSaved={() => {
            setRoomFormTarget(undefined)
            loadRooms()
          }}
        />
      )}

      {deleteRoomTarget && (
        <ConfirmDialog
          title="Xoá phòng"
          message={`Bạn có chắc chắn muốn xoá "${deleteRoomTarget.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDeleteRoom}
          onCancel={() => setDeleteRoomTarget(undefined)}
        />
      )}
    </AppLayout>
  )
}
