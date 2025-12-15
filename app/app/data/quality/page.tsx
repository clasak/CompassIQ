import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { formatPercent } from '@/lib/utils'
import { DataSourcesTable } from './data-sources-table'

async function getDataQuality() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const { data: metricCatalog } = await supabase
    .from('metric_catalog')
    .select('key, name')
    .eq('org_id', orgId)

  const baselineKeys = (metricCatalog || []).map((m: any) => m.key)

  const { data: latestMetrics } = await supabase
    .from('metric_values_latest')
    .select('metric_key, occurred_on')
    .eq('org_id', orgId)
    .in('metric_key', (baselineKeys.length ? baselineKeys : ['revenue_mtd']) as any)

  const latestByKey = new Map<string, string>()
  ;(latestMetrics || []).forEach((m: any) => {
    if (m.metric_key && m.occurred_on) latestByKey.set(m.metric_key, m.occurred_on)
  })

  const windowDays = 30
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  const updatedKeys = baselineKeys.filter((k) => {
    const last = latestByKey.get(k)
    return last && last >= cutoffIso
  })
  const completenessScore =
    baselineKeys.length > 0 ? updatedKeys.length / baselineKeys.length : 1

  const staleMetricKeys = baselineKeys.filter((k) => {
    const last = latestByKey.get(k)
    return !last || last < cutoffIso
  })

  const { data: lastRuns } = await supabase
    .from('source_runs')
    .select('id, status, started_at, rows_in, rows_valid, rows_invalid, error, source_connection_id')
    .eq('org_id', orgId)
    .order('started_at', { ascending: false })
    .limit(5)

  const failuresCount = (lastRuns || []).filter((r: any) => r.status === 'failed').length

  const { data: dataSources } = await supabase
    .from('data_sources')
    .select('name, last_sync_at, status, cadence')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  const staleSources =
    dataSources?.filter((ds) => {
      if (!ds.last_sync_at) return true
      const lastSync = new Date(ds.last_sync_at)
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)
      const cadenceHours = ds.cadence ? parseInt(ds.cadence) : 24
      return hoursSinceSync > cadenceHours
    }) || []

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, segment, industry')
    .eq('org_id', orgId)

  const accountsMissingData = accounts?.filter((acc) => !acc.segment || !acc.industry) || []

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, name, stage, close_date')
    .eq('org_id', orgId)
    .not('stage', 'eq', 'LEAD')

  const oppsMissingCloseDate = opportunities?.filter((opp) => !opp.close_date) || []

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, subtotal, tax, total')
    .eq('org_id', orgId)

  const invoicesWithMismatch =
    invoices?.filter((inv) => {
      const subtotal = Number(inv.subtotal) || 0
      const tax = Number(inv.tax) || 0
      const total = Number(inv.total) || 0
      return Math.abs(total - (subtotal + tax)) > 0.01
    }) || []

  const nameMap = new Map<string, string[]>()
  accounts?.forEach((acc) => {
    const normalized = acc.name.toLowerCase().trim()
    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, [])
    }
    nameMap.get(normalized)!.push(acc.id)
  })

  const duplicateAccounts = Array.from(nameMap.entries())
    .filter(([_, ids]) => ids.length > 1)
    .map(([name, ids]) => ({
      name,
      count: ids.length,
      account_ids: ids,
    }))

  const { data: orphanActivities } = await supabase
    .from('activities')
    .select('id, type, occurred_at, notes')
    .eq('org_id', orgId)
    .is('account_id', null)
    .is('opportunity_id', null)

  const accountCount = accounts?.length || 0
  const opportunityCount = opportunities?.length || 0
  const invoiceCount = invoices?.length || 0
  const totalRecords = accountCount + opportunityCount + invoiceCount
  const recordQualityScore =
    totalRecords > 0
      ? 1 -
        (accountsMissingData.length + oppsMissingCloseDate.length + invoicesWithMismatch.length) /
          totalRecords
      : 1

  return {
    dataSources: dataSources || [],
    staleSources,
    baselineKeys,
    metricCatalog: metricCatalog || [],
    latestByKey: Array.from(latestByKey.entries()).map(([key, occurred_on]) => ({ key, occurred_on })),
    completenessScore: Math.max(0, completenessScore),
    staleMetricKeys,
    lastRuns: lastRuns || [],
    failuresCount,
    accountsMissingData,
    oppsMissingCloseDate,
    invoicesWithMismatch,
    duplicateAccounts,
    orphanActivities: orphanActivities || [],
    recordQualityScore: Math.max(0, recordQualityScore),
  }
}

export default async function DataQualityPage() {
  const {
    dataSources,
    staleSources,
    baselineKeys,
    metricCatalog,
    latestByKey,
    completenessScore,
    staleMetricKeys,
    lastRuns,
    failuresCount,
    accountsMissingData,
    oppsMissingCloseDate,
    invoicesWithMismatch,
    duplicateAccounts,
    orphanActivities,
    recordQualityScore,
  } = await getDataQuality()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Quality & Freshness</h1>
        <p className="text-muted-foreground">Monitor data completeness, freshness, and quality issues</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div data-demo-tour="data-quality-kpis" className="contents">
          <KPIStatCard
            title={`Metric Completeness (${baselineKeys.length} baseline)`}
            value={formatPercent(completenessScore)}
          />
          <KPIStatCard title="Stale Metrics (30d)" value={staleMetricKeys.length} />
          <KPIStatCard title="Ingestion Failures (last 5)" value={failuresCount} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion Health</CardTitle>
          <CardDescription>Recent runs and failures (CSV + webhook)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {lastRuns.length === 0 ? (
            <div className="text-sm text-muted-foreground">No runs yet.</div>
          ) : (
            lastRuns.map((r: any) => (
              <div key={r.id} className="grid grid-cols-12 gap-2 rounded border p-2 text-sm">
                <div className="col-span-2">{r.status}</div>
                <div className="col-span-3 font-mono text-xs">{String(r.source_connection_id).slice(0, 8)}…</div>
                <div className="col-span-2">{r.rows_valid}/{r.rows_in}</div>
                <div className="col-span-5 text-xs text-muted-foreground truncate">
                  {r.error ? `Error: ${r.error}` : new Date(r.started_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metric Freshness</CardTitle>
          <CardDescription>Latest ingested occurred_on per baseline metric</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {metricCatalog.length === 0 ? (
            <div className="text-sm text-muted-foreground">No metric catalog entries found.</div>
          ) : (
            metricCatalog.map((m: any) => {
              const last = latestByKey.find((x: any) => x.key === m.key)?.occurred_on || null
              const stale = !last || staleMetricKeys.includes(m.key)
              return (
                <div key={m.key} className="flex items-center justify-between rounded border p-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-mono text-xs">{m.key}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs">{last || '—'}</div>
                    <div className="text-xs text-muted-foreground">{stale ? 'stale' : 'fresh'}</div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Freshness</CardTitle>
          <CardDescription>Last sync times for data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <DataSourcesTable dataSources={dataSources as any[]} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completeness Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">
                Record Quality Score ({formatPercent(recordQualityScore)})
              </h4>
              <p className="text-sm text-muted-foreground">
                Heuristic score from core tables (accounts, opportunities, invoices)
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Accounts Missing Data ({accountsMissingData.length})</h4>
              <p className="text-sm text-muted-foreground">Accounts missing segment or industry</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">
                Opportunities Missing Close Date ({oppsMissingCloseDate.length})
              </h4>
              <p className="text-sm text-muted-foreground">Non-LEAD opportunities without close dates</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Invoice Mismatches ({invoicesWithMismatch.length})</h4>
              <p className="text-sm text-muted-foreground">Invoices where total ≠ subtotal + tax</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Quality Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Duplicate Accounts ({duplicateAccounts.length})</h4>
              <p className="text-sm text-muted-foreground">Accounts with identical normalized names</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Orphan Activities ({orphanActivities.length})</h4>
              <p className="text-sm text-muted-foreground">Activities not linked to account or opportunity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
