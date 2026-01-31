'use client'

import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface Opportunity {
  id: string
  name: string
  stage: string
  amount: number
  close_date: string | null
  source: string | null
  accounts: { name: string } | { name: string }[] | null
}

const columns: ColumnDef<Opportunity>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'accounts.name',
    header: 'Account',
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row }) => {
      const stage = row.getValue('stage') as string
      return <Badge variant="outline">{stage}</Badge>
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(Number(row.getValue('amount')) || 0),
  },
  {
    accessorKey: 'close_date',
    header: 'Close Date',
  },
  {
    accessorKey: 'source',
    header: 'Source',
  },
]

export function OpportunitiesTable({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <DataTable
      columns={columns}
      data={opportunities}
      searchKey="name"
      searchPlaceholder="Search opportunities..."
      exportFilename="opportunities.csv"
    />
  )
}
