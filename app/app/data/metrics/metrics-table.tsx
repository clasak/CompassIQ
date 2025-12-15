'use client'

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

const columns: ColumnDef<MetricRow>[] = [
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

export function MetricsTable({ metrics }: { metrics: MetricRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={metrics}
      searchKey="name"
      searchPlaceholder="Search metrics..."
      exportFilename="metrics.csv"
    />
  )
}

