'use client'

import { memo, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data/DataTable'
import { Task, Account, Opportunity } from '@/lib/actions/crm-actions'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EditTaskDialog } from './edit-task-dialog'
import { DeleteTaskDialog } from './delete-task-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TasksTableProps {
  tasks: Task[]
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

export const TasksTable = memo(function TasksTable({ tasks, accounts, opportunities }: TasksTableProps) {
  const router = useRouter()
  
  const accountMap = useMemo(() =>
    new Map(accounts.map(a => [a.id, a])),
    [accounts]
  )
  const oppMap = useMemo(() =>
    new Map(opportunities.map(o => [o.id, o])),
    [opportunities]
  )

  const columns: ColumnDef<Task>[] = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'related_type',
      header: 'Related To',
      cell: ({ row }) => {
        const task = row.original
        if (task.related_type === 'account' && task.related_id) {
          const account = accountMap.get(task.related_id)
          return account ? (
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => router.push(`/app/crm/accounts/${task.related_id}`)}
            >
              {account.name}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          ) : '—'
        } else if (task.related_type === 'opportunity' && task.related_id) {
          const opp = oppMap.get(task.related_id)
          return opp ? (
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => router.push(`/app/crm/opportunities/${task.related_id}`)}
            >
              {opp.name}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          ) : '—'
        }
        return '—'
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string
        return <Badge variant={getPriorityBadgeVariant(priority)}>{priority}</Badge>
      },
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.getValue('due_date') as string | null
        return date ? formatDate(date) : '—'
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        return formatDate(date)
      },
    },
    {
      id: 'data_origin',
      header: 'Origin',
      cell: ({ row }) => {
        const task = row.original
        const origin = task.metadata?.data_origin || 'seeded'
        const labels: Record<string, string> = {
          manual: 'Manual',
          imported: 'Imported',
          seeded: 'Seeded (demo)',
        }
        return <Badge variant="outline">{labels[origin] || origin}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const task = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/app/crm/tasks/${task.id}`)}>
                View Details
              </DropdownMenuItem>
              <EditTaskDialog task={task} accounts={accounts} opportunities={opportunities}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </EditTaskDialog>
              <DeleteTaskDialog taskId={task.id}>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DeleteTaskDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [accountMap, oppMap, router, accounts, opportunities])

  return (
    <DataTable
      columns={columns}
      data={tasks}
      searchKey="title"
    />
  )
})


