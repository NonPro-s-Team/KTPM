import { useState, type FormEvent } from 'react'
import { Modal } from '../shared/Modal'
import { Input } from '../auth/Input'
import { Select } from '../auth/Select'
import { Button } from '../auth/Button'
import { Alert } from '../auth/Alert'
import { isValidEmail } from '../../lib/validation'
import { tenantService } from '../../services/tenantService'
import {
  TENANT_GENDER_LABELS,
  TenantGender,
  type TenantDetail,
  type TenantGenderValue,
  type TenantPayload,
} from '../../types/tenant'

interface TenantFormModalProps {
  mode: 'create' | 'edit'
  /** bắt buộc khi mode="edit" */
  tenant?: TenantDetail
  onClose: () => void
  onSaved: (tenant: TenantDetail) => void
}

const genderOptions = Object.values(TenantGender).map((value) => ({
  value: String(value),
  label: TENANT_GENDER_LABELS[value],
}))

export function TenantFormModal({
  mode,
  tenant,
  onClose,
  onSaved,
}: TenantFormModalProps) {
  const [fullName, setFullName] = useState(tenant?.fullName ?? '')
  const [idNumber, setIdNumber] = useState(tenant?.idNumber ?? '')
  const [phoneNumber, setPhoneNumber] = useState(tenant?.phoneNumber ?? '')
  const [hometown, setHometown] = useState(tenant?.hometown ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(tenant?.dateOfBirth ?? '')
  const [gender, setGender] = useState(
    tenant?.gender != null ? String(tenant.gender) : '',
  )
  const [email, setEmail] = useState(tenant?.email ?? '')

  const [errors, setErrors] = useState<Partial<Record<keyof TenantPayload, string>>>({})
  const [serverError, setServerError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const setFieldError = (field: keyof TenantPayload, message?: string) =>
    setErrors((prev) => ({ ...prev, [field]: message }))

  // BE chỉ có [Required] cho 4 field bắt buộc và [EmailAddress] cho email — các rule định dạng
  // CCCD/SĐT bên dưới là CHẶT HƠN BE, thêm ở FE để bắt lỗi nhập liệu sớm. Nếu sau này BE nới
  // hoặc siết khác đi thì phải chỉnh lại cho khớp.
  const validators: Record<keyof TenantPayload, () => string | undefined> = {
    fullName: () => (fullName.trim() ? undefined : 'Vui lòng nhập họ tên.'),
    idNumber: () => {
      const value = idNumber.trim()
      if (!value) return 'Vui lòng nhập số CCCD/CMND.'
      if (!/^\d+$/.test(value)) return 'Số CCCD/CMND chỉ gồm chữ số.'
      if (value.length !== 9 && value.length !== 12) {
        return 'Số CCCD/CMND phải có 12 số (CCCD) hoặc 9 số (CMND).'
      }
      return undefined
    },
    phoneNumber: () => {
      const value = phoneNumber.trim()
      if (!value) return 'Vui lòng nhập số điện thoại.'
      if (!/^0\d{9}$/.test(value)) {
        return 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0.'
      }
      return undefined
    },
    hometown: () => (hometown.trim() ? undefined : 'Vui lòng nhập quê quán.'),
    dateOfBirth: () => {
      if (!dateOfBirth) return undefined
      // So sánh theo chuỗi yyyy-MM-dd nên không dính lệch múi giờ như khi new Date()
      const today = new Date().toLocaleDateString('en-CA')
      return dateOfBirth > today ? 'Ngày sinh không được ở tương lai.' : undefined
    },
    gender: () => undefined,
    email: () => {
      const value = email.trim()
      if (!value) return undefined
      return isValidEmail(value) ? undefined : 'Email không đúng định dạng.'
    },
  }

  const validateField = (field: keyof TenantPayload) =>
    setFieldError(field, validators[field]())

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors: Partial<Record<keyof TenantPayload, string>> = {}
    for (const key of Object.keys(validators) as (keyof TenantPayload)[]) {
      nextErrors[key] = validators[key]()
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setServerError(undefined)
    setIsLoading(true)
    try {
      const payload: TenantPayload = {
        fullName: fullName.trim(),
        idNumber: idNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        hometown: hometown.trim(),
        dateOfBirth: dateOfBirth || null,
        gender: gender === '' ? null : (Number(gender) as TenantGenderValue),
        email: email.trim() || null,
      }
      const saved =
        mode === 'edit' && tenant
          ? await tenantService.update(tenant.id, payload)
          : await tenantService.create(payload)
      onSaved(saved)
    } catch (err) {
      const fieldErrors = tenantService.getFieldErrors(err)
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
        return
      }
      // Trùng CCCD gắn được vào đúng field nên hiển thị inline ngay dưới ô đó,
      // thay vì đẩy lên banner chung ở đầu form.
      if (tenantService.isDuplicateIdNumberError(err)) {
        setFieldError(
          'idNumber',
          'Số CCCD/CMND này đã được dùng cho một hồ sơ người thuê khác.',
        )
        return
      }
      setServerError(
        tenantService.getErrorMessage(err) ??
          'Không thể lưu hồ sơ người thuê. Vui lòng thử lại.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={mode === 'edit' ? 'Sửa hồ sơ người thuê' : 'Thêm người thuê'}
      onClose={onClose}
      size="md"
    >
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Họ tên"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => validateField('fullName')}
          error={errors.fullName}
          disabled={isLoading}
        />
        <Input
          label="Số CCCD/CMND"
          inputMode="numeric"
          placeholder="079200011111"
          hint="12 số với CCCD, 9 số với CMND cũ"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          onBlur={() => validateField('idNumber')}
          error={errors.idNumber}
          disabled={isLoading}
        />
        <Input
          label="Số điện thoại"
          inputMode="tel"
          placeholder="0901234567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onBlur={() => validateField('phoneNumber')}
          error={errors.phoneNumber}
          disabled={isLoading}
        />
        <Input
          label="Quê quán"
          placeholder="Quảng Ngãi"
          value={hometown}
          onChange={(e) => setHometown(e.target.value)}
          onBlur={() => validateField('hometown')}
          error={errors.hometown}
          disabled={isLoading}
        />
        <Input
          label="Ngày sinh"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          onBlur={() => validateField('dateOfBirth')}
          error={errors.dateOfBirth}
          hint="Không bắt buộc"
          disabled={isLoading}
        />
        <Select
          label="Giới tính"
          options={genderOptions}
          placeholder="— Không chọn —"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          hint="Không bắt buộc"
          disabled={isLoading}
        />
        <Input
          label="Email"
          type="email"
          placeholder="nguoithue@email.com"
          hint="Chỉ dùng để liên hệ, không phải email đăng nhập"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateField('email')}
          error={errors.email}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm người thuê'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
