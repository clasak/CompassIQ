'use client'

import { memo, useMemo } from 'react'
import { DataTable } from '@/components/data/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface MetricRow {
  id: string
  key: string
  name: string
  description: string | null
  formula: string | null
  source: string | null
  cadence: string | null
}

const getColumns = (): ColumnDef<MetricRow>[] => [
  {
    accessorKey: 'key',
    header: 'Key',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'formula',
    header: 'Formula',
  },
  {
    accessorKey: 'source',
    header: 'Source',
  },
  {
    accessorKey: 'cadence',
    header: 'Cadence',
  },
]

export const MetricsTable = memo(function MetricsTable({ metrics }: { metrics: MetricRow[] }) {
  const columns = useMemo(() => getColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={metrics}
      searchKey="name"
      searchPlaceholder="Search metrics..."
      exportFilename="metrics.csv"
    />
  )
})

