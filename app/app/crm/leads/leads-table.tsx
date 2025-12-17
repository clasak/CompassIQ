'use client'

import { memo, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data/DataTable'
import { Lead } from '@/lib/actions/crm-actions'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EditLeadDialog } from './edit-lead-dialog'
import { DeleteLeadDialog } from './delete-lead-dialog'
import { ActionButton } from '@/components/ui/action-button'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const getColumns = (): ColumnDef<Lead>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'company',
    header: 'Company',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'source',
    header: 'Source',
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
      const lead = row.original
      const origin = (lead as any).metadata?.data_origin || 'seeded'
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
      const lead = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditLeadDialog lead={lead}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </EditLeadDialog>
            <DeleteLeadDialog leadId={lead.id}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DeleteLeadDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface LeadsTableProps {
  leads: Lead[]
}

export const LeadsTable = memo(function LeadsTable({ leads }: LeadsTableProps) {
  const columns = useMemo(() => getColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={leads}
      searchKey="name"
      searchPlaceholder="Search leads..."
      exportFilename="leads.csv"
      emptyStateTitle="No leads yet"
      emptyStateDescription="Sales leads and contacts will appear here. Create your first lead to get started."
      emptyStateAction={
        <Button asChild>
          <a href="/app/crm/leads">Create Lead</a>
        </Button>
      }
    />
  )
})

