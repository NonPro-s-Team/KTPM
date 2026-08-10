import type { FunnelStep } from '../../types/funnel'
import { formatNumber, formatPercent } from '../../lib/formatters'

interface FunnelStepBarsProps {
  steps: FunnelStep[]
}

const barColors = ['#6D5AE6', '#7C6EE8', '#5FA8E0', '#3FC6C6', '#2DD4BF']

export function FunnelStepBars({ steps }: FunnelStepBarsProps) {
  const maxPercent = steps[0]?.percent ?? 100

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="grid min-w-[560px] grid-cols-5 gap-3">
        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center gap-2">
            <div className="w-full text-center">
              <p className="text-xs text-text-secondary">
                {index + 1}. {step.name}
              </p>
              <p className="tabular-nums text-lg font-bold text-text-primary">
                {formatNumber(step.count)}
              </p>
              <p className="tabular-nums text-xs text-text-secondary">
                {formatPercent(step.percent)}
              </p>
            </div>
            <div className="flex h-40 w-full items-end">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${Math.max((step.percent / maxPercent) * 100, 4)}%`,
                  backgroundColor: barColors[index] ?? barColors[barColors.length - 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
