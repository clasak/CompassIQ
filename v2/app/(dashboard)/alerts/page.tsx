'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Bell } from 'lucide-react'

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Alerts & Notifications"
        description="System alerts and business notifications"
      />

      <Card>
        <EmptyState
          icon={Bell}
          title="No Alerts Yet"
          description="You'll receive notifications here for important events like at-risk accounts, expiring deals, missed follow-ups, and milestone achievements. Configure alert rules in Settings."
          action={{
            label: "Configure Alerts",
            onClick: () => window.location.href = '/setup'
          }}
        />
      </Card>
    </div>
  )
}
