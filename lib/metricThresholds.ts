/**
 * Central metric threshold configuration
 * Defines health status rules for KPIs
 */

export type HealthStatus = 'success' | 'warning' | 'danger'

export interface ThresholdRule {
  metricKey: string
  evaluate: (current: number, previous?: number) => HealthStatus
}

/**
 * Health status thresholds for metrics
 */
export const METRIC_THRESHOLDS: Record<string, (current: number, previous?: number) => HealthStatus> = {
  // Revenue: green if >=0% vs prior, yellow if -0% to -5%, red if < -5%
  revenueMTD: (current, previous) => {
    if (!previous || previous === 0) return 'success'
    const change = ((current - previous) / previous) * 100
    if (change >= 0) return 'success'
    if (change >= -5) return 'warning'
    return 'danger'
  },

  // Pipeline: similar to revenue
  pipeline30: (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 'success' : 'warning'
    const change = ((current - previous) / previous) * 100
    if (change >= 0) return 'success'
    if (change >= -5) return 'warning'
    return 'danger'
  },
  pipeline60: (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 'success' : 'warning'
    const change = ((current - previous) / previous) * 100
    if (change >= 0) return 'success'
    if (change >= -5) return 'warning'
    return 'danger'
  },
  pipeline90: (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 'success' : 'warning'
    const change = ((current - previous) / previous) * 100
    if (change >= 0) return 'success'
    if (change >= -5) return 'warning'
    return 'danger'
  },

  // AR Outstanding: green if decreasing, yellow if stable, red if increasing > 5%
  arOutstanding: (current, previous) => {
    if (!previous || previous === 0) return 'success'
    const change = ((current - previous) / previous) * 100
    if (change <= 0) return 'success' // Decreasing is good
    if (change <= 5) return 'warning'
    return 'danger'
  },

  // On-time delivery: green >= 95%, yellow 90-94.9%, red < 90%
  onTimeDelivery: (current) => {
    const percent = current * 100
    if (percent >= 95) return 'success'
    if (percent >= 90) return 'warning'
    return 'danger'
  },

  // Churn risk: green 0-2, yellow 3-5, red 6+
  churnRisk: (current) => {
    if (current <= 2) return 'success'
    if (current <= 5) return 'warning'
    return 'danger'
  },
}

/**
 * Get health status for a metric
 */
export function getMetricHealthStatus(
  metricKey: string,
  current: number,
  previous?: number
): HealthStatus {
  const evaluator = METRIC_THRESHOLDS[metricKey]
  if (!evaluator) return 'success' // Default to success if no rule
  return evaluator(current, previous)
}

/**
 * Design tokens for health status colors
 */
export const HEALTH_COLORS = {
  success: {
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800',
  },
  warning: {
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  danger: {
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-800',
  },
} as const




