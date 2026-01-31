'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type ConnectionRow = {
  id: string
  type: 'csv' | 'webhook'
  name: string
  status: string
  config: any
  created_at: string
}

type RunRow = {
  id: string
  source_connection_id: string
  status: 'queued' | 'running' | 'success' | 'failed'
  started_at: string
  finished_at: string | null
  rows_in: number
  rows_valid: number
  rows_invalid: number
  error: string | null
}

function disabledProps(disabled: boolean, reason: string) {
  return disabled ? { disabled: true, title: reason, 'data-disabled-reason': reason } : {}
}

export function ConnectionsSettings({
  orgSlug,
  isDemo,
  connections,
  runs,
}: {
  orgSlug: string
  isDemo: boolean
  connections: ConnectionRow[]
  runs: RunRow[]
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState<'csv' | 'webhook'>('csv')
  const [creating, setCreating] = useState(false)
  const [tokenOnce, setTokenOnce] = useState<string | null>(null)
  const [tokenForConnection, setTokenForConnection] = useState<string | null>(null)

  const [csvConnectionId, setCsvConnectionId] = useState<string>('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const demoReason = 'Demo org is read-only'

  const webhookConnections = useMemo(
    () => connections.filter((c) => c.type === 'webhook'),
    [connections],
  )
  const csvConnections = useMemo(() => connections.filter((c) => c.type === 'csv'), [connections])

  async function createConnection() {
    if (isDemo) {
      toast.error(demoReason)
      return
    }
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setCreating(true)
    setTokenOnce(null)
    setTokenForConnection(null)
    try {
      const res = await fetch('/api/connections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.message || json?.error || 'Create failed')
      if (type === 'webhook' && json.token) {
        setTokenOnce(String(json.token))
        setTokenForConnection(String(json.connection.id))
      }
      toast.success('Connection created')
      setName('')
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  async function regenerateToken(connectionId: string) {
    if (isDemo) {
      toast.error(demoReason)
      return
    }
    try {
      const res = await fetch('/api/connections/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.message || json?.error || 'Regenerate failed')
      setTokenOnce(String(json.token))
      setTokenForConnection(connectionId)
      toast.success('Token regenerated (shown once)')
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Regenerate failed')
    }
  }

  async function uploadCsv() {
    if (isDemo) {
      toast.error(demoReason)
      return
    }
    if (!csvConnectionId) {
      toast.error('Select a CSV connection')
      return
    }
    if (!csvFile) {
      toast.error('Choose a CSV file')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('source_connection_id', csvConnectionId)
      form.append('file', csvFile)
      const res = await fetch('/api/ingest/csv', { method: 'POST', body: form })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.message || json?.error || 'Import failed')
      toast.success(`Imported: ${json.rows_valid}/${json.rows_in} valid`)
      setCsvFile(null)
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Import failed')
    } finally {
      setUploading(false)
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Connection</CardTitle>
          <CardDescription>CSV import for backfills; Webhook for real-time ingestion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="conn_name">Name</Label>
              <Input
                id="conn_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Finance CSV Import"
                {...disabledProps(isDemo, demoReason)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className={cn('h-10 w-full rounded-md border bg-background px-3 text-sm')}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                disabled={isDemo}
                title={isDemo ? demoReason : undefined}
                data-disabled-reason={isDemo ? demoReason : undefined}
              >
                <option value="csv">CSV Import</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          </div>

          <Button onClick={createConnection} disabled={creating || isDemo} {...disabledProps(isDemo, demoReason)}>
            {creating ? 'Creating…' : 'Create'}
          </Button>

          {tokenOnce && tokenForConnection && (
            <div className="rounded border bg-muted/30 p-3 space-y-2">
              <div className="font-medium">Webhook token (shown once)</div>
              <div className="text-xs text-muted-foreground">
                Save this now. You won’t be able to view it again (regenerate if needed).
              </div>
              <div className="flex gap-2">
                <Input value={tokenOnce} readOnly />
                <Button variant="outline" onClick={() => copy(tokenOnce)}>
                  Copy
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Endpoint: <span className="font-mono">{`/api/ingest/webhook?connection=${tokenForConnection}`}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Header: <span className="font-mono">Authorization: Bearer {'{token}'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>Upload a CSV file into raw events (and metric values if mapped)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CSV Connection</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={csvConnectionId}
              onChange={(e) => setCsvConnectionId(e.target.value)}
              disabled={isDemo}
              title={isDemo ? demoReason : undefined}
              data-disabled-reason={isDemo ? demoReason : undefined}
            >
              <option value="">Select…</option>
              {csvConnections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              {...disabledProps(isDemo, demoReason)}
            />
          </div>
          <Button onClick={uploadCsv} disabled={uploading || isDemo} {...disabledProps(isDemo, demoReason)}>
            {uploading ? 'Uploading…' : 'Upload CSV'}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Webhook Connections</CardTitle>
          <CardDescription>Token-based ingestion without requiring a user session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {webhookConnections.length === 0 ? (
            <div className="text-sm text-muted-foreground">No webhook connections yet.</div>
          ) : (
            webhookConnections.map((c) => (
              <div key={c.id} className="rounded border p-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Endpoint: <span className="font-mono">{`/api/ingest/webhook?connection=${c.id}`}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Token prefix: <span className="font-mono">{String(c.config?.webhook_token_prefix || '—')}</span>
                  </div>
                </div>
                <div className="shrink-0 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => regenerateToken(c.id)}
                    {...disabledProps(isDemo, demoReason)}
                  >
                    Regenerate Token
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Last import/webhook executions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {runs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No runs yet.</div>
          ) : (
            runs.map((r) => (
              <div key={r.id} className="grid grid-cols-12 gap-2 rounded border p-2 text-sm">
                <div className="col-span-3 font-mono text-xs">{r.source_connection_id.slice(0, 8)}…</div>
                <div className="col-span-2">{r.status}</div>
                <div className="col-span-2">{r.rows_valid}/{r.rows_in}</div>
                <div className="col-span-5 text-xs text-muted-foreground truncate">
                  {r.error ? `Error: ${r.error}` : new Date(r.started_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground lg:col-span-2">
        Webhook events are tenant-scoped; tokens are hashed at rest. CSV imports are processed server-side.
      </div>
    </div>
  )
}

