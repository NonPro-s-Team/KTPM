import { topDropoffReasons, topDropoffReasonsSampleSize } from '../../data/funnelsMockData'
import { formatPercent } from '../../lib/formatters'
import { Card } from '../ui/Card'

export function TopDropoffReasonsCard() {
  const maxPercent = Math.max(...topDropoffReasons.map((reason) => reason.percent))

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-text-primary sm:text-[17px]">
        Top Drop-off Reasons
      </h2>

      <ul className="flex flex-col gap-3">
        {topDropoffReasons.map((reason) => (
          <li key={reason.label} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm text-text-secondary">{reason.label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-pill bg-bg">
              <span
                className="block h-full rounded-pill bg-gradient-to-r from-(--color-primary) to-(--color-teal)"
                style={{ width: `${(reason.percent / maxPercent) * 100}%` }}
              />
            </span>
            <span className="tabular-nums w-12 shrink-0 text-right text-sm font-semibold text-text-primary">
              {formatPercent(reason.percent)}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-border-subtle pt-3 text-xs text-text-secondary">
        Based on {topDropoffReasonsSampleSize}
      </p>
    </Card>
  )
}
