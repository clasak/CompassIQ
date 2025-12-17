import { getLead } from '@/lib/actions/crm-actions'
import { notFound } from 'next/navigation'
import { LeadDetailView } from './lead-detail-view'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params
  const result = await getLead(id)

  if (!result.success || !result.lead) {
    notFound()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/crm/leads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
      </div>
      <PageHeader
        title={result.lead.name}
        subtitle={`Lead details and information`}
      />
      <LeadDetailView lead={result.lead} />
    </div>
  )
}


