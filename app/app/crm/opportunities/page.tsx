import { listOpportunities, listAccounts } from '@/lib/actions/crm-actions'
import { OpportunitiesTable } from './opportunities-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateOpportunityDialog } from './create-opportunity-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { OpportunitiesPageClient } from './page-client'

export default async function OpportunitiesPage() {
  const oppsResult = await listOpportunities()
  const accountsResult = await listAccounts()
  const opportunities = oppsResult.opportunities || []
  const accounts = accountsResult.accounts || []

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Opportunities"
        description="Track and manage your sales pipeline and deals"
        action={
          <CreateOpportunityDialog accounts={accounts}>
            <ActionButton actionType="admin" className="gap-2">
              <Plus className="h-4 w-4" />
              New Opportunity
            </ActionButton>
          </CreateOpportunityDialog>
        }
      />

      <OpportunitiesTable opportunities={opportunities} accounts={accounts} />
      <OpportunitiesPageClient />
    </div>
  )
}


