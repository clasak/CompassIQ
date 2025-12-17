import { listLeads } from '@/lib/actions/crm-actions'
import { LeadsTable } from './leads-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateLeadDialog } from './create-lead-dialog'
import { PageHeader } from '@/components/ui/page-header'

export default async function LeadsPage() {
  const result = await listLeads()
  const leads = result.leads || []

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Leads"
        subtitle="Manage your sales leads and contact information"
        primaryAction={
          <CreateLeadDialog>
            <ActionButton actionType="admin" className="gap-2">
              <Plus className="h-4 w-4" />
              New Lead
            </ActionButton>
          </CreateLeadDialog>
        }
      />

      <LeadsTable leads={leads} />
    </div>
  )
}


