'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data/DataTable'
import { Opportunity, Account } from '@/lib/actions/crm-actions'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EditOpportunityDialog } from './edit-opportunity-dialog'
import { DeleteOpportunityDialog } from './delete-opportunity-dialog'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OpportunitiesTableProps {
  opportunities: Opportunity[]
  accounts: Account[]
}

export function OpportunitiesTable({ opportunities, accounts }: OpportunitiesTableProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))

  const columns: ColumnDef<Opportunity>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
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
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number
        return formatCurrency(amount)
      },
    },
    {
      accessorKey: 'close_date',
      header: 'Close Date',
      cell: ({ row }) => {
        const date = row.getValue('close_date') as string | null
        return date ? formatDate(date) : '-'
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
        const opportunity = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditOpportunityDialog opportunity={opportunity} accounts={accounts}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </EditOpportunityDialog>
              <DeleteOpportunityDialog opportunityId={opportunity.id}>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DeleteOpportunityDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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

