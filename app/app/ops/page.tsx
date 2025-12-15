import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { WorkOrdersTable } from './work-orders-table'

interface WorkOrder {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  completed_at: string | null
  blocker_reason: string | null
  accounts: { name: string } | { name: string }[] | null
}

async function getOpsData() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, title, status, priority, due_date, completed_at, blocker_reason, accounts(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  const statusCounts = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    DONE: 0,
  }

  workOrders?.forEach((wo) => {
    const status = wo.status as keyof typeof statusCounts
    if (status in statusCounts) {
      statusCounts[status]++
    }
  })

  const today = new Date().toISOString().split('T')[0]
  const overdue =
    workOrders?.filter((wo) => wo.due_date && wo.due_date < today && wo.status !== 'DONE').length || 0

  return {
    workOrders: (workOrders || []) as WorkOrder[],
    statusCounts,
    overdue,
  }
}

export default async function OpsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { workOrders, statusCounts, overdue } = await getOpsData()

  const filter = typeof searchParams?.filter === 'string' ? searchParams.filter : null
  const doneOrders = workOrders.filter((wo) => wo.status === 'DONE')
  const onTime = doneOrders.filter((wo) => {
    if (!wo.completed_at || !wo.due_date) return false
    return new Date(wo.completed_at) <= new Date(wo.due_date)
  }).length
  const onTimeDelivery = doneOrders.length > 0 ? onTime / doneOrders.length : 0

  const filteredWorkOrders =
    filter === 'delivery'
      ? doneOrders
      : filter === 'blocked'
        ? workOrders.filter((wo) => wo.status === 'BLOCKED')
        : workOrders

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ops Control Tower</h1>
        <p className="text-muted-foreground">Work orders and operational status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPIStatCard title="Planned" value={statusCounts.PLANNED} />
        <KPIStatCard title="In Progress" value={statusCounts.IN_PROGRESS} />
        <KPIStatCard title="Blocked" value={statusCounts.BLOCKED} />
        <KPIStatCard title="Done" value={statusCounts.DONE} />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <KPIStatCard
          title="SLA Exceptions"
          value={overdue}
          deltaLabel={overdue > 0 ? 'Overdue work orders' : 'All on track'}
        />
      </div>

      <Card>
        <CardHeader data-demo-tour="ops-work-orders">
          <CardTitle>
            {filter === 'delivery'
              ? `Delivery Performance (On-time ${(onTimeDelivery * 100).toFixed(0)}%)`
              : 'Work Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrdersTable workOrders={filteredWorkOrders} />
        </CardContent>
      </Card>
    </div>
  )
}
