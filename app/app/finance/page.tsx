import { BarChartBasic } from '@/components/charts/BarChartBasic'
import { TrendChart } from '@/components/charts/TrendChart'
import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { InvoicesTable } from './invoices-table'

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string | null
  total: number
  status: string
  accounts: { name: string } | { name: string }[] | null
  payments?: { amount: number }[]
}

async function getFinanceData() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      `
      id,
      invoice_number,
      issue_date,
      due_date,
      total,
      status,
      accounts(name),
      payments(amount)
    `
    )
    .eq('org_id', orgId)
    .order('issue_date', { ascending: false })

  const revenueByWeek = new Map<string, number>()
  invoices?.forEach((inv) => {
    const date = new Date(inv.issue_date)
    const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
    const current = revenueByWeek.get(week) || 0
    revenueByWeek.set(week, current + (Number(inv.total) || 0))
  })

  const trendData = Array.from(revenueByWeek.entries())
    .map(([period, value]) => ({ period, value }))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-12)

  const today = new Date()
  const agingBuckets = {
    '0-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
  }

  invoices?.forEach((inv) => {
    if (!inv.due_date || inv.status === 'PAID' || inv.status === 'VOID') return

    const dueDate = new Date(inv.due_date)
    const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const total = Number(inv.total) || 0
    const paid = (inv.payments as any[])?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0
    const outstanding = total - paid

    if (outstanding <= 0) return

    if (daysPastDue <= 30) {
      agingBuckets['0-30'] += outstanding
    } else if (daysPastDue <= 60) {
      agingBuckets['31-60'] += outstanding
    } else if (daysPastDue <= 90) {
      agingBuckets['61-90'] += outstanding
    } else {
      agingBuckets['90+'] += outstanding
    }
  })

  const agingData = [
    { name: '0-30 days', value: agingBuckets['0-30'] },
    { name: '31-60 days', value: agingBuckets['31-60'] },
    { name: '61-90 days', value: agingBuckets['61-90'] },
    { name: '90+ days', value: agingBuckets['90+'] },
  ]

  const invoicesWithOutstanding = (invoices || []).map((inv) => {
    const total = Number(inv.total) || 0
    const paid = (inv.payments as any[])?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0
    return {
      ...inv,
      paid_amount: paid,
      outstanding_amount: total - paid,
    }
  }) as (Invoice & { paid_amount: number; outstanding_amount: number })[]

  return {
    invoices: invoicesWithOutstanding,
    trendData,
    agingData,
  }
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { invoices, trendData, agingData } = await getFinanceData()

  const now = new Date()
  const filter = typeof searchParams?.filter === 'string' ? searchParams.filter : null
  const status = typeof searchParams?.status === 'string' ? searchParams.status : null

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.outstanding_amount || 0), 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let filteredInvoices =
    filter === 'revenue'
      ? invoices.filter((inv) => {
          const issueDate = new Date(inv.issue_date)
          return (
            ['SENT', 'PAID', 'OVERDUE'].includes(inv.status) &&
            issueDate >= monthStart &&
            issueDate <= now
          )
        })
      : filter === 'ar'
        ? invoices.filter((inv) => (inv.outstanding_amount || 0) > 0)
        : invoices

  if (status) {
    filteredInvoices = filteredInvoices.filter((inv) => inv.status === status)
  }

  const tableTitle =
    filter === 'revenue'
      ? 'Invoices (Revenue MTD)'
      : filter === 'ar'
        ? 'Invoices (AR Outstanding)'
        : 'Invoices'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground">Invoices, payments, and AR</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <KPIStatCard title="Total Revenue" value={formatCurrency(totalRevenue)} />
        <KPIStatCard title="AR Outstanding" value={formatCurrency(totalOutstanding)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AR Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartBasic data={agingData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader data-demo-tour="finance-invoices">
          <CardTitle>{tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesTable invoices={filteredInvoices as any[]} />
        </CardContent>
      </Card>
    </div>
  )
}
