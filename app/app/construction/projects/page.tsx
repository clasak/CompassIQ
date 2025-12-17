import { listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const statusColors: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETE: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default async function ConstructionProjectsPage() {
  const result = await listConstructionProjects()
  const projects = result.projects || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects / Jobs"
        subtitle="Manage construction projects and jobs"
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects found. Import data or create a project to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/app/construction/projects/${project.id}`}
                        className="text-xl font-semibold hover:underline"
                      >
                        {project.name}
                      </Link>
                      <Badge className={statusColors[project.status] || 'bg-gray-100 text-gray-800'}>
                        {project.status}
                      </Badge>
                    </div>
                    {project.job_number && (
                      <p className="text-sm text-muted-foreground mb-1">Job #: {project.job_number}</p>
                    )}
                    {project.customer_name && (
                      <p className="text-sm text-muted-foreground mb-1">Customer: {project.customer_name}</p>
                    )}
                    {project.pm_name && (
                      <p className="text-sm text-muted-foreground mb-1">PM: {project.pm_name}</p>
                    )}
                    {project.region && (
                      <p className="text-sm text-muted-foreground">Region: {project.region}</p>
                    )}
                    {(project.metadata as any)?.contract_value && (
                      <p className="text-sm font-medium mt-2">
                        Contract Value: {formatCurrency((project.metadata as any).contract_value)}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/app/construction/projects/${project.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


