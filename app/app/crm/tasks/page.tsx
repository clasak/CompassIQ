import { listTasks, listAccounts, listOpportunities } from '@/lib/actions/crm-actions'
import { TasksTable } from './tasks-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateTaskDialog } from './create-task-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { TasksPageClient } from './page-client'

export default async function TasksPage() {
  const tasksResult = await listTasks()
  const accountsResult = await listAccounts()
  const oppsResult = await listOpportunities()
  const tasks = tasksResult.tasks || []
  const accounts = accountsResult.accounts || []
  const opportunities = oppsResult.opportunities || []

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage tasks linked to accounts and opportunities"
        primaryAction={
          <CreateTaskDialog accounts={accounts} opportunities={opportunities}>
            <ActionButton actionType="admin" className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </ActionButton>
          </CreateTaskDialog>
        }
      />

      <TasksTable tasks={tasks} accounts={accounts} opportunities={opportunities} />
      <TasksPageClient />
    </div>
  )
}


