import { listJobCostSnapshots, listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function ConstructionCostPage() {
  const snapshotsResult = await listJobCostSnapshots()
  const projectsResult = await listConstructionProjects()
  
  const snapshots = snapshotsResult.snapshots || []
  const projects = projectsResult.projects || []
  const projectMap = new Map(projects.map(p => [p.id, p]))

  // Group by project
  const byProject = new Map<string, typeof snapshots>()
  snapshots.forEach(s => {
    const existing = byProject.get(s.project_id) || []
    byProject.set(s.project_id, [...existing, s])
  })

  // Calculate totals
  const totalBudget = snapshots.reduce((sum, s) => sum + s.budget, 0)
  const totalActual = snapshots.reduce((sum, s) => sum + s.actual_cost, 0)
  const totalVariance = totalActual - totalBudget
  const variancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Cost / Budget vs Actual"
        description="Job cost snapshots with budget vs actual analysis"
      />

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalVariance < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalVariance)} ({variancePercent.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Snapshots by Project */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Snapshots by Project</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <p className="text-muted-foreground">No cost snapshots available. Import data to get started.</p>
          ) : (
            <div className="space-y-4">
              {Array.from(byProject.entries()).map(([projectId, projectSnapshots]) => {
                const project = projectMap.get(projectId)
                const projectBudget = projectSnapshots.reduce((sum, s) => sum + s.budget, 0)
                const projectActual = projectSnapshots.reduce((sum, s) => sum + s.actual_cost, 0)
                const projectVariance = projectActual - projectBudget

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
                        <p className="text-sm text-muted-foreground">Budget: {formatCurrency(projectBudget)}</p>
                        <p className="text-sm text-muted-foreground">Actual: {formatCurrency(projectActual)}</p>
                        <p className={`font-medium ${projectVariance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Variance: {formatCurrency(projectVariance)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {projectSnapshots.map((snapshot) => (
                        <div key={snapshot.id} className="p-2 bg-muted/50 rounded text-sm">
                          <div className="flex justify-between">
                            <span>{snapshot.snapshot_date}</span>
                            <div className="text-right">
                              <span>B: {formatCurrency(snapshot.budget)}</span>
                              <span className="ml-2">A: {formatCurrency(snapshot.actual_cost)}</span>
                              <span className={`ml-2 ${snapshot.actual_cost - snapshot.budget < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                V: {formatCurrency(snapshot.actual_cost - snapshot.budget)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
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
