import { listLaborEntries, listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function ConstructionLaborPage() {
  const laborResult = await listLaborEntries()
  const projectsResult = await listConstructionProjects()
  
  const laborEntries = laborResult.laborEntries || []
  const projects = projectsResult.projects || []
  const projectMap = new Map(projects.map(p => [p.id, p]))

  // Group by project
  const byProject = new Map<string, typeof laborEntries>()
  laborEntries.forEach(entry => {
    const existing = byProject.get(entry.project_id) || []
    byProject.set(entry.project_id, [...existing, entry])
  })

  // Calculate productivity metrics
  const totalHours = laborEntries.reduce((sum, e) => sum + e.hours, 0)
  const totalCost = laborEntries.reduce((sum, e) => sum + e.cost, 0)
  const totalUnits = laborEntries.reduce((sum, e) => sum + (e.units_completed || 0), 0)
  const productivity = totalUnits > 0 ? totalHours / totalUnits : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Labor / Productivity"
        subtitle="Labor entries and productivity analysis"
      />

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {productivity !== null ? `${productivity.toFixed(2)} hrs/unit` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Labor by Project */}
      <Card>
        <CardHeader>
          <CardTitle>Labor Entries by Project</CardTitle>
        </CardHeader>
        <CardContent>
          {laborEntries.length === 0 ? (
            <p className="text-muted-foreground">No labor entries available. Import data to get started.</p>
          ) : (
            <div className="space-y-4">
              {Array.from(byProject.entries()).map(([projectId, projectEntries]) => {
                const project = projectMap.get(projectId)
                const projectHours = projectEntries.reduce((sum, e) => sum + e.hours, 0)
                const projectCost = projectEntries.reduce((sum, e) => sum + e.cost, 0)
                const projectUnits = projectEntries.reduce((sum, e) => sum + (e.units_completed || 0), 0)

                return (
                  <div key={projectId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {project ? (
                          <Link href={`/app/construction/projects/${projectId}`} className="font-semibold hover:underline">
                            {project.name}
                          </Link>
                        ) : (
                          <span className="font-semibold">Project {projectId.slice(0, 8)}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{projectHours.toFixed(1)} hours</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(projectCost)}</p>
                        {projectUnits > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {(projectHours / projectUnits).toFixed(2)} hrs/unit
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {projectEntries.slice(0, 10).map((entry) => (
                        <div key={entry.id} className="p-2 bg-muted/50 rounded text-sm">
                          <div className="flex justify-between">
                            <span>
                              {entry.work_date}
                              {entry.crew && <span className="text-muted-foreground ml-2">Crew: {entry.crew}</span>}
                              {entry.trade && <span className="text-muted-foreground ml-2">Trade: {entry.trade}</span>}
                            </span>
                            <div className="text-right">
                              <span>{entry.hours} hrs</span>
                              <span className="ml-2">{formatCurrency(entry.cost)}</span>
                              {entry.units_completed && (
                                <span className="ml-2 text-muted-foreground">
                                  ({entry.units_completed} units)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {projectEntries.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{projectEntries.length - 10} more entries
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
