'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: number
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  delay?: number
}

const variantStyles = {
  default: {
    border: 'border-border',
    icon: 'text-text-tertiary',
  },
  success: {
    border: 'border-revenue/30',
    icon: 'text-revenue',
  },
  warning: {
    border: 'border-warning/30',
    icon: 'text-warning',
  },
  danger: {
    border: 'border-danger/30',
    icon: 'text-danger',
  },
}

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  variant = 'default',
  onClick,
  delay = 0,
}: StatCardProps) {
  const styles = variantStyles[variant]
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      onClick={onClick}
      className={cn(
        'relative bg-surface-raised border rounded-xl p-5 transition-all duration-300',
        styles.border,
        onClick && 'cursor-pointer hover:border-border-accent hover:bg-surface-overlay'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-text-tertiary text-xs uppercase tracking-wider font-medium block">
            {label}
          </span>
          <span className="font-mono text-2xl md:text-3xl font-bold text-text-primary tabular-nums">
            {value}
          </span>
          {trend !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                trendPositive ? 'text-revenue' : 'text-danger'
              )}
            >
              {trendPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2 rounded-lg bg-surface-subtle', styles.icon)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
