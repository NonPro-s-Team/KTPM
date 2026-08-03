import type { LucideIcon } from 'lucide-react'
import { Building2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../auth/ThemeToggle'

interface NavItem {
  label: string
  to: string
}

interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

// Mỗi module (Hợp đồng, Hóa đơn, Hồ sơ khách thuê...) thêm 1 NavGroup mới ở đây khi
// module đó thực sự có route — chưa build trước cho module chưa tồn tại.
const navGroups: NavGroup[] = [
  {
    label: 'Nhà trọ',
    icon: Building2,
    items: [{ label: 'Danh sách nhà trọ', to: '/properties' }],
  },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/properties"
        onClick={onNavigate}
        className="flex items-center gap-2 border-b border-border px-6 py-5 text-sm font-bold tracking-widest uppercase"
      >
        <span className="size-3 bg-fg" aria-hidden />
        TroConnect
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold tracking-widest text-muted uppercase">
              <group.icon className="size-3.5" aria-hidden />
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={`border-l-2 px-4 py-2 text-sm transition-colors duration-150 ${
                      active
                        ? 'border-fg font-medium text-fg'
                        : 'border-transparent text-muted hover:border-border hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4">
        <ThemeToggle />
      </div>
    </div>
  )
}
