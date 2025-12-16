'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data/DataTable'
import { ClientProject } from '@/lib/actions/client-project-actions'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusColors: Record<string, string> = {
  onboarding: 'bg-blue-100 text-blue-800 border-blue-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  at_risk: 'bg-orange-100 text-orange-800 border-orange-200',
  paused: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200',
}

const statusLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  active: 'Active',
  at_risk: 'At Risk',
  paused: 'Paused',
  completed: 'Completed',
}

const columns: ColumnDef<ClientProject>[] = [
  {
    accessorKey: 'name',
    header: 'Project Name',
    cell: ({ row }) => {
      const project = row.original
      return (
        <Link
          href={`/app/clients/${project.id}`}
          className="font-medium text-primary hover:underline"
        >
          {project.name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant="outline"
          className={statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}
        >
          {statusLabels[status] || status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'next_review_date',
    header: 'Next Review',
    cell: ({ row }) => {
      const date = row.getValue('next_review_date') as string | null
      return date ? formatDate(date) : <span className="text-muted-foreground">—</span>
    },
  },
  {
    id: 'account',
    header: 'Account',
    cell: ({ row }) => {
      const project = row.original
      // We'll need to fetch account name separately or join in the query
      return (
        <Link
          href={`/app/crm/accounts/${project.account_id}`}
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          View Account
        </Link>
      )
    },
  },
  {
    id: 'opportunity',
    header: 'Opportunity',
    cell: ({ row }) => {
      const project = row.original
      if (!project.opportunity_id) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <Link
          href={`/app/crm/opportunities/${project.opportunity_id}`}
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          View Opportunity
        </Link>
      )
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
      const project = row.original
      const router = useRouter()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/app/clients/${project.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            {project.production_os_instance_id && (
              <DropdownMenuItem
                onClick={() => router.push(`/app/operate?client=${project.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Operate Mode
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface ClientProjectsTableProps {
  projects: ClientProject[]
}

export function ClientProjectsTable({ projects }: ClientProjectsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={projects}
      searchKey="name"
      searchPlaceholder="Search projects..."
      exportFilename="client-projects.csv"
      emptyStateTitle="No client projects found"
      emptyStateDescription="Try adjusting your search or filters."
    />
  )
}
