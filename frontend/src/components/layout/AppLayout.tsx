import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <div className="fixed h-screen w-64">
          <Sidebar />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-fg/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-bg">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
                className="cursor-pointer p-2 text-muted transition-colors duration-150 hover:text-fg"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-border px-4 py-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            className="cursor-pointer p-1 text-fg"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <span className="ml-3 text-sm font-bold tracking-widest uppercase">
            TroConnect
          </span>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
