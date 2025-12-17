'use client'

import { memo, useMemo } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface InvoiceRow {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string | null
  total: number
  status: string
  paid_amount: number
  outstanding_amount: number
  accounts: { name: string } | null
}

const getColumns = (): ColumnDef<InvoiceRow>[] => [
  {
    accessorKey: 'invoice_number',
    header: 'Invoice #',
  },
  {
    accessorKey: 'accounts.name',
    header: 'Account',
  },
  {
    accessorKey: 'issue_date',
    header: 'Issue Date',
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(Number(row.getValue('total')) || 0),
  },
  {
    accessorKey: 'paid_amount',
    header: 'Paid',
    cell: ({ row }) => formatCurrency(Number(row.getValue('paid_amount')) || 0),
  },
  {
    accessorKey: 'outstanding_amount',
    header: 'Outstanding',
    cell: ({ row }) => formatCurrency(Number(row.getValue('outstanding_amount')) || 0),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colorMap: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        SENT: 'bg-blue-100 text-blue-800',
        OVERDUE: 'bg-red-100 text-red-800',
        PAID: 'bg-green-100 text-green-800',
        VOID: 'bg-gray-100 text-gray-800',
      }
      return <Badge className={colorMap[status] || ''}>{status}</Badge>
    },
  },
]

export const InvoicesTable = memo(function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const columns = useMemo(() => getColumns(), [])
  
  return (
    <DataTable
      columns={columns}
      data={invoices}
      searchKey="invoice_number"
      searchPlaceholder="Search invoices..."
      exportFilename="invoices.csv"
    />
  )
})

