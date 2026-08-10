import { Area, AreaChart, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  values: number[]
  color: string
  height?: number
}

export function Sparkline({ values, color, height = 40 }: SparklineProps) {
  const data = values.map((value, index) => ({ index, value }))
  const gradientId = `sparkline-${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
