import { listQuotes, listAccounts } from '@/lib/actions/crm-actions'
import { QuotesTable } from './quotes-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateQuoteDialog } from './create-quote-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { QuotesPageClient } from './page-client'

export default async function QuotesPage() {
  // Parallel fetching for 2x performance improvement
  const [quotesResult, accountsResult] = await Promise.all([
    listQuotes(),
    listAccounts()
  ])
  const quotes = quotesResult.quotes || []
  const accounts = accountsResult.accounts || []

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Quotes"
        subtitle="Create and manage sales quotes and proposals"
        primaryAction={
          <CreateQuoteDialog accounts={accounts}>
            <ActionButton actionType="admin" className="gap-2">
              <Plus className="h-4 w-4" />
              New Quote
            </ActionButton>
          </CreateQuoteDialog>
        }
      />

      <QuotesTable quotes={quotes} accounts={accounts} />
      <QuotesPageClient />
    </div>
  )
}






