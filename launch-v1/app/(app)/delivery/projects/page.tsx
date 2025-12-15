import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, Plus, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: projects } = await supabase
    .from('delivery_projects')
    .select('*, companies(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const statusColors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    planning: 'Planning',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery Projects</h1>
          <p className="text-muted-foreground">
            Manage client implementations and pilot projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/delivery/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/app/delivery/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {(project.companies as any)?.name || 'No company'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                      {project.target_end_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due {formatDate(project.target_end_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Projects are created when you convert an accepted pilot scope.
            </p>
            <Button asChild>
              <Link href="/app/sales/opportunities">
                View Opportunities
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
