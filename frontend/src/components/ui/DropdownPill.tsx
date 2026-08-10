import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface DropdownPillProps {
  label: string
  icon?: ReactNode
  onClick?: () => void
}

export function DropdownPill({ label, icon, onClick }: DropdownPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {icon}
      <span>{label}</span>
      <ChevronDown size={16} className="text-text-muted" aria-hidden="true" />
    </button>
  )
}
