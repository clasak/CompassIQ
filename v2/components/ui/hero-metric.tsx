'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface HeroMetricProps {
  label: string
  value: string
  trend?: number
  trendLabel?: string
  variant?: 'revenue' | 'pipeline' | 'warning' | 'danger' | 'neutral'
  size?: 'lg' | 'md' | 'sm'
  sparkline?: number[]
  delay?: number
}

const variantStyles = {
  revenue: {
    text: 'text-revenue',
    glow: 'glow-revenue',
    bg: 'bg-revenue-muted',
  },
  pipeline: {
    text: 'text-pipeline',
    glow: 'glow-pipeline',
    bg: 'bg-pipeline-muted',
  },
  warning: {
    text: 'text-warning',
    glow: 'glow-warning',
    bg: 'bg-warning-muted',
  },
  danger: {
    text: 'text-danger',
    glow: 'glow-danger',
    bg: 'bg-danger-muted',
  },
  neutral: {
    text: 'text-text-primary',
    glow: '',
    bg: 'bg-surface-subtle',
  },
}

const sizeStyles = {
  lg: 'text-5xl md:text-6xl lg:text-7xl',
  md: 'text-3xl md:text-4xl lg:text-5xl',
  sm: 'text-2xl md:text-3xl',
}

export function HeroMetric({
  label,
  value,
  trend,
  trendLabel,
  variant = 'neutral',
  size = 'lg',
  sparkline,
  delay = 0,
}: HeroMetricProps) {
  const styles = variantStyles[variant]
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      {/* Background glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl',
          styles.bg
        )}
      />

      <div className="relative bg-surface-raised border border-border rounded-2xl p-6 md:p-8 shadow-inner-glow">
        {/* Label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-tertiary text-sm uppercase tracking-wider font-medium">
            {label}
          </span>
          {sparkline && (
            <Sparkline data={sparkline} positive={trendPositive} />
          )}
        </div>

        {/* Main value */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + 0.2 }}
          className={cn(
            'font-mono font-bold tracking-tight tabular-nums',
            sizeStyles[size],
            styles.text
          )}
          style={{
            textShadow: variant !== 'neutral' ? `0 0 60px currentColor` : undefined,
          }}
        >
          {value}
        </motion.div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.4 }}
            className="flex items-center gap-2 mt-4"
          >
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                trendPositive
                  ? 'bg-revenue-muted text-revenue'
                  : 'bg-danger-muted text-danger'
              )}
            >
              {trendPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-text-tertiary text-sm">{trendLabel}</span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkline-gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#sparkline-gradient-${positive ? 'up' : 'down'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#10B981' : '#EF4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
