import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/shared/Modal'
import { Input } from '../../components/auth/Input'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { roomService } from '../../services/roomService'
import type { Room } from '../../types/room'

interface RoomFormModalProps {
  propertyId: string
  /** undefined = tạo mới, truyền vào = sửa */
  room?: Room
  onClose: () => void
  onSaved: () => void
}

export function RoomFormModal({
  propertyId,
  room,
  onClose,
  onSaved,
}: RoomFormModalProps) {
  const [name, setName] = useState(room?.name ?? '')
  const [basePrice, setBasePrice] = useState(room ? String(room.basePrice) : '')
  const [servicePrice, setServicePrice] = useState(
    room ? String(room.servicePrice) : '',
  )
  const [maxOccupancy, setMaxOccupancy] = useState(
    room ? String(room.maxOccupancy) : '',
  )
  const [singleDiscount, setSingleDiscount] = useState(
    room?.singleOccupantDiscount != null ? String(room.singleOccupantDiscount) : '',
  )
  const [nameError, setNameError] = useState<string>()
  const [basePriceError, setBasePriceError] = useState<string>()
  const [maxOccupancyError, setMaxOccupancyError] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const validateName = () => {
    const err = name.trim() ? undefined : 'Vui lòng nhập tên phòng.'
    setNameError(err)
    return err
  }
  const validateBasePrice = () => {
    const n = Number(basePrice)
    const err =
      basePrice.trim() === '' || Number.isNaN(n) || n < 0
        ? 'Vui lòng nhập giá phòng hợp lệ (>= 0).'
        : undefined
    setBasePriceError(err)
    return err
  }
  const validateMaxOccupancy = () => {
    const n = Number(maxOccupancy)
    const err =
      maxOccupancy.trim() === '' || Number.isNaN(n) || n < 1
        ? 'Vui lòng nhập số người tối đa (>= 1).'
        : undefined
    setMaxOccupancyError(err)
    return err
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = [validateName(), validateBasePrice(), validateMaxOccupancy()]
    if (errs.some(Boolean)) return

    setServerError(undefined)
    setIsLoading(true)
    try {
      const payload = {
        name: name.trim(),
        basePrice: Number(basePrice),
        servicePrice: servicePrice.trim() === '' ? 0 : Number(servicePrice),
        maxOccupancy: Number(maxOccupancy),
        singleOccupantDiscount:
          singleDiscount.trim() === '' ? null : Number(singleDiscount),
      }
      if (room) {
        await roomService.update(room.id, payload)
      } else {
        await roomService.create(propertyId, payload)
      }
      onSaved()
    } catch {
      setServerError('Không thể lưu phòng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal title={room ? 'Sửa phòng' : 'Thêm phòng'} onClose={onClose}>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Tên phòng"
          placeholder="P.101"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={validateName}
          error={nameError}
        />
        <Input
          label="Giá phòng (VNĐ)"
          type="number"
          min={0}
          placeholder="2500000"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          onBlur={validateBasePrice}
          error={basePriceError}
        />
        <Input
          label="Giá dịch vụ (VNĐ)"
          type="number"
          min={0}
          placeholder="300000"
          hint="Điện, nước, và các phí dịch vụ khác gộp chung"
          value={servicePrice}
          onChange={(e) => setServicePrice(e.target.value)}
        />
        <Input
          label="Số người tối đa"
          type="number"
          min={1}
          placeholder="2"
          value={maxOccupancy}
          onChange={(e) => setMaxOccupancy(e.target.value)}
          onBlur={validateMaxOccupancy}
          error={maxOccupancyError}
        />
        <Input
          label="Giảm giá ở 1 mình (VNĐ)"
          type="number"
          min={0}
          placeholder="Để trống nếu không áp dụng"
          hint="Chỉ áp dụng khi phòng có đúng 1 người ở"
          value={singleDiscount}
          onChange={(e) => setSingleDiscount(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {room ? 'Lưu thay đổi' : 'Thêm phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
