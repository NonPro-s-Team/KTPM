import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../auth/ThemeToggle'

const navItems = [{ to: '/properties', label: 'Nhà trọ' }]

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            to="/properties"
            className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase"
          >
            <span className="size-3 bg-fg" aria-hidden />
            TroConnect
          </Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium tracking-wide transition-colors duration-150 ${
                    active ? 'text-fg' : 'text-muted hover:text-fg'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
