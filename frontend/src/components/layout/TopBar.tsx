import { Calendar, Plus, Search } from 'lucide-react'
import { dateRangeLabel } from '../../data/funnelsMockData'
import { DropdownPill } from '../ui/DropdownPill'
import { Button } from '../ui/Button'

export function TopBar() {
  return (
    <header className="flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="relative order-2 w-full flex-1 sm:order-1 sm:max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search..."
          aria-label="Search"
          className="w-full rounded-control border border-border bg-surface py-2 pl-9 pr-14 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[6px] border border-border bg-bg px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
          ⌘K
        </span>
      </div>

      <div className="order-1 ml-auto flex items-center gap-3 sm:order-2">
        <DropdownPill
          label={dateRangeLabel}
          icon={<Calendar size={16} className="text-text-muted" aria-hidden="true" />}
        />
        <Button variant="primary">
          <Plus size={16} aria-hidden="true" />
          New Report
        </Button>
      </div>
    </header>
  )
}
