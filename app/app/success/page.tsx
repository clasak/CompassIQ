import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { AccountsHealthTable } from './accounts-health-table'
import { TicketsTable } from './tickets-table'

interface Account {
  id: string
  name: string
  renewal_date: string | null
  health_override: number | null
  segment: string | null
  industry: string | null
}

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  opened_at: string
  first_response_at: string | null
  resolved_at: string | null
  accounts: { name: string } | { name: string }[] | null
}

async function getSuccessData() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, renewal_date, health_override, segment, industry')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  const { data: invoices } = await supabase
    .from('invoices')
    .select('account_id, status')
    .eq('org_id', orgId)
    .eq('status', 'OVERDUE')

  const { data: tickets } = await supabase
    .from('tickets')
    .select('account_id, opened_at, status')
    .eq('org_id', orgId)
    .in('status', ['OPEN', 'IN_PROGRESS'])

  const { data: activities } = await supabase
    .from('activities')
    .select('account_id, occurred_at')
    .eq('org_id', orgId)
    .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const overdueInvoicesByAccount = new Map<string, number>()
  invoices?.forEach((inv) => {
    overdueInvoicesByAccount.set(inv.account_id, (overdueInvoicesByAccount.get(inv.account_id) || 0) + 1)
  })

  const oldTicketsByAccount = new Map<string, number>()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  tickets?.forEach((ticket) => {
    if (new Date(ticket.opened_at) < sevenDaysAgo) {
      oldTicketsByAccount.set(ticket.account_id, (oldTicketsByAccount.get(ticket.account_id) || 0) + 1)
    }
  })

  const recentActivityByAccount = new Set<string>()
  activities?.forEach((act) => {
    if (act.account_id) recentActivityByAccount.add(act.account_id)
  })

  const accountsWithHealth =
    accounts?.map((acc: any) => {
      let health = acc.health_override !== null ? Number(acc.health_override) : 100

      if (overdueInvoicesByAccount.has(acc.id)) {
        health -= 20
      }

      if (oldTicketsByAccount.has(acc.id)) {
        health -= 10
      }

      if (!recentActivityByAccount.has(acc.id)) {
        health -= 10
      }

      if (acc.renewal_date) {
        const renewalDate = new Date(acc.renewal_date)
        const daysUntilRenewal = Math.floor((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysUntilRenewal <= 30 && daysUntilRenewal > 0) {
          health -= 10
        }
      }

      health = Math.max(0, Math.min(100, health))
      return { ...acc, health_score: health }
    }) || []

  const now = new Date()
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const renewals30 = accountsWithHealth.filter(
    (acc: any) => acc.renewal_date && new Date(acc.renewal_date) <= day30 && new Date(acc.renewal_date) > now
  ).length

  const renewals60 = accountsWithHealth.filter(
    (acc: any) =>
      acc.renewal_date && new Date(acc.renewal_date) <= day60 && new Date(acc.renewal_date) > day30
  ).length

  const renewals90 = accountsWithHealth.filter(
    (acc: any) =>
      acc.renewal_date && new Date(acc.renewal_date) <= day90 && new Date(acc.renewal_date) > day60
  ).length

  const { data: allTickets } = await supabase
    .from('tickets')
    .select('id, title, status, priority, opened_at, first_response_at, resolved_at, accounts(name)')
    .eq('org_id', orgId)
    .order('opened_at', { ascending: false })

  return {
    accounts: accountsWithHealth as (Account & { health_score: number })[],
    tickets: (allTickets || []) as Ticket[],
    renewals30,
    renewals60,
    renewals90,
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { accounts, tickets, renewals30, renewals60, renewals90 } = await getSuccessData()

  const filter = typeof searchParams?.filter === 'string' ? searchParams.filter : null

  const renewalThreshold = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  const churnRiskAccounts =
    filter === 'churn'
      ? accounts.filter((acc: any) => {
          if (!acc.renewal_date) return false
          const renewalDate = new Date(acc.renewal_date)
          return renewalDate <= renewalThreshold && acc.health_score < 50
        })
      : accounts

  const tableTitle = filter === 'churn' ? 'Churn Risk Accounts' : 'Accounts with Health Scores'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Success</h1>
        <p className="text-muted-foreground">Account health and support tickets</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPIStatCard title="Renewals Due (30d)" value={renewals30} />
        <KPIStatCard title="Renewals Due (60d)" value={renewals60} />
        <KPIStatCard title="Renewals Due (90d)" value={renewals90} />
      </div>

      <Card>
        <CardHeader data-demo-tour="success-accounts">
          <CardTitle>{tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountsHealthTable accounts={churnRiskAccounts as any[]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader data-demo-tour="success-tickets">
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketsTable tickets={tickets as any[]} />
        </CardContent>
      </Card>
    </div>
  )
}
