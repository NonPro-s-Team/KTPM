import type {
  DropoffReason,
  FunnelInsight,
  FunnelPerformanceRow,
  FunnelStep,
  KpiCard,
  TrendSeries,
} from '../types/funnel'

/**
 * Transcribed from the reference screenshot (RevenuePulse AI — Funnels page).
 * Sparkline point arrays are not visible at pixel-exact precision in the
 * source image; they are shaped to match the visible trend direction only.
 */

export const kpiCards: KpiCard[] = [
  {
    id: 'overall-conversion-rate',
    label: 'Overall Conversion Rate',
    value: '12.48%',
    changeLabel: '18.6% vs Apr 1 - Apr 30',
    changeDirection: 'up',
    isPositive: true,
    sparklineColor: 'var(--color-primary)',
    sparkline: [4, 5, 5, 6, 7, 6, 8, 9, 8, 10, 11, 12],
  },
  {
    id: 'total-completions',
    label: 'Total Completions',
    value: '8,540',
    changeLabel: '21.3% vs Apr 1 - Apr 30',
    changeDirection: 'up',
    isPositive: true,
    sparklineColor: 'var(--color-teal)',
    sparkline: [3, 4, 4, 5, 6, 6, 7, 7, 9, 9, 10, 12],
  },
  {
    id: 'total-users',
    label: 'Total Users',
    value: '68,412',
    changeLabel: '14.7% vs Apr 1 - Apr 30',
    changeDirection: 'up',
    isPositive: true,
    sparklineColor: 'var(--color-primary)',
    sparkline: [6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
  },
  {
    id: 'avg-time-to-convert',
    label: 'Avg. Time to Convert',
    value: '2d 14h',
    changeLabel: '9.3% vs Apr 1 - Apr 30',
    changeDirection: 'down',
    isPositive: true,
    sparklineColor: 'var(--color-teal)',
    sparkline: [12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6],
  },
  {
    id: 'abandonment-rate',
    label: 'Abandonment Rate',
    value: '67.52%',
    changeLabel: '6.1% vs Apr 1 - Apr 30',
    changeDirection: 'up',
    isPositive: false,
    sparklineColor: 'var(--color-danger)',
    sparkline: [12, 11, 11, 10, 9, 9, 8, 8, 7, 7, 6, 6],
  },
]

export const mainFunnelSteps: FunnelStep[] = [
  { name: 'Sign Up', count: 63212, percent: 100 },
  { name: 'Email Verified', count: 45631, percent: 72.2 },
  { name: 'Onboarding Started', count: 28942, percent: 45.8 },
  { name: 'Add Payment Method', count: 12842, percent: 20.3 },
  { name: 'Subscribed', count: 7888, percent: 12.5 },
]

export const mainFunnelSummary = {
  overallConversionRate: '12.48%',
  totalDropoffs: '55,324',
  biggestDropoff: 'Email Verified → Onboarding Started (16,689)',
  improvementOpportunity: 'Add Payment Method step',
}

export const funnelPerformanceRows: FunnelPerformanceRow[] = [
  {
    id: 'signup-to-paid',
    name: 'Signup to Paid',
    color: 'var(--color-primary)',
    completionRate: '12.48%',
    trendDirection: 'up',
    sparkline: [3, 4, 4, 5, 6, 6, 7, 8],
  },
  {
    id: 'free-trial-to-paid',
    name: 'Free Trial to Paid',
    color: 'var(--color-blue)',
    completionRate: '18.72%',
    trendDirection: 'up',
    sparkline: [4, 4, 5, 6, 6, 7, 8, 9],
  },
  {
    id: 'product-activation',
    name: 'Product Activation',
    color: 'var(--color-teal)',
    completionRate: '31.42%',
    trendDirection: 'up',
    sparkline: [5, 6, 6, 7, 8, 9, 10, 11],
  },
  {
    id: 'demo-to-trial',
    name: 'Demo to Trial',
    color: 'var(--color-primary)',
    completionRate: '24.18%',
    trendDirection: 'up',
    sparkline: [4, 5, 5, 6, 7, 7, 8, 9],
  },
  {
    id: 'lead-to-opportunity',
    name: 'Lead to Opportunity',
    color: 'var(--color-teal)',
    completionRate: '16.09%',
    trendDirection: 'up',
    sparkline: [3, 4, 5, 5, 6, 7, 7, 8],
  },
  {
    id: 'opportunity-to-win',
    name: 'Opportunity to Win',
    color: 'var(--color-danger)',
    completionRate: '28.91%',
    trendDirection: 'down',
    sparkline: [9, 8, 8, 7, 7, 6, 6, 5],
  },
]

export const trendChartCategories = [
  'Apr 19',
  'Apr 26',
  'May 3',
  'May 10',
  'May 17',
  'May 24',
  'May 31',
]

export const trendChartSeries: TrendSeries[] = [
  {
    id: 'signup-to-paid',
    name: 'Signup to Paid',
    color: 'var(--color-primary)',
    values: [22, 24, 21, 25, 23, 26, 24],
  },
  {
    id: 'free-trial-to-paid',
    name: 'Free Trial to Paid',
    color: 'var(--color-blue)',
    values: [14, 15, 13, 16, 15, 17, 16],
  },
  {
    id: 'product-activation',
    name: 'Product Activation',
    color: 'var(--color-teal)',
    values: [9, 10, 9, 11, 10, 12, 11],
  },
  {
    id: 'lead-to-opportunity',
    name: 'Lead to Opportunity',
    color: 'var(--color-danger)',
    values: [6, 7, 6, 8, 7, 8, 7],
  },
]

export const funnelInsights: FunnelInsight[] = [
  {
    id: 'high-dropoff',
    icon: 'warning',
    iconColor: 'var(--color-danger)',
    iconBg: 'var(--color-danger-soft)',
    title: 'High Drop-off Detected',
    description: 'Users drop off 27.8% at Email Verification step.',
  },
  {
    id: 'optimization-opportunity',
    icon: 'bulb',
    iconColor: 'var(--color-primary)',
    iconBg: 'var(--color-primary-soft)',
    title: 'Optimization Opportunity',
    description: 'Users who add payment method convert 2.3x higher.',
  },
  {
    id: 'winning-segment',
    icon: 'trophy',
    iconColor: 'var(--color-primary)',
    iconBg: 'var(--color-primary-soft)',
    title: 'Winning Segment',
    description: 'Users from Organic Search convert 34% better.',
  },
]

export const topDropoffReasons: DropoffReason[] = [
  { label: 'Too early in buying journey', percent: 34.6 },
  { label: 'Not enough product info', percent: 22.1 },
  { label: 'Confusing steps', percent: 18.3 },
  { label: 'Too long process', percent: 14.7 },
  { label: 'Other', percent: 10.3 },
]

export const topDropoffReasonsSampleSize = '2,543 responses'

export const funnelFilterOptions = {
  funnel: 'All Funnels',
  frequency: 'Daily',
  device: 'All Devices',
  segment: 'All Segments',
}

export const dateRangeLabel = 'May 1 - May 31'
