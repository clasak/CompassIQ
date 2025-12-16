'use client'

import { memo, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface Alert {
  id: string
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  count?: number
  onClick?: () => void
  route?: string // Route to navigate to when clicked
  filter?: string // Query param filter to apply
  lastEvaluated?: Date | string
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

interface AlertsPanelProps {
  alerts: Alert[]
  title?: string
}

export const AlertsPanel = memo(function AlertsPanel({ alerts, title = 'Attention Required' }: AlertsPanelProps) {
  const router = useRouter()

  if (alerts.length === 0) {
    return null
  }

  const severityColors = {
    low: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    high: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    critical: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800',
  }

  const handleAlertClick = useCallback((alert: Alert) => {
    if (alert.onClick) {
      alert.onClick()
    } else if (alert.route) {
      const url = alert.filter ? `${alert.route}?filter=${alert.filter}` : alert.route
      router.push(url)
    }
  }, [router])

  const formatLastEvaluated = useCallback((date?: Date | string) => {
    if (!date) return null
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }, [])

  // Get last evaluated time (most recent across all alerts) - memoized to avoid expensive date calculations
  const mostRecentEval = useMemo(() => {
    const lastEvaluatedTimes = alerts
      .map(a => a.lastEvaluated)
      .filter(Boolean)
      .map(d => new Date(d!))
    return lastEvaluatedTimes.length > 0 
      ? new Date(Math.max(...lastEvaluatedTimes.map(d => d.getTime())))
      : null
  }, [alerts])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-section font-semibold">
            <AlertTriangle className="h-4 w-4 text-warning" />
            {title}
          </CardTitle>
          {mostRecentEval && (
            <span className="text-table-sm text-muted-foreground">
              Last evaluated: {formatLastEvaluated(mostRecentEval)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isClickable = !!(alert.onClick || alert.route)
            
            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start justify-between p-3 rounded-md border border-border/50 transition-colors',
                  isClickable && 'hover:bg-surface-2/50 cursor-pointer'
                )}
                onClick={isClickable ? () => handleAlertClick(alert) : undefined}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium text-table">{alert.title}</h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-table-sm font-medium',
                        severityColors[alert.severity]
                      )}
                    >
                      {alert.severity}
                    </Badge>
                    {alert.count !== undefined && (
                      <Badge variant="secondary" className="text-table-sm">{alert.count}</Badge>
                    )}
                    {alert.lastEvaluated && (
                      <span className="text-table-sm text-muted-foreground">
                        {formatLastEvaluated(alert.lastEvaluated)}
                      </span>
                    )}
                  </div>
                  {alert.description && (
                    <p className="text-table-sm text-muted-foreground">
                      {alert.description}
                    </p>
                  )}
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {alert.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-7 text-table-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick()
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {isClickable && (
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-table-sm gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAlertClick(alert)
                      }}
                    >
                      View All
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})
