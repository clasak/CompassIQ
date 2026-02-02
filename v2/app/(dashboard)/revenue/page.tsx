'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { TrendingUp, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RevenuePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Revenue Engine"
        description="Pipeline management and sales forecasting"
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
          icon={TrendingUp}
          title="No Revenue Data Yet"
          description="Revenue forecasting and pipeline metrics will appear once you have active deals in your pipeline. Add deals to your pipeline to see forecasts, team performance, and conversion funnels."
          action={{
            label: "View Pipeline",
            onClick: () => window.location.href = '/pipeline'
          }}
        />
      </Card>
    </div>
  )
}
