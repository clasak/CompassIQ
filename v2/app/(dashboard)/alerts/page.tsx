'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { alerts } from '@/lib/mock-data'

const allAlerts = [
  ...alerts,
  {
    id: '4',
    type: 'success',
    title: 'Deal Closed',
    message: 'TechStart Inc signed their renewal for $48,000',
    timestamp: '2 days ago',
  },
  {
    id: '5',
    type: 'info',
    title: 'New Lead Assigned',
    message: 'Enterprise lead from Global Manufacturing assigned to Sarah',
    timestamp: '3 days ago',
  },
]

const iconMap = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
}

const colorMap = {
  danger: 'bg-danger-muted border-danger/30 text-danger',
  warning: 'bg-warning-muted border-warning/30 text-warning',
  info: 'bg-pipeline-muted border-pipeline/30 text-pipeline',
  success: 'bg-revenue-muted border-revenue/30 text-revenue',
}

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Alerts & Notifications"
        description="System alerts and business notifications"
      />

      <div className="space-y-4">
        {allAlerts.map((alert, i) => {
          const Icon = iconMap[alert.type as keyof typeof iconMap]
          const colors = colorMap[alert.type as keyof typeof colorMap]

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card className={`border ${colors.split(' ')[1]}`}>
                <CardContent className={`p-4 ${colors.split(' ')[0]}`}>
                  <div className="flex items-start gap-4">
                    <Icon className={`w-5 h-5 mt-0.5 ${colors.split(' ')[2]}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-text-tertiary mt-2">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
