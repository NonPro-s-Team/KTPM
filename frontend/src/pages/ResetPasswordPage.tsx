import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Check, X } from 'lucide-react'
import { api } from '../lib/axios'
import { passwordChecks } from '../lib/validation'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordInput } from '../components/auth/PasswordInput'
import { Button } from '../components/auth/Button'
import { Alert } from '../components/auth/Alert'

const ruleLabels: { key: keyof ReturnType<typeof passwordChecks>; label: string }[] = [
  { key: 'minLength', label: 'Ít nhất 8 ký tự' },
  { key: 'hasUppercase', label: 'Có chữ in hoa' },
  { key: 'hasNumber', label: 'Có chữ số' },
]

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [confirmError, setConfirmError] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [tokenInvalid, setTokenInvalid] = useState(!token)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const checks = passwordChecks(password)
  const allChecksPassed = Object.values(checks).every(Boolean)

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/login'), 2000)
    return () => clearTimeout(t)
  }, [success, navigate])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const confirmErr =
      confirm === password ? undefined : 'Mật khẩu xác nhận không khớp.'
    setConfirmError(confirmErr)
    if (!allChecksPassed || confirmErr) return

    setServerError(undefined)
    setIsLoading(true)
    try {
      await api.post('/accounts/reset-password', {
        token,
        newPassword: password,
      })
      setSuccess(true)
    } catch (err) {
      if (isAxiosError(err) && err.response && err.response.status < 500) {
        setTokenInvalid(true)
      } else {
        setServerError('Không thể kết nối máy chủ. Vui lòng thử lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Token thiếu / không hợp lệ / hết hạn
  if (tokenInvalid) {
    return (
      <AuthLayout title="Liên kết không hợp lệ">
        <Alert variant="error">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
          cầu liên kết mới.
        </Alert>
        <Button onClick={() => navigate('/forgot-password')} className="w-full">
          Yêu cầu liên kết mới
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {success && (
        <Alert variant="success">
          Mật khẩu đã được đặt lại. Đang chuyển về trang đăng nhập...
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <PasswordInput
            label="Mật khẩu mới"
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Checklist điều kiện — icon check/x cập nhật real-time khi gõ */}
          <ul className="flex flex-col gap-1.5">
            {ruleLabels.map(({ key, label }) => {
              const passed = checks[key]
              return (
                <li
                  key={key}
                  className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
                    passed ? 'text-fg' : 'text-muted'
                  }`}
                >
                  {passed ? (
                    <Check className="size-3.5" aria-hidden />
                  ) : (
                    <X className="size-3.5" aria-hidden />
                  )}
                  {label}
                </li>
              )
            })}
          </ul>
        </div>

        <PasswordInput
          label="Xác nhận mật khẩu"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() =>
            setConfirmError(
              confirm === password ? undefined : 'Mật khẩu xác nhận không khớp.',
            )
          }
          error={confirmError}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={success}
          className="w-full"
        >
          {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </AuthLayout>
  )
}
