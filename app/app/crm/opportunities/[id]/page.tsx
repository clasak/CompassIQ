import { getOpportunity, listAccounts } from '@/lib/actions/crm-actions'
import { notFound } from 'next/navigation'
import { OpportunityDetailView } from './opportunity-detail-view'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params
  const result = await getOpportunity(id)
  const accountsResult = await listAccounts()

  if (!result.success || !result.opportunity) {
    notFound()
  }

  const accounts = accountsResult.accounts || []

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/crm/opportunities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Link>
        </Button>
      </div>
      <PageHeader
        title={result.opportunity.name}
        subtitle={`Opportunity details and information`}
      />
      <OpportunityDetailView opportunity={result.opportunity} accounts={accounts} />
    </div>
  )
}
