import { getAccount } from '@/lib/actions/crm-actions'
import { notFound } from 'next/navigation'
import { AccountDetailView } from './account-detail-view'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AccountDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = await params
  const result = await getAccount(id)

  if (!result.success || !result.account) {
    notFound()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/crm/accounts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Link>
        </Button>
      </div>
      <PageHeader
        title={result.account.name}
        subtitle={`Account details and information`}
      />
      <AccountDetailView account={result.account} />
    </div>
  )
}
