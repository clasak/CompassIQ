'use client'

import { Lead } from '@/lib/actions/crm-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { EditLeadDialog } from '../edit-lead-dialog'
import { DeleteLeadDialog } from '../delete-lead-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Pencil, Trash2 } from 'lucide-react'

interface LeadDetailViewProps {
  lead: Lead
}

export function LeadDetailView({ lead }: LeadDetailViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{lead.name}</CardTitle>
            <CardDescription>Lead ID: {lead.id}</CardDescription>
          </div>
          <div className="flex gap-2">
            <EditLeadDialog lead={lead}>
              <ActionButton actionType="admin" variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </ActionButton>
            </EditLeadDialog>
            <DeleteLeadDialog leadId={lead.id}>
              <ActionButton actionType="admin" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ActionButton>
            </DeleteLeadDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Company</div>
            <div>{lead.company || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
            <Badge variant="outline">{lead.status}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
            <div>{lead.email || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
            <div>{lead.phone || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Source</div>
            <div>{lead.source || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
            <div>{formatDate(lead.created_at)}</div>
          </div>
        </div>
        {lead.notes && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
            <div className="text-sm">{lead.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
