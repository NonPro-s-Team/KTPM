import { ArrowDown, ArrowUp } from 'lucide-react'
import type { KpiCard as KpiCardData } from '../../types/funnel'
import { Card } from '../ui/Card'
import { Sparkline } from '../ui/Sparkline'

interface KpiCardProps {
  data: KpiCardData
}

export function KpiCard({ data }: KpiCardProps) {
  const changeColor = data.isPositive ? 'var(--color-success)' : 'var(--color-danger)'
  const ArrowIcon = data.changeDirection === 'up' ? ArrowUp : ArrowDown

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-[13px] font-medium text-text-secondary">{data.label}</p>
      <p className="tabular-nums text-[28px] font-extrabold text-text-primary">{data.value}</p>
      <p
        className="flex items-center gap-1 text-xs font-medium"
        style={{ color: changeColor }}
      >
        <ArrowIcon size={12} aria-hidden="true" />
        <span>{data.changeLabel}</span>
      </p>
      <Sparkline values={data.sparkline} color={data.sparklineColor} />
    </Card>
  )
}
