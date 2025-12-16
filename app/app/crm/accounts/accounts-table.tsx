'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data/DataTable'
import { Account } from '@/lib/actions/crm-actions'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EditAccountDialog } from './edit-account-dialog'
import { DeleteAccountDialog } from './delete-account-dialog'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, Building2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const columns: ColumnDef<Account>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'industry',
    header: 'Industry',
  },
  {
    accessorKey: 'website',
    header: 'Website',
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
      const account = row.original
      const origin = (account as any).metadata?.data_origin || 'seeded'
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
      const account = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditAccountDialog account={account}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </EditAccountDialog>
            <DeleteAccountDialog accountId={account.id}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DeleteAccountDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface AccountsTableProps {
  accounts: Account[]
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={accounts}
      searchKey="name"
      searchPlaceholder="Search accounts..."
      exportFilename="accounts.csv"
      emptyStateTitle="No accounts yet"
      emptyStateDescription="Companies you work with will appear here. Create your first account to get started."
      emptyStateAction={
        <Button asChild>
          <a href="/app/crm/accounts">
            <Building2 className="h-4 w-4 mr-2" />
            Create Account
          </a>
        </Button>
      }
    />
  )
}


