'use client'

import { Task, Account, Opportunity } from '@/lib/actions/crm-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { EditTaskDialog } from '../edit-task-dialog'
import { DeleteTaskDialog } from '../delete-task-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TaskDetailViewProps {
  task: Task
  accounts: Account[]
  opportunities: Opportunity[]
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'DONE':
      return 'default'
    case 'IN_PROGRESS':
      return 'secondary'
    case 'CANCELLED':
      return 'outline'
    default:
      return 'outline'
  }
}

function getPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'URGENT':
      return 'destructive'
    case 'HIGH':
      return 'default'
    case 'MEDIUM':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function TaskDetailView({ task, accounts, opportunities }: TaskDetailViewProps) {
  const router = useRouter()
  const account = task.related_type === 'account' && task.related_id
    ? accounts.find(a => a.id === task.related_id)
    : null
  const opportunity = task.related_type === 'opportunity' && task.related_id
    ? opportunities.find(o => o.id === task.related_id)
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>Task ID: {task.id}</CardDescription>
            </div>
            <div className="flex gap-2">
              <EditTaskDialog task={task} accounts={accounts} opportunities={opportunities}>
                <ActionButton actionType="admin" variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </ActionButton>
              </EditTaskDialog>
              <DeleteTaskDialog taskId={task.id}>
                <ActionButton actionType="admin" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </ActionButton>
              </DeleteTaskDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
              <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Priority</div>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Due Date</div>
              <div>{task.due_date ? formatDate(task.due_date) : '—'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
              <div>{formatDate(task.created_at)}</div>
            </div>
          </div>
          
          {account && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Related Account</div>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => router.push(`/app/crm/accounts/${account.id}`)}
              >
                {account.name}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
          
          {opportunity && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Related Opportunity</div>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => router.push(`/app/crm/opportunities/${opportunity.id}`)}
              >
                {opportunity.name}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}

          {task.metadata?.data_origin && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Data Origin</div>
              <Badge variant="outline">{task.metadata.data_origin}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


