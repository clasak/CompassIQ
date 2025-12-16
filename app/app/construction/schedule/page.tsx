import { listScheduleMilestones, listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ConstructionSchedulePage() {
  const milestonesResult = await listScheduleMilestones()
  const projectsResult = await listConstructionProjects()
  
  const milestones = milestonesResult.milestones || []
  const projects = projectsResult.projects || []
  const projectMap = new Map(projects.map(p => [p.id, p]))

  // Calculate schedule variance
  const milestonesWithVariance = milestones.map(m => {
    if (!m.baseline_date || !m.forecast_date) return { ...m, varianceDays: null }
    const baseline = new Date(m.baseline_date)
    const forecast = new Date(m.forecast_date)
    const varianceDays = Math.floor((forecast.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24))
    return { ...m, varianceDays }
  })

  // Critical slippage (behind by more than 7 days)
  const criticalSlippage = milestonesWithVariance.filter(m => m.varianceDays !== null && m.varianceDays < -7)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule / Milestones & Variance"
        description="Project milestones with baseline vs forecast analysis"
      />

      {/* Critical Slippage Alert */}
      {criticalSlippage.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Critical Slippage (&gt;7 days behind)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalSlippage.map((m) => {
                const project = projectMap.get(m.project_id)
                return (
                  <div key={m.id} className="p-3 bg-white rounded border border-red-200">
                    <div className="flex justify-between">
                      <div>
                        {project ? (
                          <Link href={`/app/construction/projects/${m.project_id}`} className="font-medium hover:underline">
                            {project.name}: {m.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{m.name}</span>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Baseline: {m.baseline_date} → Forecast: {m.forecast_date}
                        </p>
                      </div>
                      <Badge className="bg-red-600">
                        {m.varianceDays} days behind
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>All Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-muted-foreground">No milestones available. Import data to get started.</p>
          ) : (
            <div className="space-y-2">
              {milestonesWithVariance.map((m) => {
                const project = projectMap.get(m.project_id)
                return (
                  <div key={m.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        {project ? (
                          <Link href={`/app/construction/projects/${m.project_id}`} className="font-medium hover:underline">
                            {project.name}: {m.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{m.name}</span>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          {m.baseline_date && <span>Baseline: {m.baseline_date}</span>}
                          {m.forecast_date && <span className="ml-3">Forecast: {m.forecast_date}</span>}
                          {m.actual_date && <span className="ml-3">Actual: {m.actual_date}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge>{m.status}</Badge>
                        {m.varianceDays !== null && (
                          <p className={`text-sm mt-1 ${m.varianceDays < 0 ? 'text-red-600' : m.varianceDays > 0 ? 'text-green-600' : ''}`}>
                            {m.varianceDays > 0 ? '+' : ''}{m.varianceDays} days
                          </p>
                        )}
                      </div>
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
