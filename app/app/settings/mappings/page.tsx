import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { MappingsSettings } from './settings'

export default async function MappingsPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mappings</h1>
          <p className="text-muted-foreground mt-2">Map incoming fields into normalized metrics</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>No organization context found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!context.isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mappings</h1>
          <p className="text-muted-foreground mt-2">Map incoming fields into normalized metrics</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Access denied. OWNER or ADMIN role required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: connections } = await supabase
    .from('source_connections')
    .select('id, type, name, status, created_at')
    .eq('org_id', context.orgId)
    .order('created_at', { ascending: false })

  const { data: metricCatalog } = await supabase
    .from('metric_catalog')
    .select('key, name')
    .eq('org_id', context.orgId)
    .order('key', { ascending: true })

  const { data: mappings } = await supabase
    .from('field_mappings')
    .select('source_connection_id, mapping, updated_at')
    .eq('org_id', context.orgId)
    .eq('target', 'metric_values')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mappings</h1>
        <p className="text-muted-foreground mt-2">Map incoming data into `metric_values`</p>
      </div>

      <SettingsNav />

      {context.isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Demo organization is read-only. Mapping changes are disabled.</AlertDescription>
        </Alert>
      )}

      <MappingsSettings
        isDemo={context.isDemo}
        connections={(connections as any[]) || []}
        metricCatalog={(metricCatalog as any[]) || []}
        mappings={(mappings as any[]) || []}
      />
    </div>
  )
}

