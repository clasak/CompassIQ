import { listConstructionProjects, listJobCostSnapshots, listChangeOrders, listScheduleMilestones, listLaborEntries, listEquipmentLogs, listConstructionInvoices } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'

const statusColors: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETE: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectsResult = await listConstructionProjects()
  const project = projectsResult.projects?.find(p => p.id === params.id)

  if (!project) {
    notFound()
  }

  const [costResult, changesResult, milestonesResult, laborResult, equipmentResult, invoicesResult] = await Promise.all([
    listJobCostSnapshots(project.id),
    listChangeOrders(project.id),
    listScheduleMilestones(project.id),
    listLaborEntries(project.id),
    listEquipmentLogs(project.id),
    listConstructionInvoices(project.id),
  ])

  const costSnapshots = costResult.snapshots || []
  const changeOrders = changesResult.changeOrders || []
  const milestones = milestonesResult.milestones || []
  const laborEntries = laborResult.laborEntries || []
  const equipmentLogs = equipmentResult.equipmentLogs || []
  const invoices = invoicesResult.invoices || []

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        subtitle={project.job_number ? `Job #${project.job_number}` : 'Project details'}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={statusColors[project.status] || 'bg-gray-100 text-gray-800'}>
              {project.status}
            </Badge>
          </CardContent>
        </Card>
        {project.customer_name && (
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{project.customer_name}</p>
            </CardContent>
          </Card>
        )}
        {project.pm_name && (
          <Card>
            <CardHeader>
              <CardTitle>Project Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{project.pm_name}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="cost" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="changes">Change Orders</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="ar">AR</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Cost Snapshots</CardTitle>
            </CardHeader>
            <CardContent>
              {costSnapshots.length === 0 ? (
                <p className="text-muted-foreground">No cost snapshots available</p>
              ) : (
                <div className="space-y-2">
                  {costSnapshots.map((snapshot) => (
                    <div key={snapshot.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{snapshot.snapshot_date}</span>
                        <div className="text-right">
                          <p>Budget: {formatCurrency(snapshot.budget)}</p>
                          <p>Actual: {formatCurrency(snapshot.actual_cost)}</p>
                          <p className="text-sm text-muted-foreground">
                            Variance: {formatCurrency(snapshot.actual_cost - snapshot.budget)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-muted-foreground">No milestones available</p>
              ) : (
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{milestone.name}</span>
                        <div className="text-right text-sm">
                          {milestone.baseline_date && <p>Baseline: {milestone.baseline_date}</p>}
                          {milestone.forecast_date && <p>Forecast: {milestone.forecast_date}</p>}
                          {milestone.actual_date && <p>Actual: {milestone.actual_date}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {changeOrders.length === 0 ? (
                <p className="text-muted-foreground">No change orders available</p>
              ) : (
                <div className="space-y-2">
                  {changeOrders.map((co) => (
                    <div key={co.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{co.number}: {co.title}</span>
                          <Badge className="ml-2">{co.status}</Badge>
                        </div>
                        <div className="text-right">
                          <p>{formatCurrency(co.amount)}</p>
                          {co.submitted_date && <p className="text-sm text-muted-foreground">Submitted: {co.submitted_date}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Labor Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {laborEntries.length === 0 ? (
                <p className="text-muted-foreground">No labor entries available</p>
              ) : (
                <div className="space-y-2">
                  {laborEntries.slice(0, 20).map((entry) => (
                    <div key={entry.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{entry.work_date}</span>
                          {entry.crew && <span className="text-sm text-muted-foreground ml-2">Crew: {entry.crew}</span>}
                          {entry.trade && <span className="text-sm text-muted-foreground ml-2">Trade: {entry.trade}</span>}
                        </div>
                        <div className="text-right">
                          <p>{entry.hours} hours</p>
                          <p className="text-sm">{formatCurrency(entry.cost)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentLogs.length === 0 ? (
                <p className="text-muted-foreground">No equipment logs available</p>
              ) : (
                <div className="space-y-2">
                  {equipmentLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{log.equipment_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{log.date}</span>
                        </div>
                        <div className="text-right">
                          <p>{log.hours_used} hours used</p>
                          {log.idle_hours > 0 && <p className="text-sm text-muted-foreground">{log.idle_hours} idle</p>}
                          <p className="text-sm">{formatCurrency(log.cost)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AR Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground">No invoices available</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{inv.invoice_number}</span>
                          <span className="text-sm text-muted-foreground ml-2">{inv.customer}</span>
                          <Badge className="ml-2">{inv.status}</Badge>
                        </div>
                        <div className="text-right">
                          <p>{formatCurrency(inv.amount)}</p>
                          <p className="text-sm text-muted-foreground">Balance: {formatCurrency(inv.balance)}</p>
                          <p className="text-sm text-muted-foreground">Due: {inv.due_date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


