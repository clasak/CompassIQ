'use client'

import { cn } from '@/lib/utils'

interface GaugeChartProps {
  /** Current value (0-100) */
  value: number
  /** Maximum value (default 100) */
  max?: number
  /** Label for the gauge */
  label?: string
  /** Size of the gauge */
  size?: 'sm' | 'md' | 'lg'
  /** Color scheme */
  colorScheme?: 'default' | 'success' | 'warning' | 'danger' | 'gradient'
  /** Show value text */
  showValue?: boolean
  /** Value suffix (e.g., '%', 'pts') */
  suffix?: string
  /** Custom class name */
  className?: string
}

const sizeConfig = {
  sm: { width: 120, strokeWidth: 8, fontSize: 'text-lg' },
  md: { width: 180, strokeWidth: 12, fontSize: 'text-2xl' },
  lg: { width: 240, strokeWidth: 16, fontSize: 'text-4xl' },
}

const colorConfig = {
  default: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  gradient: '',
}

export function GaugeChart({
  value,
  max = 100,
  label,
  size = 'md',
  colorScheme = 'default',
  showValue = true,
  suffix = '%',
  className,
}: GaugeChartProps) {
  const config = sizeConfig[size]
  const normalizedValue = Math.min(Math.max(value, 0), max)
  const percentage = (normalizedValue / max) * 100

  // SVG arc calculations
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = radius * Math.PI // Semi-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on value
  const getColorClass = () => {
    if (colorScheme !== 'gradient') return colorConfig[colorScheme]
    if (percentage >= 70) return 'stroke-success'
    if (percentage >= 40) return 'stroke-warning'
    return 'stroke-danger'
  }

  const gradientId = `gauge-gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 20 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          viewBox={`0 0 ${config.width} ${config.width / 2 + 20}`}
          className="overflow-visible"
        >
          {colorScheme === 'gradient' && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--danger))" />
                <stop offset="50%" stopColor="hsl(var(--warning))" />
                <stop offset="100%" stopColor="hsl(var(--success))" />
              </linearGradient>
            </defs>
          )}

          {/* Background arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2}
                A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2}
                A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke={colorScheme === 'gradient' ? `url(#${gradientId})` : undefined}
            className={colorScheme !== 'gradient' ? getColorClass() : undefined}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out',
              transformOrigin: 'center',
            }}
          />

          {/* Min label */}
          <text
            x={config.strokeWidth}
            y={config.width / 2 + 18}
            className="fill-muted-foreground text-xs"
            textAnchor="start"
          >
            0
          </text>

          {/* Max label */}
          <text
            x={config.width - config.strokeWidth}
            y={config.width / 2 + 18}
            className="fill-muted-foreground text-xs"
            textAnchor="end"
          >
            {max}
          </text>
        </svg>

        {/* Center value */}
        {showValue && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-2"
            style={{ paddingBottom: '8px' }}
          >
            <span className={cn('font-bold', config.fontSize)}>
              {Math.round(normalizedValue)}
              <span className="text-muted-foreground text-base font-normal">{suffix}</span>
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  )
}
