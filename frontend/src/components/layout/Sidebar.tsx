import {
  Activity,
  BarChart2,
  Briefcase,
  Filter,
  Gauge,
  LayoutGrid,
  Layers,
  Megaphone,
  MoreVertical,
  PieChart,
  Puzzle,
  Settings,
  User,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: LucideIcon
  active?: boolean
}

interface NavSection {
  label: string
  items: NavItem[]
}

const topLevelItem: NavItem = { label: 'Overview', icon: LayoutGrid }

const sections: NavSection[] = [
  {
    label: 'Analytics',
    items: [
      { label: 'Reports', icon: Gauge },
      { label: 'Funnels', icon: Filter, active: true },
      { label: 'Cohorts', icon: Layers },
      { label: 'Insights', icon: BarChart2 },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Users', icon: User },
      { label: 'Accounts', icon: Briefcase },
      { label: 'Segments', icon: PieChart },
      { label: 'Activity', icon: Activity },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Integrations', icon: Puzzle },
      { label: 'Automations', icon: Zap },
      { label: 'Campaigns', icon: Megaphone },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Teams', icon: Users },
      { label: 'Settings', icon: Settings },
      { label: 'Billings', icon: Briefcase },
    ],
  },
]

function NavLink({ label, icon: Icon, active }: NavItem) {
  return (
    <a
      href="#"
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active
          ? 'bg-primary-soft text-primary'
          : 'text-text-secondary hover:bg-bg hover:text-text-primary'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-x-3 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </a>
  )
}

export function Sidebar() {
  return (
    <nav
      aria-label="Main navigation"
      className="flex h-full w-(--sidebar-width) shrink-0 flex-col border-r border-border bg-surface px-4 py-6"
    >
      <div className="mb-6 flex items-center gap-2 px-2 text-lg font-bold text-text-primary">
        <span
          className="inline-block size-7 rounded-full bg-gradient-to-br from-(--color-primary) to-(--color-teal)"
          aria-hidden="true"
        />
        <span>
          RevenuePulse
          <span className="bg-gradient-to-r from-(--color-primary) to-(--color-teal) bg-clip-text text-transparent">
            AI
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="px-2">
          <NavLink {...topLevelItem} />
        </div>

        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavLink key={item.label} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
          aria-hidden="true"
        >
          AM
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">Alex Morgan</p>
          <p className="truncate text-xs text-text-secondary">Admin</p>
        </div>
        <button
          type="button"
          aria-label="Account menu"
          className="inline-flex size-8 items-center justify-center rounded-control text-text-muted hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
