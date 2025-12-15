import { listLeads } from '@/lib/actions/crm-actions'
import { LeadsTable } from './leads-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateLeadDialog } from './create-lead-dialog'

export default async function LeadsPage() {
  const result = await listLeads()
  const leads = result.leads || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage your sales leads</p>
        </div>
        <CreateLeadDialog>
          <ActionButton actionType="admin">
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </ActionButton>
        </CreateLeadDialog>
      </div>

      <LeadsTable leads={leads} />
    </div>
  )
}

