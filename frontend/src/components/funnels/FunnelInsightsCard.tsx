import { Award, Lightbulb, Sparkles, TriangleAlert } from 'lucide-react'
import { funnelInsights } from '../../data/funnelsMockData'
import type { FunnelInsight } from '../../types/funnel'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const iconMap: Record<FunnelInsight['icon'], typeof TriangleAlert> = {
  warning: TriangleAlert,
  bulb: Lightbulb,
  trophy: Award,
}

export function FunnelInsightsCard() {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-text-primary sm:text-[17px]">
          Funnel Insights
        </h2>
        <Badge className="flex items-center gap-1">
          <Sparkles size={12} aria-hidden="true" />
          AI
        </Badge>
      </div>

      <ul className="flex flex-col gap-4">
        {funnelInsights.map((insight) => {
          const Icon = iconMap[insight.icon]
          return (
            <li key={insight.id} className="flex gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: insight.iconBg, color: insight.iconColor }}
                aria-hidden="true"
              >
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{insight.title}</p>
                <p className="mt-0.5 text-sm text-text-secondary">{insight.description}</p>
                <a
                  href="#"
                  className="mt-1 inline-block text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  View insight →
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
