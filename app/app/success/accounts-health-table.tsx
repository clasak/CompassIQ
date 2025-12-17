'use client'

import { memo, useMemo } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'

interface AccountRow {
  id: string
  name: string
  renewal_date: string | null
  segment: string | null
  industry: string | null
  health_score: number
}

const getAccountColumns = (): ColumnDef<AccountRow>[] => [
  {
    accessorKey: 'name',
    header: 'Account',
  },
  {
    accessorKey: 'segment',
    header: 'Segment',
  },
  {
    accessorKey: 'industry',
    header: 'Industry',
  },
  {
    accessorKey: 'health_score',
    header: 'Health Score',
    cell: ({ row }) => {
      const score = row.getValue('health_score') as number
      const color =
        score >= 80
          ? 'bg-green-100 text-green-800'
          : score >= 50
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
      return <Badge className={color}>{score}</Badge>
    },
  },
  {
    accessorKey: 'renewal_date',
    header: 'Renewal Date',
  },
]

export const AccountsHealthTable = memo(function AccountsHealthTable({ accounts }: { accounts: AccountRow[] }) {
  const columns = useMemo(() => getAccountColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={accounts}
      searchKey="name"
      searchPlaceholder="Search accounts..."
      exportFilename="accounts.csv"
    />
  )
})

