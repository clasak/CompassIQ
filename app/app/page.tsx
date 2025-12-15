import { getKPIs, getAlerts, getInvoices, getOpportunities, getAccounts, getWorkOrders } from '@/lib/data'
import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { AlertsPanel } from '@/components/alerts/AlertsPanel'
import { ValueNarrative } from '@/components/value-narrative/ValueNarrative'
import { formatCurrency, formatPercent } from '@/lib/utils'
import Link from 'next/link'

export default async function CommandCenterPage({
}: {
  // No searchParams needed - preview is handled via cookie
}) {
  const kpis = await getKPIs()
  const alerts = await getAlerts()

  // Get drilldown data (works in both modes)
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = new Date()

  const allInvoices = await getInvoices()
  const revenueInvoices = allInvoices.filter((inv: any) => {
    const issueDate = new Date(inv.issue_date)
    return ['SENT', 'PAID', 'OVERDUE'].includes(inv.status) &&
           issueDate >= startDate && issueDate <= endDate
  }).sort((a: any, b: any) => 
    new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
  )

  const now = new Date()
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const allOpportunities = await getOpportunities()
  const pipelineOpps = allOpportunities.filter((opp: any) => {
    return !['WON', 'LOST'].includes(opp.stage) &&
           new Date(opp.close_date) <= day90
  }).sort((a: any, b: any) => 
    new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
  )

  const arInvoicesWithOutstanding = allInvoices
    .filter((inv: any) => inv.status !== 'VOID')
    .map((inv: any) => {
      const total = Number(inv.total) || 0
      const payments = inv.payments || []
      const paid = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
      return {
        ...inv,
        outstanding: total - paid,
      }
    })
    .filter((inv: any) => inv.outstanding > 0)
    .sort((a: any, b: any) => 
      new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime()
    )

  const allWorkOrders = await getWorkOrders()
  const workOrders = allWorkOrders.filter((wo: any) => wo.status === 'DONE')

  const renewalThreshold = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const allAccounts = await getAccounts()
  const churnRiskAccounts = allAccounts.filter((acc: any) => {
    return acc.renewal_date && 
           new Date(acc.renewal_date) <= renewalThreshold
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-muted-foreground">Overview of your business operations</p>
      </div>

      <ValueNarrative className="mb-6" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-kpi-card-container>
        <Link href="/app/finance?filter=revenue">
          <KPIStatCard
            title="Revenue MTD"
            value={formatCurrency(kpis.revenueMTD)}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
        <Link href="/app/sales?filter=pipeline">
          <KPIStatCard
            title="Pipeline 30 Days"
            value={formatCurrency(kpis.pipeline30)}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
        <Link href="/app/sales?filter=pipeline">
          <KPIStatCard
            title="Pipeline 60 Days"
            value={formatCurrency(kpis.pipeline60)}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
        <Link href="/app/sales?filter=pipeline">
          <KPIStatCard
            title="Pipeline 90 Days"
            value={formatCurrency(kpis.pipeline90)}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
        <Link href="/app/finance?filter=ar">
          <KPIStatCard
            title="AR Outstanding"
            value={formatCurrency(kpis.arOutstanding)}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
        <Link href="/app/ops?filter=delivery">
          <KPIStatCard
            title="On-Time Delivery"
            value={formatPercent(kpis.onTimeDelivery)}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
        <Link href="/app/success?filter=churn">
          <KPIStatCard
            title="Churn Risk Accounts"
            value={kpis.churnRisk}
            className="cursor-pointer transition-shadow hover:shadow-md"
          />
        </Link>
      </div>

      {alerts.length > 0 && (
        <AlertsPanel alerts={alerts} />
      )}
    </div>
  )
}
