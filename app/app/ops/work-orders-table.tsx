'use client'

import { memo, useMemo } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'

interface WorkOrder {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  completed_at: string | null
  blocker_reason: string | null
  accounts: { name: string } | { name: string }[] | null
}

const getColumns = (): ColumnDef<WorkOrder>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'accounts.name',
    header: 'Account',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <Badge variant="outline">{status}</Badge>
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      const colorMap: Record<string, string> = {
        LOW: 'bg-blue-100 text-blue-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-orange-100 text-orange-800',
        URGENT: 'bg-red-100 text-red-800',
      }
      return <Badge className={colorMap[priority] || ''}>{priority}</Badge>
    },
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
  },
  {
    accessorKey: 'completed_at',
    header: 'Completed',
  },
  {
    id: 'on_time',
    header: 'On Time',
    accessorFn: (row) => {
      if (row.status !== 'DONE' || !row.due_date || !row.completed_at) return ''
      return new Date(row.completed_at) <= new Date(row.due_date) ? 'On Time' : 'Late'
    },
    cell: ({ row }) => {
      const dueDate = row.original.due_date
      const completedAt = row.original.completed_at
      if (row.original.status !== 'DONE' || !dueDate || !completedAt) {
        return <span className="text-muted-foreground">—</span>
      }
      const onTime = new Date(completedAt) <= new Date(dueDate)
      return (
        <Badge className={onTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {onTime ? 'On Time' : 'Late'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'blocker_reason',
    header: 'Blocker',
  },
]

export const WorkOrdersTable = memo(function WorkOrdersTable({ workOrders }: { workOrders: WorkOrder[] }) {
  const columns = useMemo(() => getColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={workOrders}
      searchKey="title"
      searchPlaceholder="Search work orders..."
      exportFilename="work-orders.csv"
    />
  )
})
