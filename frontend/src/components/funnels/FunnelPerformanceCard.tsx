import { ArrowDown, ArrowUp } from 'lucide-react'
import { funnelPerformanceRows } from '../../data/funnelsMockData'
import { Card } from '../ui/Card'
import { Sparkline } from '../ui/Sparkline'

export function FunnelPerformanceCard() {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary sm:text-[17px]">
          Funnel Performance
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          View All
        </a>
      </div>

      <div className="grid grid-cols-[1fr_auto_56px] gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-text-muted">
        <span>Funnel</span>
        <span className="text-right">Completion Rate</span>
        <span className="text-right">Trend</span>
      </div>

      <ul className="flex flex-col divide-y divide-border-subtle">
        {funnelPerformanceRows.map((row) => {
          const ArrowIcon = row.trendDirection === 'up' ? ArrowUp : ArrowDown
          const trendColor =
            row.trendDirection === 'up' ? 'var(--color-success)' : 'var(--color-danger)'

          return (
            <li
              key={row.id}
              className="grid grid-cols-[1fr_auto_56px] items-center gap-x-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <span
                  className="size-2.5 shrink-0 rounded-[4px]"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                />
                {row.name}
              </span>
              <span className="tabular-nums text-right text-sm font-semibold text-text-primary">
                {row.completionRate}
              </span>
              <span className="flex items-center justify-end gap-1">
                <ArrowIcon size={12} color={trendColor} aria-hidden="true" />
                <Sparkline values={row.sparkline} color={trendColor} height={20} />
              </span>
            </li>
          )
        })}
      </ul>

      <a
        href="#"
        className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        View all funnels →
      </a>
    </Card>
  )
}
