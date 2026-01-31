'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/ui/sparkline'
import { getMetricHealthStatus, HEALTH_COLORS, type HealthStatus } from '@/lib/metricThresholds'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export interface KPIData {
  value: number
  previousValue?: number
  trend?: number // Percent change
  historicalData?: number[] // Last 8-12 points for sparkline
  lastUpdated?: Date | string
  metricKey?: string
  timeframe?: 'MTD' | 'QTD' | 'YTD' | 'Last 7' | 'Last 30' | 'Last 90'
}

interface KPIStatCardProps {
  title: string
  value: string | number
  delta?: number | null
  deltaLabel?: string
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary'
  data?: KPIData
  metricKey?: string
  timeframe?: 'MTD' | 'QTD' | 'YTD' | 'Last 7' | 'Last 30' | 'Last 90'
}

export function KPIStatCard({
  title,
  value,
  delta,
  deltaLabel,
  onClick,
  className,
  variant = 'secondary',
  data,
  metricKey,
  timeframe,
}: KPIStatCardProps) {
  const isClickable = typeof onClick === 'function'
  const isPrimary = variant === 'primary'

  // Calculate health status if we have the data
  let healthStatus: HealthStatus | null = null
  if (metricKey && data) {
    healthStatus = getMetricHealthStatus(metricKey, data.value, data.previousValue)
  }

  // Use delta from data if available
  const effectiveDelta = data?.trend !== undefined ? data.trend : delta
  const effectiveTimeframe = data?.timeframe || timeframe

  const deltaIcon =
    effectiveDelta === null || effectiveDelta === undefined ? (
      <Minus className="h-3 w-3" />
    ) : effectiveDelta > 0 ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )

  const deltaColor =
    effectiveDelta === null || effectiveDelta === undefined
      ? 'text-muted-foreground'
      : effectiveDelta > 0
      ? 'text-green-600 dark:text-green-500'
      : 'text-red-600 dark:text-red-500'

  const healthColors = healthStatus ? HEALTH_COLORS[healthStatus] : null

  // Format value with proper number formatting
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('en-US', { 
        maximumFractionDigits: value < 1000 ? 1 : 0,
        notation: value >= 1000000 ? 'compact' : 'standard'
      }).format(value)
    : value

  return (
    <TooltipProvider>
      <Card
        data-kpi-card
        data-variant={variant}
        className={cn(
          'kpi-card border-border/50',
          isClickable && 'cursor-pointer',
          isPrimary && 'lg:col-span-2',
          healthColors && `border-l-4 ${healthColors.border}`,
          className
        )}
        onClick={isClickable ? onClick : undefined}
      >
        <CardContent className="p-5 space-y-3">
          {/* Header: Label + Timeframe */}
          <div className="flex items-start justify-between gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-section-sm text-muted-foreground truncate flex-1" title={title}>
                  {title}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2 flex-shrink-0">
              {effectiveTimeframe && (
                <Badge variant="outline" className="timeframe-chip text-[10px] px-1.5 py-0.5 h-5">
                  {effectiveTimeframe}
                </Badge>
              )}
              {healthStatus && healthColors && (
                <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1', healthColors.dot)} title={`Status: ${healthStatus}`} />
              )}
            </div>
          </div>

          {/* Value - Big and bold */}
          <div className={cn(
            'font-semibold tracking-tight',
            isPrimary ? 'text-[32px] leading-none' : 'text-[28px] leading-none'
          )}>
            {formattedValue}
          </div>

          {/* Footer: Delta + Sparkline */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Delta indicator */}
            <div className="flex items-center gap-1.5 min-w-0">
              {effectiveDelta !== null && effectiveDelta !== undefined ? (
                <>
                  <div className={cn('flex items-center gap-0.5', deltaColor)}>
                    {deltaIcon}
                    <span className="text-table-sm font-medium">
                      {Math.abs(effectiveDelta).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-table-sm text-muted-foreground">
                    vs prior
                  </span>
                </>
              ) : deltaLabel ? (
                <span className={cn('text-table-sm', deltaColor)}>{deltaLabel}</span>
              ) : (
                <span className="text-table-sm text-muted-foreground">—</span>
              )}
            </div>

            {/* Sparkline */}
            {data?.historicalData && data.historicalData.length > 0 && (
              <div className="flex-shrink-0 w-16 h-6">
                <Sparkline
                  data={data.historicalData}
                  color={
                    effectiveDelta !== null && effectiveDelta !== undefined && effectiveDelta > 0 
                      ? 'hsl(142 76% 36%)' 
                      : 'hsl(0 84% 60%)'
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
