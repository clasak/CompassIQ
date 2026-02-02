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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        }
      />

      <Card>
        <EmptyState
          icon={Building2}
          title="No Accounts Yet"
          description="Start adding your customer accounts to track ARR, health scores, renewal dates, and account ownership. Import from your CRM or add accounts manually to build your portfolio view."
          action={{
            label: "Add First Account",
          }}
        />
      </Card>
    </div>
  )
}
