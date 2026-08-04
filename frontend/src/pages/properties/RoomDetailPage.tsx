import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DetailView } from '../../components/shared/DetailView'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { useToast } from '../../components/shared/Toast'
import { EMPTY_VALUE, formatCurrency, formatDateTime } from '../../lib/format'
import { roomService } from '../../services/roomService'
import type { RoomDetail } from '../../types/room'
import { RoomFormModal } from '../../components/properties/RoomFormModal'

export default function RoomDetailPage() {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [room, setRoom] = useState<RoomDetail>()
  const [error, setError] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const roomsListPath = `/properties/${propertyId}/rooms`

  const load = async () => {
    if (!roomId) return
    setError(undefined)
    try {
      setRoom(await roomService.getById(roomId))
    } catch (err) {
      setError(
        roomService.getErrorMessage(err) ??
          'Không tìm thấy phòng hoặc không thể tải dữ liệu.',
      )
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const handleDelete = async () => {
    if (!room) return
    await roomService.remove(room.id)
    setIsDeleting(false)
    showToast('Đã xoá phòng.')
    navigate(roomsListPath)
  }

  if (!propertyId || !roomId) return null

  return (
    <AppLayout>
      {error && <Alert variant="error">{error}</Alert>}

      {room && (
        <DetailView
          backTo={roomsListPath}
          backLabel="Quay lại danh sách phòng"
          title={room.name}
          subtitle={room.buildingName}
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
            { label: 'Giá phòng', value: formatCurrency(room.basePrice) },
            { label: 'Giá dịch vụ', value: formatCurrency(room.servicePrice) },
            { label: 'Số người tối đa', value: room.maxOccupancy },
            {
              label: 'Giảm giá ở 1 mình',
              value:
                room.singleOccupantDiscountAmount != null
                  ? formatCurrency(room.singleOccupantDiscountAmount)
                  : EMPTY_VALUE,
            },
            { label: 'Ngày tạo', value: formatDateTime(room.createdAt) },
            { label: 'Cập nhật lần cuối', value: formatDateTime(room.updatedAt) },
          ]}
        />
      )}

      {isEditing && room && (
        <RoomFormModal
          mode="edit"
          buildingId={room.buildingId}
          room={room}
          onClose={() => setIsEditing(false)}
          onSaved={(saved) => {
            setIsEditing(false)
            setRoom(saved)
            showToast('Đã lưu thay đổi phòng.')
          }}
        />
      )}

      {isDeleting && room && (
        <ConfirmDialog
          title="Xoá phòng"
          message={`Bạn có chắc chắn muốn xoá "${room.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </AppLayout>
  )
}
