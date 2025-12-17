'use client'

import { memo, useMemo } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'

interface DataSourceRow {
  name: string
  last_sync_at: string | null
  status: string | null
  cadence: string | null
}

const getDataSourceColumns = (): ColumnDef<DataSourceRow>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'last_sync_at',
    header: 'Last Sync',
    cell: ({ row }) => {
      const date = row.getValue('last_sync_at') as string | null
      return date ? new Date(date).toLocaleString() : 'Never'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string | null
      return status ? <Badge variant="outline">{status}</Badge> : '-'
    },
  },
  {
    accessorKey: 'cadence',
    header: 'Cadence (hours)',
  },
]

export const DataSourcesTable = memo(function DataSourcesTable({ dataSources }: { dataSources: DataSourceRow[] }) {
  const columns = useMemo(() => getDataSourceColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={dataSources}
      searchKey="name"
      searchPlaceholder="Search data sources..."
      exportFilename="data-sources.csv"
    />
  )
})

