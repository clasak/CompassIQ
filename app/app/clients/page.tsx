import { getClientProjects } from '@/lib/actions/client-project-actions'
import { ClientProjectsTable } from './client-projects-table'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ClientProjectsPage() {
  const result = await getClientProjects()
  const projects = result.projects || []

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Client Projects"
        description="Manage client engagements from intake through delivery"
        action={
          <Link href="/app/crm/opportunities">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          title="No client projects yet"
          description="Convert a won opportunity to create your first client project, or create a preview to start the intake process."
          action={
            <div className="flex gap-2">
              <Link href="/app/crm/opportunities">
                <Button variant="outline">View Opportunities</Button>
              </Link>
              <Link href="/app/sales/preview">
                <Button>Create Preview</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <ClientProjectsTable projects={projects} />
      )}
    </div>
  )
}
