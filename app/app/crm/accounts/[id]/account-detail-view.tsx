'use client'

import { Account, Quote } from '@/lib/actions/crm-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EditAccountDialog } from '../edit-account-dialog'
import { DeleteAccountDialog } from '../delete-account-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Pencil, Trash2, Eye, FileText, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AccountDetailViewProps {
  account: Account
  quotes: Quote[]
}

export function AccountDetailView({ account, quotes }: AccountDetailViewProps) {
  const router = useRouter()

  function handleCreatePreview() {
    router.push(`/app/sales/preview?accountId=${account.id}`)
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quote History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/app/crm/quotes')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Quotes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quotes created for this account yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/app/crm/quotes/${quote.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{quote.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {formatDate(quote.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Grand Total</div>
                      <div className="font-semibold">{formatCurrency(quote.grand_total || 0)}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
