'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart3, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics Suite"
        description="Deep-dive business intelligence and performance analysis"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" disabled>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      <Card>
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Yet"
          description="Analytics data will appear here once you have closed deals and revenue tracked in the system. Connect your CRM or add deals manually to see revenue trends, win/loss analysis, and team performance metrics."
          action={{
            label: "View Pipeline",
            onClick: () => window.location.href = '/pipeline'
          }}
        />
      </Card>
    </div>
  )
}
