'use client'

import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'

interface TicketRow {
  id: string
  title: string
  status: string
  priority: string
  opened_at: string
  first_response_at: string | null
  resolved_at: string | null
  accounts: { name: string } | { name: string }[] | null
}

const ticketColumns: ColumnDef<TicketRow>[] = [
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
    accessorKey: 'opened_at',
    header: 'Opened',
  },
  {
    accessorKey: 'first_response_at',
    header: 'First Response',
  },
  {
    accessorKey: 'resolved_at',
    header: 'Resolved',
  },
]

export function TicketsTable({ tickets }: { tickets: TicketRow[] }) {
  return (
    <DataTable
      columns={ticketColumns}
      data={tickets}
      searchKey="title"
      searchPlaceholder="Search tickets..."
      exportFilename="tickets.csv"
    />
  )
}
