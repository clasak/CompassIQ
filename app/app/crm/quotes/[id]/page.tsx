import { getQuote, listAccounts } from '@/lib/actions/crm-actions'
import { notFound } from 'next/navigation'
import { QuoteBuilder } from './quote-builder'

interface QuotePageProps {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params
  const quoteResult = await getQuote(id)
  const accountsResult = await listAccounts()

  if (!quoteResult.success || !quoteResult.quote) {
    notFound()
  }

  const quote = quoteResult.quote
  const accounts = accountsResult.accounts || []

  return <QuoteBuilder quote={quote} accounts={accounts} />
}




