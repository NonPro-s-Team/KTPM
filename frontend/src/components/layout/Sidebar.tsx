import type { LucideIcon } from 'lucide-react'
import { Building2, PanelLeftClose, PanelLeftOpen, Users } from 'lucide-react'
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
  {
    label: 'Người thuê',
    icon: Users,
    items: [{ label: 'Hồ sơ người thuê', to: '/tenants' }],
  },
]

interface SidebarProps {
  onNavigate?: () => void
  /** Chỉ dùng cho sidebar cố định desktop — drawer mobile luôn hiện đầy đủ */
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export function Sidebar({ onNavigate, collapsed, onToggleCollapsed }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/properties"
        onClick={onNavigate}
        className={`flex items-center gap-2 border-b border-border py-5 text-sm font-bold tracking-widest uppercase ${
          collapsed ? 'justify-center px-2' : 'px-6'
        }`}
      >
        <span className="size-3 shrink-0 bg-fg" aria-hidden />
        {!collapsed && 'TroConnect'}
      </Link>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            {collapsed ? (
              // Mỗi group hiện 1 nhóm duy nhất 1 mục — thu gọn xuống 1 icon trỏ thẳng
              // vào mục đó. Khi group có nhiều mục, chỗ này cần đổi sang flyout/tooltip menu.
              <Link
                to={group.items[0].to}
                onClick={onNavigate}
                title={group.label}
                className={`flex justify-center border-l-2 py-2.5 transition-colors duration-150 ${
                  location.pathname.startsWith(group.items[0].to)
                    ? 'border-fg text-fg'
                    : 'border-transparent text-muted hover:border-border hover:text-fg'
                }`}
              >
                <group.icon className="size-4" aria-hidden />
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        ))}
      </nav>

      <div
        className={`border-t border-border py-4 ${
          collapsed ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between px-6'
        }`}
      >
        <ThemeToggle />
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            className="cursor-pointer border border-border p-2 text-muted transition-colors duration-150 hover:border-border-strong hover:text-fg"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
