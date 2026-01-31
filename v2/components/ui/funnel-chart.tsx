'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface FunnelStage {
  name: string
  count: number
  value: number
  conversion?: number
}

interface FunnelChartProps {
  stages: FunnelStage[]
  className?: string
}

const stageColors = [
  'bg-pipeline',
  'bg-blue-400',
  'bg-blue-300',
  'bg-revenue',
  'bg-emerald-400',
]

export function FunnelChart({ stages, className }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map((s) => s.count))

  return (
    <div className={cn('space-y-3', className)}>
      {stages.map((stage, i) => {
        const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
        const isLast = i === stages.length - 1

        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-4">
              {/* Stage label */}
              <div className="w-28 flex-shrink-0">
                <span className="text-sm font-medium text-text-primary">
                  {stage.name}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 relative h-10">
                <div className="absolute inset-0 bg-surface-subtle rounded-lg" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-lg flex items-center justify-between px-4',
                    stageColors[i % stageColors.length]
                  )}
                  style={{ minWidth: width > 0 ? '80px' : '0' }}
                >
                  <span className="font-mono text-sm font-semibold text-white tabular-nums">
                    {stage.count}
                  </span>
                  <span className="font-mono text-xs text-white/80 tabular-nums">
                    {formatCurrency(stage.value)}
                  </span>
                </motion.div>
              </div>

              {/* Conversion rate */}
              {!isLast && stage.conversion !== undefined && (
                <div className="w-16 flex-shrink-0 text-right">
                  <span
                    className={cn(
                      'text-xs font-medium tabular-nums',
                      stage.conversion >= 30
                        ? 'text-revenue'
                        : stage.conversion >= 15
                        ? 'text-warning'
                        : 'text-danger'
                    )}
                  >
                    {stage.conversion.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* Connector arrow */}
            {!isLast && (
              <div className="flex items-center gap-4 h-4">
                <div className="w-28" />
                <div className="flex-1 flex justify-center">
                  <svg
                    className="w-4 h-4 text-border-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
                <div className="w-16" />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
