import { listConstructionProjects, listChangeOrders, listConstructionInvoices } from '@/lib/actions/construction-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'
import { AlertsPanel } from '@/components/alerts/AlertsPanel'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle } from 'lucide-react'

async function getConstructionKPIs() {
  const projectsResult = await listConstructionProjects()
  const changeOrdersResult = await listChangeOrders()
  const invoicesResult = await listConstructionInvoices()

  const projects = projectsResult.projects || []
  const changeOrders = changeOrdersResult.changeOrders || []
  const invoices = invoicesResult.invoices || []

  // Calculate KPIs
  const activeProjects = projects.filter(p => p.status === 'ACTIVE')
  const totalBacklog = projects
    .filter(p => ['PLANNING', 'ACTIVE'].includes(p.status))
    .reduce((sum, p) => sum + (Number((p.metadata as any)?.contract_value) || 0), 0)

  const pendingChangeOrders = changeOrders.filter(co => co.status === 'PENDING')
  const pendingChangeOrderValue = pendingChangeOrders.reduce((sum, co) => sum + co.amount, 0)
  const changeOrderAging = pendingChangeOrders
    .filter(co => co.submitted_date)
    .map(co => {
      const submitted = new Date(co.submitted_date!)
      const now = new Date()
      return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
    })
    .reduce((sum, days) => sum + days, 0) / (pendingChangeOrders.length || 1)

  const arOutstanding = invoices
    .filter(inv => inv.status !== 'PAID' && inv.status !== 'VOID')
    .reduce((sum, inv) => sum + inv.balance, 0)

  const arOver60 = invoices
    .filter(inv => {
      if (inv.status === 'PAID' || inv.status === 'VOID') return false
      const due = new Date(inv.due_date)
      const now = new Date()
      const daysPastDue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
      return daysPastDue > 60
    })
    .reduce((sum, inv) => sum + inv.balance, 0)

  // At-risk projects (simplified - projects with pending change orders or high AR)
  const atRiskProjects = projects.filter(p => {
    const projectChangeOrders = changeOrders.filter(co => co.project_id === p.id && co.status === 'PENDING')
    const projectInvoices = invoices.filter(inv => inv.project_id === p.id && inv.status !== 'PAID')
    return projectChangeOrders.length > 0 || projectInvoices.length > 0
  })

  return {
    totalBacklog,
    activeProjectsCount: activeProjects.length,
    pendingChangeOrderValue,
    changeOrderAging,
    arOutstanding,
    arOver60,
    atRiskProjects: atRiskProjects.slice(0, 5),
  }
}

export default async function ConstructionCommandCenter() {
  const kpis = await getConstructionKPIs()

  // Mock alerts for now (will be calculated from actual data)
  const alerts: Array<{
    id: string
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    count: number
    route: string
  }> = [
    {
      id: '1',
      title: 'Pending Change Orders',
      description: `${kpis.pendingChangeOrderValue > 0 ? formatCurrency(kpis.pendingChangeOrderValue) : 'No'} in approved change orders not yet billed`,
      severity: (kpis.pendingChangeOrderValue > 100000 ? 'high' : 'medium') as 'high' | 'medium',
      count: kpis.pendingChangeOrderValue > 0 ? 1 : 0,
      route: '/app/construction/changes',
    },
    {
      id: '2',
      title: 'AR Over 60 Days',
      description: `${formatCurrency(kpis.arOver60)} in receivables over 60 days old`,
      severity: (kpis.arOver60 > 50000 ? 'high' : 'medium') as 'high' | 'medium',
      count: kpis.arOver60 > 0 ? 1 : 0,
      route: '/app/construction/ar',
    },
  ].filter(a => a.count > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Construction Command Center"
        subtitle="Portfolio overview, at-risk projects, and critical alerts"
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIStatCard title="Total Backlog" value={formatCurrency(kpis.totalBacklog)} />
        <KPIStatCard title="Active Projects" value={kpis.activeProjectsCount.toString()} />
        <KPIStatCard title="Pending Change Orders" value={formatCurrency(kpis.pendingChangeOrderValue)} />
        <KPIStatCard title="AR Outstanding" value={formatCurrency(kpis.arOutstanding)} />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Hot Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsPanel alerts={alerts} />
          </CardContent>
        </Card>
      )}

      {/* At-Risk Projects */}
      {kpis.atRiskProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpis.atRiskProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <Link href={`/app/construction/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                    {project.job_number && (
                      <span className="text-sm text-muted-foreground ml-2">({project.job_number})</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/app/construction/projects/${project.id}`}>
                      View <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/app/construction/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/app/construction/cost">View Cost Analysis</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/app/construction/schedule">View Schedule</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/app/construction/changes">View Change Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


