'use client'

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { cn } from '@/lib/utils'

interface SparklineChartProps {
  /** Array of values */
  data: number[]
  /** Chart width */
  width?: number
  /** Chart height */
  height?: number
  /** Line color */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'muted'
  /** Show area fill */
  showArea?: boolean
  /** Animate on render */
  animate?: boolean
  /** Custom class name */
  className?: string
}

const colorMap = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--danger))',
  muted: 'hsl(var(--muted))',
}

export function SparklineChart({
  data,
  width = 100,
  height = 32,
  color = 'primary',
  showArea = false,
  animate = true,
  className,
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }))
  const strokeColor = colorMap[color]

  // Determine trend for automatic color
  const first = data[0] || 0
  const last = data[data.length - 1] || 0
  const trend = last >= first ? 'up' : 'down'
  const autoColor = trend === 'up' ? colorMap.success : colorMap.danger

  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color === 'primary' ? autoColor : strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={animate}
            animationDuration={500}
          />
          {showArea && (
            <defs>
              <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Trend indicator with sparkline
 */
interface TrendSparklineProps {
  /** Current value */
  value: number
  /** Historical data points */
  history: number[]
  /** Format for displaying value */
  format?: (value: number) => string
  /** Label text */
  label?: string
  /** Custom class name */
  className?: string
}

export function TrendSparkline({
  value,
  history,
  format = (v) => v.toLocaleString(),
  label,
  className,
}: TrendSparklineProps) {
  const allData = [...history, value]
  const first = history[0] || value
  const change = value - first
  const changePercent = first !== 0 ? ((change / first) * 100).toFixed(1) : '0'
  const isPositive = change >= 0

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div>
        <div className="text-2xl font-bold">{format(value)}</div>
        {label && <div className="text-sm text-muted-foreground">{label}</div>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <SparklineChart
          data={allData}
          width={80}
          height={24}
          color={isPositive ? 'success' : 'danger'}
        />
        <span
          className={cn(
            'text-xs font-medium',
            isPositive ? 'text-success' : 'text-danger'
          )}
        >
          {isPositive ? '+' : ''}{changePercent}%
        </span>
      </div>
    </div>
  )
}
