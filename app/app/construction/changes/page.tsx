import { listChangeOrders, listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function ConstructionChangesPage() {
  const changeOrdersResult = await listChangeOrders()
  const projectsResult = await listConstructionProjects()
  
  const changeOrders = changeOrdersResult.changeOrders || []
  const projects = projectsResult.projects || []
  const projectMap = new Map(projects.map(p => [p.id, p]))

  // Group by status
  const byStatus = {
    PENDING: changeOrders.filter(co => co.status === 'PENDING'),
    APPROVED: changeOrders.filter(co => co.status === 'APPROVED'),
    REJECTED: changeOrders.filter(co => co.status === 'REJECTED'),
    BILLED: changeOrders.filter(co => co.status === 'BILLED'),
  }

  // Calculate aging for pending
  const now = new Date()
  const pendingWithAging = byStatus.PENDING.map(co => {
    if (!co.submitted_date) return { ...co, agingDays: null }
    const submitted = new Date(co.submitted_date)
    const agingDays = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
    return { ...co, agingDays }
  })

  // Approved but not billed
  const approvedUnbilled = byStatus.APPROVED.filter(co => !co.billed_date)
  const approvedUnbilledValue = approvedUnbilled.reduce((sum, co) => sum + co.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Orders"
        subtitle="Change order funnel and aging analysis"
      />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byStatus.PENDING.length}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(byStatus.PENDING.reduce((sum, co) => sum + co.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byStatus.APPROVED.length}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(byStatus.APPROVED.reduce((sum, co) => sum + co.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved Unbilled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{approvedUnbilled.length}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(approvedUnbilledValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byStatus.BILLED.length}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(byStatus.BILLED.reduce((sum, co) => sum + co.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Change Orders with Aging */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Change Orders (Aging)</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingWithAging.length === 0 ? (
            <p className="text-muted-foreground">No pending change orders</p>
          ) : (
            <div className="space-y-2">
              {pendingWithAging
                .sort((a, b) => (b.agingDays || 0) - (a.agingDays || 0))
                .map((co) => {
                  const project = projectMap.get(co.project_id)
                  return (
                    <div key={co.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          {project ? (
                            <Link href={`/app/construction/projects/${co.project_id}`} className="font-medium hover:underline">
                              {project.name}: {co.number}
                            </Link>
                          ) : (
                            <span className="font-medium">{co.number}: {co.title}</span>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {co.submitted_date && `Submitted: ${co.submitted_date}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(co.amount)}</p>
                          {co.agingDays !== null && (
                            <Badge className={co.agingDays > 30 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {co.agingDays} days
                            </Badge>
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

      {/* All Change Orders */}
      <Card>
        <CardHeader>
          <CardTitle>All Change Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {changeOrders.length === 0 ? (
            <p className="text-muted-foreground">No change orders available. Import data to get started.</p>
          ) : (
            <div className="space-y-2">
              {changeOrders.map((co) => {
                const project = projectMap.get(co.project_id)
                return (
                  <div key={co.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        {project ? (
                          <Link href={`/app/construction/projects/${co.project_id}`} className="font-medium hover:underline">
                            {project.name}: {co.number}
                          </Link>
                        ) : (
                          <span className="font-medium">{co.number}: {co.title}</span>
                        )}
                        <Badge className="ml-2">{co.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{co.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(co.amount)}</p>
                        {co.approved_date && !co.billed_date && (
                          <p className="text-sm text-muted-foreground">Approved: {co.approved_date}</p>
                        )}
                        {co.billed_date && (
                          <p className="text-sm text-muted-foreground">Billed: {co.billed_date}</p>
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
