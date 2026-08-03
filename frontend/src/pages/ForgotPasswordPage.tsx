import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/axios'
import { isValidEmail } from '../lib/validation'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Input } from '../components/auth/Input'
import { Button } from '../components/auth/Button'
import { Alert } from '../components/auth/Alert'

const RESEND_COOLDOWN_SECONDS = 30

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string>()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const validateEmail = (value: string) =>
    !value.trim()
      ? 'Vui lòng nhập email.'
      : !isValidEmail(value)
        ? 'Email không đúng định dạng.'
        : undefined

  const send = async () => {
    setServerError(undefined)
    setIsLoading(true)
    try {
      // Backend luôn trả 200 dù email có tồn tại hay không (tránh lộ thông tin)
      await api.post('/accounts/forgot-password', { email })
      setSentTo(email)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      setServerError('Không thể kết nối máy chủ. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const err = validateEmail(email)
    setEmailError(err)
    if (err) return
    await send()
  }

  // Success state: thay form bằng thông báo + nút gửi lại có cooldown
  if (sentTo) {
    return (
      <AuthLayout
        title="Kiểm tra email"
        footer={
          <Link
            to="/login"
            className="font-semibold text-fg transition-colors duration-150 hover:text-muted"
          >
            Quay lại đăng nhập
          </Link>
        }
      >
        <Alert variant="success">
          Đã gửi email đặt lại mật khẩu tới{' '}
          <span className="font-semibold text-fg">{sentTo}</span>. Vui lòng kiểm
          tra hộp thư (kể cả mục spam).
        </Alert>
        {serverError && <Alert variant="error">{serverError}</Alert>}
        <Button
          variant="secondary"
          isLoading={isLoading}
          disabled={cooldown > 0}
          onClick={send}
          className="w-full"
        >
          {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại email'}
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận liên kết đặt lại mật khẩu"
      footer={
        <Link
          to="/login"
          className="font-semibold text-fg transition-colors duration-150 hover:text-muted"
        >
          Quay lại đăng nhập
        </Link>
      }
    >
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ban@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email))}
          error={emailError}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
        </Button>
      </form>
    </AuthLayout>
  )
}
