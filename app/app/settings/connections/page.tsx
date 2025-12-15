import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { ConnectionsSettings } from './settings'

export default async function ConnectionsPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-muted-foreground mt-2">Manage ingestion connections and review recent runs</p>
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
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-muted-foreground mt-2">Manage ingestion connections and review recent runs</p>
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
    .select('id, type, name, status, config, created_at')
    .eq('org_id', context.orgId)
    .order('created_at', { ascending: false })

  const { data: runs } = await supabase
    .from('source_runs')
    .select('id, source_connection_id, status, started_at, finished_at, rows_in, rows_valid, rows_invalid, error')
    .eq('org_id', context.orgId)
    .order('started_at', { ascending: false })
    .limit(25)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground mt-2">Create ingestion connections and monitor run health</p>
      </div>

      <SettingsNav />

      {context.isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Demo organization is read-only. Create/import actions are disabled.</AlertDescription>
        </Alert>
      )}

      <ConnectionsSettings
        orgSlug={context.orgSlug}
        isDemo={context.isDemo}
        connections={(connections as any[]) || []}
        runs={(runs as any[]) || []}
      />
    </div>
  )
}

