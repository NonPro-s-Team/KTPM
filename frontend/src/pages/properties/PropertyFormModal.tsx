import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/shared/Modal'
import { Input } from '../../components/auth/Input'
import { Button } from '../../components/auth/Button'
import { Alert } from '../../components/auth/Alert'
import { propertyService } from '../../services/propertyService'
import type { DuplicatePropertyInfo, Property } from '../../types/property'

interface PropertyFormModalProps {
  /** undefined = tạo mới, truyền vào = sửa */
  property?: Property
  onClose: () => void
  onSaved: () => void
}

export function PropertyFormModal({
  property,
  onClose,
  onSaved,
}: PropertyFormModalProps) {
  const [name, setName] = useState(property?.name ?? '')
  const [address, setAddress] = useState(property?.address ?? '')
  const [totalRooms, setTotalRooms] = useState(
    property ? String(property.totalRooms) : '',
  )
  const [nameError, setNameError] = useState<string>()
  const [addressError, setAddressError] = useState<string>()
  const [totalRoomsError, setTotalRoomsError] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [duplicate, setDuplicate] = useState<DuplicatePropertyInfo>()
  const [isLoading, setIsLoading] = useState(false)

  const validateName = () => {
    const err = name.trim() ? undefined : 'Vui lòng nhập tên nhà trọ.'
    setNameError(err)
    return err
  }
  const validateAddress = () => {
    const err = address.trim() ? undefined : 'Vui lòng nhập địa chỉ.'
    setAddressError(err)
    return err
  }
  const validateTotalRooms = () => {
    const n = Number(totalRooms)
    const err =
      totalRooms.trim() === '' || Number.isNaN(n) || n < 0
        ? 'Vui lòng nhập số phòng hợp lệ (>= 0).'
        : undefined
    setTotalRoomsError(err)
    return err
  }

  const submit = async (confirmDuplicate = false) => {
    setServerError(undefined)
    setIsLoading(true)
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        totalRooms: Number(totalRooms),
      }
      if (property) {
        await propertyService.update(property.id, payload)
      } else {
        await propertyService.create({ ...payload, confirmDuplicate })
      }
      onSaved()
    } catch (err) {
      const dup = !property ? propertyService.getDuplicateInfo(err) : null
      if (dup) {
        setDuplicate(dup)
      } else {
        setServerError('Không thể lưu nhà trọ. Vui lòng thử lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = [validateName(), validateAddress(), validateTotalRooms()]
    if (errs.some(Boolean)) return
    await submit(false)
  }

  return (
    <Modal title={property ? 'Sửa nhà trọ' : 'Thêm nhà trọ'} onClose={onClose}>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      {duplicate ? (
        <div className="flex flex-col gap-4">
          <Alert variant="info">
            Đã có nhà trọ tại địa chỉ này:{' '}
            <span className="font-semibold text-fg">{duplicate.name}</span>. Bạn
            có chắc muốn tạo thêm một nhà trọ khác cùng địa chỉ không?
          </Alert>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDuplicate(undefined)}
              disabled={isLoading}
            >
              Huỷ
            </Button>
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={() => submit(true)}
            >
              Vẫn tạo mới
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            label="Tên nhà trọ"
            placeholder="Nhà trọ Bình Thạnh"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={validateName}
            error={nameError}
          />
          <Input
            label="Địa chỉ"
            placeholder="123 Điện Biên Phủ, Bình Thạnh"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={validateAddress}
            error={addressError}
          />
          <Input
            label="Tổng số phòng"
            type="number"
            min={0}
            placeholder="10"
            value={totalRooms}
            onChange={(e) => setTotalRooms(e.target.value)}
            onBlur={validateTotalRooms}
            error={totalRoomsError}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Huỷ
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {property ? 'Lưu thay đổi' : 'Tạo nhà trọ'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
