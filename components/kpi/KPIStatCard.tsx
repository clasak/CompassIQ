'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPIStatCardProps {
  title: string
  value: string | number
  delta?: number | null
  deltaLabel?: string
  onClick?: () => void
  className?: string
}

export function KPIStatCard({
  title,
  value,
  delta,
  deltaLabel,
  onClick,
  className,
}: KPIStatCardProps) {
  const isClickable = typeof onClick === 'function'

  const deltaIcon =
    delta === null || delta === undefined ? (
      <Minus className="h-3 w-3" />
    ) : delta > 0 ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )

  const deltaColor =
    delta === null || delta === undefined
      ? 'text-muted-foreground'
      : delta > 0
      ? 'text-green-600'
      : 'text-red-600'

  return (
    <Card
      data-kpi-card
      className={cn(
        isClickable && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate" title={title}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(delta !== null && delta !== undefined) || deltaLabel ? (
          <p className={cn('text-xs flex items-center gap-1 mt-1', deltaColor)}>
            {deltaIcon}
            {deltaLabel || `${Math.abs(delta || 0)}%`}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

