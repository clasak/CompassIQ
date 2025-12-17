'use client'

import { Opportunity, Account } from '@/lib/actions/crm-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { EditOpportunityDialog } from '../edit-opportunity-dialog'
import { DeleteOpportunityDialog } from '../delete-opportunity-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ExternalLink, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClientProjectFromOpportunity } from '@/lib/actions/client-project-actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { isDemoOrgError } from '@/lib/errors'

interface OpportunityDetailViewProps {
  opportunity: Opportunity
  accounts: Account[]
}

export function OpportunityDetailView({ opportunity, accounts }: OpportunityDetailViewProps) {
  const router = useRouter()
  const account = accounts.find(a => a.id === opportunity.account_id)
  const [converting, setConverting] = useState(false)
  const isWon = opportunity.stage === 'WON'

  async function handleConvertToClientProject() {
    setConverting(true)
    try {
      const result = await createClientProjectFromOpportunity(opportunity.id)
      if (result.error) {
        if (isDemoOrgError({ message: result.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(result.error)
        }
        return
      }
      if (result.projectId) {
        toast.success('Client project created successfully!')
        router.push(`/app/clients/${result.projectId}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client project')
    } finally {
      setConverting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{opportunity.name}</CardTitle>
            <CardDescription>Opportunity ID: {opportunity.id}</CardDescription>
          </div>
          <div className="flex gap-2">
            {isWon && (
              <ActionButton
                actionType="admin"
                onClick={handleConvertToClientProject}
                disabled={converting}
                size="sm"
              >
                <Building2 className="h-4 w-4 mr-2" />
                {converting ? 'Converting...' : 'Convert to Client Project'}
              </ActionButton>
            )}
            <EditOpportunityDialog opportunity={opportunity} accounts={accounts}>
              <ActionButton actionType="admin" variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </ActionButton>
            </EditOpportunityDialog>
            <DeleteOpportunityDialog opportunityId={opportunity.id}>
              <ActionButton actionType="admin" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ActionButton>
            </DeleteOpportunityDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {account && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Account</div>
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => router.push(`/app/crm/accounts/${account.id}`)}
            >
              {account.name}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Stage</div>
            <Badge variant="outline">{opportunity.stage}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Amount</div>
            <div>${Number(opportunity.amount).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Close Date</div>
            <div>{opportunity.close_date ? formatDate(opportunity.close_date) : '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Source</div>
            <div>{opportunity.source || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
            <div>{formatDate(opportunity.created_at)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


