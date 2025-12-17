import { getTask, listAccounts, listOpportunities } from '@/lib/actions/crm-actions'
import { notFound, redirect } from 'next/navigation'
import { TaskDetailView } from './task-detail-view'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params
  const taskResult = await getTask(id)
  const accountsResult = await listAccounts()
  const oppsResult = await listOpportunities()

  if (!taskResult.success || !taskResult.task) {
    notFound()
  }

  const task = taskResult.task
  const accounts = accountsResult.accounts || []
  const opportunities = oppsResult.opportunities || []

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/crm/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>
      </div>
      <PageHeader
        title={task.title}
        subtitle={`Task details and information`}
      />
      <TaskDetailView task={task} accounts={accounts} opportunities={opportunities} />
    </div>
  )
}


