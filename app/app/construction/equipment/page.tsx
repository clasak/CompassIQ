import { listEquipmentLogs, listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function ConstructionEquipmentPage() {
  const equipmentResult = await listEquipmentLogs()
  const projectsResult = await listConstructionProjects()
  
  const equipmentLogs = equipmentResult.equipmentLogs || []
  const projects = projectsResult.projects || []
  const projectMap = new Map(projects.map(p => [p.id, p]))

  // Group by equipment name
  const byEquipment = new Map<string, typeof equipmentLogs>()
  equipmentLogs.forEach(log => {
    const existing = byEquipment.get(log.equipment_name) || []
    byEquipment.set(log.equipment_name, [...existing, log])
  })

  // Calculate utilization
  const totalHoursUsed = equipmentLogs.reduce((sum, log) => sum + log.hours_used, 0)
  const totalIdleHours = equipmentLogs.reduce((sum, log) => sum + log.idle_hours, 0)
  const totalAvailable = totalHoursUsed + totalIdleHours
  const utilizationPercent = totalAvailable > 0 ? (totalHoursUsed / totalAvailable) * 100 : 0

  // Equipment with high idle hours (alert threshold: >20 hours/week)
  const equipmentWithIdle = Array.from(byEquipment.entries()).map(([name, logs]) => {
    const totalIdle = logs.reduce((sum, log) => sum + log.idle_hours, 0)
    const totalUsed = logs.reduce((sum, log) => sum + log.hours_used, 0)
    const total = totalUsed + totalIdle
    const util = total > 0 ? (totalUsed / total) * 100 : 0
    return { name, logs, totalIdle, totalUsed, utilization: util }
  }).filter(e => e.totalIdle > 20)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment / Utilization"
        subtitle="Equipment logs and utilization analysis"
      />

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Hours Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHoursUsed.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Idle Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalIdleHours.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* High Idle Alerts */}
      {equipmentWithIdle.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">High Idle Hours Alert (&gt;20 hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipmentWithIdle.map((eq) => (
                <div key={eq.name} className="p-3 bg-white rounded border border-yellow-200">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{eq.name}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Utilization: {eq.utilization.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-600">{eq.totalIdle.toFixed(1)} idle hours</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{eq.totalUsed.toFixed(1)} used</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment by Project */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Logs by Project</CardTitle>
        </CardHeader>
        <CardContent>
          {equipmentLogs.length === 0 ? (
            <p className="text-muted-foreground">No equipment logs available. Import data to get started.</p>
          ) : (
            <div className="space-y-4">
              {Array.from(byEquipment.entries()).map(([equipmentName, logs]) => {
                const totalUsed = logs.reduce((sum, log) => sum + log.hours_used, 0)
                const totalIdle = logs.reduce((sum, log) => sum + log.idle_hours, 0)
                const totalCost = logs.reduce((sum, log) => sum + log.cost, 0)
                const total = totalUsed + totalIdle
                const util = total > 0 ? (totalUsed / total) * 100 : 0

                return (
                  <div key={equipmentName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-semibold">{equipmentName}</span>
                        <Badge className="ml-2">{util.toFixed(1)}% utilized</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{totalUsed.toFixed(1)} used</p>
                        <p className="text-sm text-muted-foreground">{totalIdle.toFixed(1)} idle</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(totalCost)}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {logs.slice(0, 10).map((log) => {
                        const project = projectMap.get(log.project_id)
                        return (
                          <div key={log.id} className="p-2 bg-muted/50 rounded text-sm">
                            <div className="flex justify-between">
                              <span>
                                {log.date}
                                {project && (
                                  <Link href={`/app/construction/projects/${log.project_id}`} className="text-primary hover:underline ml-2">
                                    {project.name}
                                  </Link>
                                )}
                                {log.location && <span className="text-muted-foreground ml-2">({log.location})</span>}
                              </span>
                              <div className="text-right">
                                <span>{log.hours_used} used</span>
                                {log.idle_hours > 0 && <span className="ml-2 text-muted-foreground">{log.idle_hours} idle</span>}
                                <span className="ml-2">{formatCurrency(log.cost)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {logs.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{logs.length - 10} more entries
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


