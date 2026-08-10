import { MoreVertical } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { trendChartCategories, trendChartSeries } from '../../data/funnelsMockData'
import { Card } from '../ui/Card'
import { DropdownPill } from '../ui/DropdownPill'
import { IconButton } from '../ui/IconButton'

const chartData = trendChartCategories.map((label, index) => {
  const point: Record<string, string | number> = { label }
  for (const series of trendChartSeries) {
    point[series.id] = series.values[index] ?? 0
  }
  return point
})

function TrendLegend() {
  return (
    <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
      {trendChartSeries.map((series) => (
        <li key={series.id} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: series.color }}
            aria-hidden="true"
          />
          {series.name}
        </li>
      ))}
    </ul>
  )
}

export function FunnelTrendChart() {
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-text-primary sm:text-[17px]">
          Funnel Trend Over Time
        </h2>
        <div className="flex items-center gap-2">
          <DropdownPill label="Conversion Rate" />
          <DropdownPill label="Day" />
          <IconButton label="More options" icon={<MoreVertical size={16} aria-hidden="true" />} />
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 32]}
              ticks={[0, 8, 16, 24, 32]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                borderRadius: 10,
                borderColor: 'var(--color-border)',
                fontSize: 13,
              }}
            />
            {trendChartSeries.map((series) => (
              <Line
                key={series.id}
                type="monotone"
                dataKey={series.id}
                name={series.name}
                stroke={series.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Legend verticalAlign="bottom" content={<TrendLegend />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
