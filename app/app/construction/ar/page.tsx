import { listConstructionInvoices, listConstructionProjects } from '@/lib/actions/construction-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function ConstructionARPage() {
  const invoicesResult = await listConstructionInvoices()
  const projectsResult = await listConstructionProjects()
  
  const invoices = invoicesResult.invoices || []
  const projects = projectsResult.projects || []
  const projectMap = new Map(projects.map(p => [p.id, p]))

  const now = new Date()

  // Calculate aging buckets
  type InvoiceType = typeof invoices[0]
  const agingBuckets: {
    '0-30': InvoiceType[]
    '31-60': InvoiceType[]
    '61-90': InvoiceType[]
    '90+': InvoiceType[]
  } = {
    '0-30': [],
    '31-60': [],
    '61-90': [],
    '90+': [],
  }

  invoices.forEach(inv => {
    if (inv.status === 'PAID' || inv.status === 'VOID' || inv.balance === 0) return
    const due = new Date(inv.due_date)
    const daysPastDue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysPastDue <= 30) {
      agingBuckets['0-30'].push(inv)
    } else if (daysPastDue <= 60) {
      agingBuckets['31-60'].push(inv)
    } else if (daysPastDue <= 90) {
      agingBuckets['61-90'].push(inv)
    } else {
      agingBuckets['90+'].push(inv)
    }
  })

  const totalAR = invoices
    .filter(inv => inv.status !== 'PAID' && inv.status !== 'VOID')
    .reduce((sum, inv) => sum + inv.balance, 0)

  const arOver60 = [...agingBuckets['61-90'], ...agingBuckets['90+']]
    .reduce((sum, inv) => sum + inv.balance, 0)

  const arOver90 = agingBuckets['90+'].reduce((sum, inv) => sum + inv.balance, 0)

  // DSO estimate (simplified)
  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const avgDailyRevenue = totalRevenue > 0 ? totalRevenue / 90 : 0 // Assume 90-day period
  const dso = avgDailyRevenue > 0 ? totalAR / avgDailyRevenue : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="AR / Accounts Receivable & DSO"
        subtitle="AR aging buckets and days sales outstanding"
      />

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total AR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAR)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AR Over 60 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(arOver60)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AR Over 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(arOver90)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DSO Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dso.toFixed(0)} days</p>
          </CardContent>
        </Card>
      </div>

      {/* AR Aging Buckets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(agingBuckets).map(([bucket, bucketInvoices]) => {
          const bucketTotal = bucketInvoices.reduce((sum, inv) => sum + inv.balance, 0)
          return (
            <Card key={bucket}>
              <CardHeader>
                <CardTitle>{bucket} Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(bucketTotal)}</p>
                <p className="text-sm text-muted-foreground">{bucketInvoices.length} invoices</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AR Aging Table */}
      <Card>
        <CardHeader>
          <CardTitle>AR Aging Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'VOID' && inv.balance > 0).length === 0 ? (
            <p className="text-muted-foreground">No outstanding AR invoices</p>
          ) : (
            <div className="space-y-2">
              {invoices
                .filter(inv => inv.status !== 'PAID' && inv.status !== 'VOID' && inv.balance > 0)
                .map((inv) => {
                  const due = new Date(inv.due_date)
                  const daysPastDue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
                  const project = inv.project_id ? projectMap.get(inv.project_id) : null
                  
                  return (
                    <div key={inv.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{inv.invoice_number}</span>
                          <span className="text-sm text-muted-foreground ml-2">{inv.customer}</span>
                          {project && (
                            <Link href={`/app/construction/projects/${inv.project_id}`} className="text-primary hover:underline ml-2 text-sm">
                              {project.name}
                            </Link>
                          )}
                          <Badge className="ml-2">{inv.status}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Due: {inv.due_date} | Invoice Date: {inv.invoice_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(inv.balance)}</p>
                          <Badge className={daysPastDue > 90 ? 'bg-red-600' : daysPastDue > 60 ? 'bg-yellow-600' : 'bg-green-600'}>
                            {daysPastDue > 0 ? `${daysPastDue} days past due` : `${Math.abs(daysPastDue)} days until due`}
                          </Badge>
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


