'use client'

import { Account } from '@/lib/actions/crm-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { EditAccountDialog } from '../edit-account-dialog'
import { DeleteAccountDialog } from '../delete-account-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AccountDetailViewProps {
  account: Account
}

export function AccountDetailView({ account }: AccountDetailViewProps) {
  const router = useRouter()

  function handleCreatePreview() {
    router.push(`/app/sales/preview?accountId=${account.id}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{account.name}</CardTitle>
            <CardDescription>Account ID: {account.id}</CardDescription>
          </div>
          <div className="flex gap-2">
            <ActionButton actionType="admin" onClick={handleCreatePreview} size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Create Client Preview
            </ActionButton>
            <EditAccountDialog account={account}>
              <ActionButton actionType="admin" variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </ActionButton>
            </EditAccountDialog>
            <DeleteAccountDialog accountId={account.id}>
              <ActionButton actionType="admin" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ActionButton>
            </DeleteAccountDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
            <Badge variant="outline">{account.status}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Industry</div>
            <div>{account.industry || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Website</div>
            <div>{account.website || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Segment</div>
            <div>{account.segment || '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Renewal Date</div>
            <div>{account.renewal_date ? formatDate(account.renewal_date) : '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
            <div>{formatDate(account.created_at)}</div>
          </div>
        </div>
        {account.notes && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
            <div className="text-sm">{account.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


