'use client'

import { memo, useMemo } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'

interface TaskRow {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  related_type: string | null
  related_id: string | null
}

const getColumns = (): ColumnDef<TaskRow>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
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
    cell: ({ row }) => {
      const dueDate = row.getValue('due_date') as string | null
      if (!dueDate) return '-'
      const date = new Date(dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isOverdue = date < today
      return <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{dueDate}</span>
    },
  },
  {
    accessorKey: 'related_type',
    header: 'Related To',
    cell: ({ row }) => {
      const type = row.getValue('related_type') as string | null
      return type || '-'
    },
  },
]

export const TasksTable = memo(function TasksTable({
  tasks,
  exportFilename,
}: {
  tasks: TaskRow[]
  exportFilename: string
}) {
  const columns = useMemo(() => getColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={tasks}
      searchKey="title"
      searchPlaceholder="Search tasks..."
      exportFilename={exportFilename}
    />
  )
})

