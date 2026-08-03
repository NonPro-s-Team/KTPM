import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Link điều hướng hiển thị dưới card (vd: "Chưa có tài khoản? Đăng ký") */
  footer?: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase"
        >
          <span className="size-3 bg-fg" aria-hidden />
          TroConnect
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6 border border-border p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
            {children}
          </div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          )}
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-xs tracking-widest uppercase text-muted">
        © 2026 TroConnect
      </footer>
    </div>
  )
}
