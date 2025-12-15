import { listOpportunities, listAccounts } from '@/lib/actions/crm-actions'
import { OpportunitiesTable } from './opportunities-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateOpportunityDialog } from './create-opportunity-dialog'

export default async function OpportunitiesPage() {
  const oppsResult = await listOpportunities()
  const accountsResult = await listAccounts()
  const opportunities = oppsResult.opportunities || []
  const accounts = accountsResult.accounts || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">Manage your sales opportunities</p>
        </div>
        <CreateOpportunityDialog accounts={accounts}>
          <ActionButton actionType="admin">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </ActionButton>
        </CreateOpportunityDialog>
      </div>

      <OpportunitiesTable opportunities={opportunities} accounts={accounts} />
    </div>
  )
}

