'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

export interface Alert {
  id: string
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  count?: number
  onClick?: () => void
}

interface AlertsPanelProps {
  alerts: Alert[]
  title?: string
}

export function AlertsPanel({ alerts, title = 'Attention Required' }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return null
  }

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={[
                'flex items-start justify-between p-3 rounded-lg border transition-colors',
                typeof alert.onClick === 'function' ? 'hover:bg-accent cursor-pointer' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={typeof alert.onClick === 'function' ? alert.onClick : undefined}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge
                    variant="outline"
                    className={severityColors[alert.severity]}
                  >
                    {alert.severity}
                  </Badge>
                  {alert.count !== undefined && (
                    <Badge variant="secondary">{alert.count}</Badge>
                  )}
                </div>
                {alert.description && (
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

