export type TrendDirection = 'up' | 'down'

export interface KpiCard {
  id: string
  label: string
  value: string
  changeLabel: string
  changeDirection: TrendDirection
  /** Whether the change direction is favorable for this metric (e.g. a rate drop can be good). */
  isPositive: boolean
  sparklineColor: string
  sparkline: number[]
}

export interface FunnelStep {
  name: string
  count: number
  percent: number
}

export interface FunnelPerformanceRow {
  id: string
  name: string
  color: string
  completionRate: string
  trendDirection: TrendDirection
  sparkline: number[]
}

export interface TrendSeries {
  id: string
  name: string
  color: string
  values: number[]
}

export interface FunnelInsight {
  id: string
  icon: 'warning' | 'bulb' | 'trophy'
  iconColor: string
  iconBg: string
  title: string
  description: string
}

export interface DropoffReason {
  label: string
  percent: number
}
