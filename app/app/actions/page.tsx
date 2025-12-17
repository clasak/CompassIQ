import { TasksTable } from './tasks-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrgContext } from '@/lib/org-context'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  related_type: string | null
  related_id: string | null
}

async function getMyTasks() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('org_id', orgId)
    .eq('assigned_user_id', user.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks?.filter((task) => task.due_date && task.due_date < today && task.status !== 'DONE') || []

  return {
    allTasks: (tasks || []) as Task[],
    overdue,
  }
}

export default async function ActionsPage() {
  const context = await getOrgContext()
  if (!context) redirect('/app')

  const { allTasks, overdue } = await getMyTasks()
  const isDemo = context.isDemo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Action Center</h1>
          <p className="text-muted-foreground">Your tasks and quick actions</p>
        </div>
        {!isDemo && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Plus className="h-4 w-4 mr-2" />
              Lead
            </Button>
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Plus className="h-4 w-4 mr-2" />
              Task
            </Button>
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Plus className="h-4 w-4 mr-2" />
              Work Order
            </Button>
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Plus className="h-4 w-4 mr-2" />
              Invoice
            </Button>
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Plus className="h-4 w-4 mr-2" />
              Ticket
            </Button>
          </div>
        )}
      </div>

      {overdue.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-section font-semibold">Overdue tasks</CardTitle>
              <CardDescription className="text-table-sm text-muted-foreground">
                Past-due items that need an owner update or next action.
              </CardDescription>
            </div>
            <Badge variant="destructive" className="flex-shrink-0">
              {overdue.length} overdue
            </Badge>
          </CardHeader>
          <CardContent>
            <TasksTable tasks={overdue} exportFilename="overdue-tasks.csv" />
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50">
        <CardHeader data-demo-tour="actions-tasks">
          <CardTitle className="text-section font-semibold">My tasks ({allTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksTable tasks={allTasks} exportFilename="my-tasks.csv" />
        </CardContent>
      </Card>
    </div>
  )
}
