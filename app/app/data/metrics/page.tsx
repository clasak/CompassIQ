import { MetricsTable } from './metrics-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrgContext } from '@/lib/org-context'
import { getActiveOrgId } from '@/lib/org'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'

interface Metric {
  id: string
  key: string
  name: string
  description: string | null
  formula: string | null
  source: string | null
  cadence: string | null
}

async function getMetrics() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No org context')

  const { data: metrics } = await supabase.from('metric_catalog').select('*').eq('org_id', orgId).order('name', {
    ascending: true,
  })

  return (metrics || []) as Metric[]
}

export default async function MetricsPage() {
  const context = await getOrgContext()
  if (!context) redirect('/app')

  const metrics = await getMetrics()
  const isDemo = context.isDemo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metric Catalog</h1>
          <p className="text-muted-foreground">Single source of truth for business metrics</p>
        </div>
        {!isDemo && (
          <Button disabled title="Coming soon">
            <Plus className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsTable metrics={metrics} />
        </CardContent>
      </Card>
    </div>
  )
}

