import { listQuotes, listAccounts } from '@/lib/actions/crm-actions'
import { QuotesTable } from './quotes-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateQuoteDialog } from './create-quote-dialog'
import Link from 'next/link'

export default async function QuotesPage() {
  const quotesResult = await listQuotes()
  const accountsResult = await listAccounts()
  const quotes = quotesResult.quotes || []
  const accounts = accountsResult.accounts || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">Manage your sales quotes</p>
        </div>
        <CreateQuoteDialog accounts={accounts}>
          <ActionButton actionType="admin">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </ActionButton>
        </CreateQuoteDialog>
      </div>

      <QuotesTable quotes={quotes} accounts={accounts} />
    </div>
  )
}

