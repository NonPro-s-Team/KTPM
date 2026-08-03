import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { api } from '../lib/axios'
import { isValidEmail } from '../lib/validation'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Input } from '../components/auth/Input'
import { PasswordInput } from '../components/auth/PasswordInput'
import { Checkbox } from '../components/auth/Checkbox'
import { Button } from '../components/auth/Button'
import { Alert } from '../components/auth/Alert'

interface LoginResponse {
  token: string
  expiresAt: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (value: string) =>
    !value.trim()
      ? 'Vui lòng nhập email.'
      : !isValidEmail(value)
        ? 'Email không đúng định dạng.'
        : undefined

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    const passwordErr = password ? undefined : 'Vui lòng nhập mật khẩu.'
    setEmailError(emailErr)
    setPasswordError(passwordErr)
    if (emailErr || passwordErr) return

    setServerError(undefined)
    setIsLoading(true)
    try {
      const { data } = await api.post<LoginResponse>('/accounts/login', {
        email,
        password,
      })
      // "Ghi nhớ đăng nhập": localStorage giữ qua phiên, sessionStorage mất khi đóng tab
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('troconnect_token', data.token)
      navigate('/') // TODO: đổi sang /dashboard khi có trang dashboard
    } catch (err) {
      setServerError(
        isAxiosError(err) && err.response?.status === 401
          ? 'Email hoặc mật khẩu không đúng.'
          : 'Không thể kết nối máy chủ. Vui lòng thử lại.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Quản lý nhà trọ của bạn"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-fg transition-colors duration-150 hover:text-muted"
          >
            Đăng ký
          </Link>
        </>
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

        <PasswordInput
          label="Mật khẩu"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() =>
            setPasswordError(password ? undefined : 'Vui lòng nhập mật khẩu.')
          }
          error={passwordError}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Ghi nhớ đăng nhập"
            checked={remember}
            onChange={setRemember}
          />
          <Link
            to="/forgot-password"
            className="text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </AuthLayout>
  )
}
