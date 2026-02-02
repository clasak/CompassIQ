'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        description="Customer portfolio and health management"
        actions={
          <Button disabled className="opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4 mr-2" />
            Add Account (Connect CRM in Settings)
          </Button>
        }
      />

      <Card>
        <EmptyState
          icon={Building2}
          title="No Accounts Yet"
          description="Connect your CRM in Settings to import customer accounts and track ARR, health scores, renewal dates, and account ownership. Import from your CRM or add accounts manually to build your portfolio view."
        />
      </Card>
    </div>
  )
}
