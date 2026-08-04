import { useState, type FormEvent } from 'react'
import { Modal } from '../shared/Modal'
import { Input } from '../auth/Input'
import { Button } from '../auth/Button'
import { Alert } from '../auth/Alert'
import { roomService } from '../../services/roomService'
import type { RoomDetail, RoomPayload } from '../../types/room'

interface RoomFormModalProps {
  mode: 'create' | 'edit'
  buildingId: string
  /** bắt buộc khi mode="edit" */
  room?: RoomDetail
  onClose: () => void
  onSaved: (room: RoomDetail) => void
}

export function RoomFormModal({
  mode,
  buildingId,
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
    room?.singleOccupantDiscountAmount != null
      ? String(room.singleOccupantDiscountAmount)
      : '',
  )

  const [nameError, setNameError] = useState<string>()
  const [basePriceError, setBasePriceError] = useState<string>()
  const [servicePriceError, setServicePriceError] = useState<string>()
  const [maxOccupancyError, setMaxOccupancyError] = useState<string>()
  const [singleDiscountError, setSingleDiscountError] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  // Rule khớp [Range]/[Required] thật ở CreateRoomRequest/UpdateRoomRequest (RoomDtos.cs)
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
  const validateServicePrice = () => {
    const n = Number(servicePrice)
    const err =
      servicePrice.trim() === '' || Number.isNaN(n) || n < 0
        ? 'Vui lòng nhập giá dịch vụ hợp lệ (>= 0).'
        : undefined
    setServicePriceError(err)
    return err
  }
  const validateMaxOccupancy = () => {
    const n = Number(maxOccupancy)
    const err =
      maxOccupancy.trim() === '' || !Number.isInteger(n) || n < 1
        ? 'Vui lòng nhập số người tối đa (>= 1).'
        : undefined
    setMaxOccupancyError(err)
    return err
  }
  const validateSingleDiscount = () => {
    if (singleDiscount.trim() === '') {
      setSingleDiscountError(undefined)
      return undefined
    }
    const n = Number(singleDiscount)
    const err =
      Number.isNaN(n) || n < 0 ? 'Giảm giá phải là số hợp lệ (>= 0).' : undefined
    setSingleDiscountError(err)
    return err
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = [
      validateName(),
      validateBasePrice(),
      validateServicePrice(),
      validateMaxOccupancy(),
      validateSingleDiscount(),
    ]
    if (errs.some(Boolean)) return

    setServerError(undefined)
    setIsLoading(true)
    try {
      const payload: RoomPayload = {
        buildingId,
        name: name.trim(),
        basePrice: Number(basePrice),
        servicePrice: Number(servicePrice),
        maxOccupancy: Number(maxOccupancy),
        singleOccupantDiscountAmount:
          singleDiscount.trim() === '' ? null : Number(singleDiscount),
      }
      const saved =
        mode === 'edit' && room
          ? await roomService.update(room.id, payload)
          : await roomService.create(payload)
      onSaved(saved)
    } catch (err) {
      const fieldErrors = roomService.getFieldErrors(err)
      if (fieldErrors) {
        if (fieldErrors.name) setNameError(fieldErrors.name)
        if (fieldErrors.basePrice) setBasePriceError(fieldErrors.basePrice)
        if (fieldErrors.servicePrice) setServicePriceError(fieldErrors.servicePrice)
        if (fieldErrors.maxOccupancy) setMaxOccupancyError(fieldErrors.maxOccupancy)
        if (fieldErrors.singleOccupantDiscountAmount) {
          setSingleDiscountError(fieldErrors.singleOccupantDiscountAmount)
        }
        return
      }
      setServerError(
        roomService.getErrorMessage(err) ?? 'Không thể lưu phòng. Vui lòng thử lại.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal title={mode === 'edit' ? 'Sửa phòng' : 'Thêm phòng'} onClose={onClose}>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Tên phòng"
          placeholder="P.101"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={validateName}
          error={nameError}
          disabled={isLoading}
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
          disabled={isLoading}
        />
        <Input
          label="Giá dịch vụ (VNĐ)"
          type="number"
          min={0}
          placeholder="300000"
          hint="Điện, nước, và các phí dịch vụ khác gộp chung"
          value={servicePrice}
          onChange={(e) => setServicePrice(e.target.value)}
          onBlur={validateServicePrice}
          error={servicePriceError}
          disabled={isLoading}
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
          disabled={isLoading}
        />
        <Input
          label="Giảm giá ở 1 mình (VNĐ)"
          type="number"
          min={0}
          placeholder="Để trống nếu không áp dụng"
          hint="Chỉ áp dụng khi phòng có đúng 1 người ở"
          value={singleDiscount}
          onChange={(e) => setSingleDiscount(e.target.value)}
          onBlur={validateSingleDiscount}
          error={singleDiscountError}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
