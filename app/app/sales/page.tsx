import { FunnelChart } from '@/components/charts/FunnelChart'
import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { OpportunitiesTable } from './opportunities-table'

interface Opportunity {
  id: string
  name: string
  stage: string
  amount: number
  close_date: string | null
  source: string | null
  accounts: { name: string } | { name: string }[] | null
}

async function getSalesData() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, name, stage, amount, close_date, source, accounts(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  const funnelData = [
    { stage: 'LEAD', count: 0, amount: 0 },
    { stage: 'QUALIFIED', count: 0, amount: 0 },
    { stage: 'PROPOSAL', count: 0, amount: 0 },
    { stage: 'NEGOTIATION', count: 0, amount: 0 },
    { stage: 'WON', count: 0, amount: 0 },
    { stage: 'LOST', count: 0, amount: 0 },
  ]

  opportunities?.forEach((opp) => {
    const stageIndex = funnelData.findIndex((f) => f.stage === opp.stage)
    if (stageIndex >= 0) {
      funnelData[stageIndex].count++
      funnelData[stageIndex].amount += Number(opp.amount) || 0
    }
  })

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const { data: recentOpps } = await supabase
    .from('opportunities')
    .select('stage')
    .eq('org_id', orgId)
    .in('stage', ['WON', 'LOST'])
    .gte('updated_at', thirtyDaysAgo.toISOString())

  const won = recentOpps?.filter((o) => o.stage === 'WON').length || 0
  const lost = recentOpps?.filter((o) => o.stage === 'LOST').length || 0
  const winRate = won + lost > 0 ? won / (won + lost) : 0

  return {
    opportunities: (opportunities || []) as Opportunity[],
    funnelData,
    winRate,
  }
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { opportunities, funnelData, winRate } = await getSalesData()
  const now = new Date()

  const pipelineCutoff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const pipelineOpps = opportunities
    .filter((opp) => !['WON', 'LOST'].includes(opp.stage))
    .filter((opp) => opp.close_date && new Date(opp.close_date) <= pipelineCutoff)
    .sort((a, b) => {
      const aDate = a.close_date ? new Date(a.close_date).getTime() : 0
      const bDate = b.close_date ? new Date(b.close_date).getTime() : 0
      return aDate - bDate
    })

  const filter = typeof searchParams?.filter === 'string' ? searchParams.filter : null
  const isPipelineFilter = filter === 'pipeline'
  const tableTitle = isPipelineFilter ? 'Pipeline (Next 90 Days)' : 'Opportunities'
  const tableData = isPipelineFilter ? pipelineOpps : opportunities

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Engine</h1>
          <p className="text-muted-foreground">Sales pipeline and opportunities</p>
        </div>
        <Link
          href="/app/sales/preview"
          className="text-sm text-primary hover:underline"
        >
          Client Preview Generator →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPIStatCard title="Win Rate (30d)" value={`${(winRate * 100).toFixed(1)}%`} />
        <KPIStatCard title="Total Opportunities" value={opportunities.length} />
        <KPIStatCard
          title="Total Pipeline"
          value={formatCurrency(opportunities.reduce((sum, opp) => sum + (Number(opp.amount) || 0), 0))}
        />
      </div>

      <Card>
        <CardHeader data-demo-tour="sales-funnel">
          <CardTitle>Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart data={funnelData} />
        </CardContent>
      </Card>

      <Card data-demo-tour="sales-pipeline-table">
        <CardHeader>
          <CardTitle>{tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <OpportunitiesTable opportunities={tableData} />
        </CardContent>
      </Card>
    </div>
  )
}
