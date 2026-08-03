import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { api } from '../lib/axios'
import { isValidEmail } from '../lib/validation'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Input } from '../components/auth/Input'
import { PasswordInput } from '../components/auth/PasswordInput'
import { PasswordStrength } from '../components/auth/PasswordStrength'
import { Checkbox } from '../components/auth/Checkbox'
import { Button } from '../components/auth/Button'
import { Alert } from '../components/auth/Alert'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirm?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validators: Record<keyof FieldErrors, () => string | undefined> = {
    fullName: () => (fullName.trim() ? undefined : 'Vui lòng nhập họ tên.'),
    email: () =>
      !email.trim()
        ? 'Vui lòng nhập email.'
        : !isValidEmail(email)
          ? 'Email không đúng định dạng.'
          : undefined,
    password: () =>
      password.length >= 8 ? undefined : 'Mật khẩu phải có ít nhất 8 ký tự.',
    confirm: () =>
      confirm === password ? undefined : 'Mật khẩu xác nhận không khớp.',
  }

  const validateField = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }))

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/login'), 2000)
    return () => clearTimeout(t)
  }, [success, navigate])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {
      fullName: validators.fullName(),
      email: validators.email(),
      password: validators.password(),
      confirm: validators.confirm(),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setServerError(undefined)
    setIsLoading(true)
    try {
      // Backend hiện chỉ nhận email/password/role — chưa có chỗ chứa họ tên.
      // Role là enum số: 0 = Landlord (backend chưa bật JsonStringEnumConverter).
      await api.post('/accounts/register', { email, password, role: 0 })
      setSuccess(true)
    } catch (err) {
      setServerError(
        isAxiosError(err) && err.response?.status === 409
          ? 'Email này đã được đăng ký.'
          : 'Không thể kết nối máy chủ. Vui lòng thử lại.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản chủ trọ mới"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-fg transition-colors duration-150 hover:text-muted"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {success && (
        <Alert variant="success">
          Tạo tài khoản thành công. Đang chuyển về trang đăng nhập...
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Họ tên"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => validateField('fullName')}
          error={errors.fullName}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ban@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateField('email')}
          error={errors.email}
        />

        <div className="flex flex-col gap-2.5">
          <PasswordInput
            label="Mật khẩu"
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => validateField('password')}
            error={errors.password}
          />
          {password && <PasswordStrength password={password} />}
        </div>

        <PasswordInput
          label="Xác nhận mật khẩu"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => validateField('confirm')}
          error={errors.confirm}
        />

        <Checkbox
          label={
            <>
              Tôi đồng ý với{' '}
              <span className="font-semibold">điều khoản sử dụng</span>
            </>
          }
          checked={agree}
          onChange={setAgree}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!agree || success}
          className="w-full"
        >
          {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </Button>
      </form>
    </AuthLayout>
  )
}
