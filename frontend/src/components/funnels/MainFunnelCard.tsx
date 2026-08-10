import { MoreVertical } from 'lucide-react'
import { mainFunnelSteps, mainFunnelSummary } from '../../data/funnelsMockData'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { IconButton } from '../ui/IconButton'
import { FunnelStepBars } from './FunnelStepBars'

export function MainFunnelCard() {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary sm:text-[17px]">
              Signup to Paid Conversion Funnel
            </h2>
            <Badge>Primary Funnel</Badge>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            5 Steps • Last updated 2 hours ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">View Funnel</Button>
          <IconButton label="More options" icon={<MoreVertical size={16} aria-hidden="true" />} />
        </div>
      </div>

      <FunnelStepBars steps={mainFunnelSteps} />

      <div className="grid grid-cols-1 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-text-secondary">Overall Conversion Rate</p>
          <p className="mt-1 text-sm font-bold text-primary">
            {mainFunnelSummary.overallConversionRate}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Total Drop-offs</p>
          <p className="mt-1 text-sm font-bold text-text-primary">
            {mainFunnelSummary.totalDropoffs}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Biggest Drop-off</p>
          <p className="mt-1 text-sm font-bold text-danger">{mainFunnelSummary.biggestDropoff}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-text-secondary">Improvement Opportunity</p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {mainFunnelSummary.improvementOpportunity}
            </p>
          </div>
          <Badge className="shrink-0">View Insights</Badge>
        </div>
      </div>
    </Card>
  )
}
