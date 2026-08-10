import type { TrendDirection } from '../types/funnel'

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function trendColor(direction: TrendDirection, isPositive: boolean): string {
  const goodDirection = isPositive ? direction === 'up' : direction === 'down'
  return goodDirection ? 'var(--color-success)' : 'var(--color-danger)'
}
