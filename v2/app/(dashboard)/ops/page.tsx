'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OpsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations Hub"
        description="Work order management and SLA tracking"
        actions={
          <Button variant="secondary" size="sm" disabled>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Status
          </Button>
        }
      />

      <Card>
        <EmptyState
          icon={Zap}
          title="No Work Orders Yet"
          description="Operations tracking will show work orders, SLA metrics, and delivery status once you start managing client projects. Connect your project management tools or add work orders manually."
          action={{
            label: "Add Work Order",
          }}
        />
      </Card>
    </div>
  )
}
