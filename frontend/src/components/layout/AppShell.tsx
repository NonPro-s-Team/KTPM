import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
    </div>
  )
}
