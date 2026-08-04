import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, DoorOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DataTable } from '../../components/shared/DataTable'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { TableSkeleton } from '../../components/shared/TableSkeleton'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { useToast } from '../../components/shared/Toast'
import { propertyService } from '../../services/propertyService'
import { roomService } from '../../services/roomService'
import type { Property } from '../../types/property'
import type { Room, RoomDetail } from '../../types/room'
import { RoomFormModal } from '../../components/properties/RoomFormModal'

const currency = new Intl.NumberFormat('vi-VN')

const ROOM_LIMIT_TOOLTIP =
  'Đã đạt giới hạn phòng, tăng Tổng số phòng của nhà trọ để thêm mới'

export default function PropertyRoomsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { showToast } = useToast()

  const [property, setProperty] = useState<Property>()
  const [rooms, setRooms] = useState<Room[]>()
  const [error, setError] = useState<string>()

  // 'new' = tạo mới; RoomDetail = sửa (đã fetch đủ field vì list DTO thiếu servicePrice/discount)
  const [formTarget, setFormTarget] = useState<RoomDetail | 'new'>()
  const [loadingEditId, setLoadingEditId] = useState<string>()
  const [deleteTarget, setDeleteTarget] = useState<Room>()

  const load = async () => {
    if (!propertyId) return
    setError(undefined)
    try {
      const [propertyResult, roomsResult] = await Promise.all([
        propertyService.getById(propertyId),
        roomService.getByBuildingId(propertyId),
      ])
      setProperty(propertyResult)
      setRooms(roomsResult)
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId])

  const openEdit = async (room: Room) => {
    setLoadingEditId(room.id)
    try {
      setFormTarget(await roomService.getById(room.id))
    } catch {
      showToast('Không thể tải thông tin phòng.', 'error')
    } finally {
      setLoadingEditId(undefined)
    }
  }

  const handleSaved = (mode: 'create' | 'edit') => {
    setFormTarget(undefined)
    showToast(mode === 'edit' ? 'Đã lưu thay đổi phòng.' : 'Đã thêm phòng mới.')
    load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await roomService.remove(deleteTarget.id)
    setDeleteTarget(undefined)
    showToast('Đã xoá phòng.')
    load()
  }

  // Check giới hạn phòng ngay trên client bằng dữ liệu ĐÃ có sẵn (số phòng đang render +
  // property.totalRooms) — không gọi thêm API, và không để người dùng gõ hết form rồi mới
  // báo lỗi. BE vẫn giữ check của nó làm lớp bảo vệ cuối cho race condition (2 tab cùng thêm).
  // `load()` chạy lại sau mỗi lần thêm/xoá nên trạng thái này tự cập nhật real-time.
  const isAtRoomLimit =
    rooms !== undefined && property !== undefined && rooms.length >= property.totalRooms

  const roomLimitMessage = property
    ? `Nhà trọ này đã đạt giới hạn ${property.totalRooms} phòng. Vui lòng tăng Tổng số phòng ở trang chỉnh sửa nhà trọ trước khi thêm phòng mới.`
    : ''

  const handleOpenCreate = () => {
    if (isAtRoomLimit) {
      showToast(roomLimitMessage, 'error')
      return
    }
    setFormTarget('new')
  }

  if (!propertyId) return null

  return (
    <AppLayout>
      <Link
        to={`/properties/${propertyId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Quay lại {property ? property.name : 'nhà trọ'}
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Phòng {property && `— ${property.name}`}
        </h1>
        <Button
          onClick={handleOpenCreate}
          disabled={isAtRoomLimit}
          title={isAtRoomLimit ? ROOM_LIMIT_TOOLTIP : undefined}
        >
          <Plus className="size-4" aria-hidden />
          Thêm phòng
        </Button>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Giải thích ngay vì sao nút "Thêm phòng" bị vô hiệu, kèm lối tắt đi tăng giới hạn —
          nút disabled mà không nói lý do thì người dùng không biết phải làm gì tiếp. */}
      {isAtRoomLimit && property && (
        <div className="mb-6">
          <Alert variant="info">
            {roomLimitMessage}{' '}
            <Link
              to={`/properties/${propertyId}?edit=1`}
              className="font-semibold text-fg underline transition-colors duration-150 hover:text-muted"
            >
              Tăng Tổng số phòng
            </Link>
          </Alert>
        </div>
      )}

      {rooms === undefined && !error ? (
        <TableSkeleton columns={3} />
      ) : rooms && rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="Chưa có phòng nào"
          description="Thêm phòng đầu tiên cho nhà trọ này."
          action={
            // Vẫn phải check: nhà trọ khai báo TotalRooms = 0 thì 0 >= 0, hết hạn mức ngay
            // cả khi chưa có phòng nào.
            <Button
              variant="secondary"
              onClick={handleOpenCreate}
              disabled={isAtRoomLimit}
              title={isAtRoomLimit ? ROOM_LIMIT_TOOLTIP : undefined}
            >
              Thêm phòng đầu tiên
            </Button>
          }
        />
      ) : rooms ? (
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
            { header: 'Số người tối đa', render: (r) => r.maxOccupancy },
          ]}
          actions={(r) => (
            <>
              <button
                type="button"
                onClick={() => openEdit(r)}
                disabled={loadingEditId === r.id}
                aria-label={`Sửa ${r.name}`}
                className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg disabled:cursor-wait disabled:opacity-50"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(r)}
                aria-label={`Xoá ${r.name}`}
                className="cursor-pointer text-muted transition-colors duration-150 hover:text-fg"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </>
          )}
        />
      ) : null}

      {formTarget && (
        <RoomFormModal
          mode={formTarget === 'new' ? 'create' : 'edit'}
          buildingId={propertyId}
          room={formTarget === 'new' ? undefined : formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={() => handleSaved(formTarget === 'new' ? 'create' : 'edit')}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá phòng"
          message={`Bạn có chắc chắn muốn xoá "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(undefined)}
        />
      )}
    </AppLayout>
  )
}
