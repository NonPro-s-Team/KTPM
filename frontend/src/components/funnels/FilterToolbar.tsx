import { useState } from 'react'
import { LayoutGrid, List, MoreVertical, Table2 } from 'lucide-react'
import { funnelFilterOptions } from '../../data/funnelsMockData'
import { DropdownPill } from '../ui/DropdownPill'
import { IconButton } from '../ui/IconButton'
import { Toggle } from '../ui/Toggle'

const viewOptions = [
  { id: 'grid', label: 'Grid view', icon: LayoutGrid },
  { id: 'list', label: 'List view', icon: List },
  { id: 'table', label: 'Table view', icon: Table2 },
]

export function FilterToolbar() {
  const [compare, setCompare] = useState(false)
  const [activeView, setActiveView] = useState('grid')

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <DropdownPill label={funnelFilterOptions.funnel} />
        <DropdownPill label={funnelFilterOptions.frequency} />
        <DropdownPill label={funnelFilterOptions.device} />
        <DropdownPill label={funnelFilterOptions.segment} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">Compare</span>
          <Toggle checked={compare} onChange={setCompare} label="Compare" />
        </div>

        <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
          {viewOptions.map(({ id, label, icon: Icon }) => (
            <IconButton
              key={id}
              label={label}
              active={activeView === id}
              icon={<Icon size={16} aria-hidden="true" />}
              onClick={() => setActiveView(id)}
              className="border-none"
            />
          ))}
        </div>

        <IconButton label="More options" icon={<MoreVertical size={16} aria-hidden="true" />} />
      </div>
    </div>
  )
}
