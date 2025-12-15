'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data/DataTable'
import { Quote, Account } from '@/lib/actions/crm-actions'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DeleteQuoteDialog } from './delete-quote-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface QuotesTableProps {
  quotes: Quote[]
  accounts: Account[]
}

export function QuotesTable({ quotes, accounts }: QuotesTableProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))

  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const quote = row.original
        return (
          <Link
            href={`/app/crm/quotes/${quote.id}`}
            className="text-primary hover:underline"
          >
            {quote.name}
          </Link>
        )
      },
    },
    {
      accessorKey: 'account_id',
      header: 'Account',
      cell: ({ row }) => {
        const accountId = row.getValue('account_id') as string
        return accountMap.get(accountId) || accountId
      },
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
      accessorKey: 'one_time_total',
      header: 'One-Time',
      cell: ({ row }) => {
        const amount = row.getValue('one_time_total') as number
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: 'recurring_total',
      header: 'Recurring',
      cell: ({ row }) => {
        const amount = row.getValue('recurring_total') as number
        return formatCurrency(amount)
      },
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const quote = row.original
        const total = (quote.one_time_total || 0) + (quote.recurring_total || 0)
        return formatCurrency(total)
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
      id: 'actions',
      cell: ({ row }) => {
        const quote = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/app/crm/quotes/${quote.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Builder
                </Link>
              </DropdownMenuItem>
              <DeleteQuoteDialog quoteId={quote.id}>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DeleteQuoteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={quotes}
      searchKey="name"
      searchPlaceholder="Search quotes..."
      exportFilename="quotes.csv"
    />
  )
}

