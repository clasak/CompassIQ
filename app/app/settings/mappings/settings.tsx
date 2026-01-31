'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MappingConfigV1 } from '@/lib/ingestion/types'

type ConnectionRow = { id: string; type: 'csv' | 'webhook'; name: string; status: string; created_at: string }
type MetricCatalogRow = { key: string; name: string }

function disabledProps(disabled: boolean, reason: string) {
  return disabled ? { disabled: true, title: reason, 'data-disabled-reason': reason } : {}
}

function defaultMapping(metricKey: string): MappingConfigV1 {
  return {
    version: 1,
    target: 'metric_values',
    metric_key: metricKey,
    occurred_on: { mode: 'today' },
    value_num: { field: 'value' },
    source: { mode: 'fixed', value: 'ingestion' },
  }
}

export function MappingsSettings({
  isDemo,
  connections,
  metricCatalog,
  mappings,
}: {
  isDemo: boolean
  connections: ConnectionRow[]
  metricCatalog: MetricCatalogRow[]
  mappings: { source_connection_id: string; mapping: any; updated_at: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialConnection = searchParams.get('connection') || ''

  const [connectionId, setConnectionId] = useState(initialConnection)
  const [fields, setFields] = useState<string[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [preview, setPreview] = useState<any[] | null>(null)
  const [nullCount, setNullCount] = useState<number | null>(null)

  const demoReason = 'Demo org is read-only'

  const existingMapping = useMemo(() => {
    return mappings.find((m) => m.source_connection_id === connectionId)?.mapping || null
  }, [mappings, connectionId])

  const [mapping, setMapping] = useState<MappingConfigV1>(() => defaultMapping(metricCatalog[0]?.key || 'revenue_mtd'))

  useEffect(() => {
    if (existingMapping && typeof existingMapping === 'object') {
      setMapping(existingMapping as any)
    }
  }, [existingMapping])

  async function detectFields() {
    if (!connectionId) {
      toast.error('Select a connection')
      return
    }
    setLoadingFields(true)
    try {
      const res = await fetch(`/api/mappings/fields?connection=${encodeURIComponent(connectionId)}`)
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Detect failed')
      setFields(Array.isArray(json.fields) ? json.fields : [])
      toast.success('Detected fields')
    } catch (e: any) {
      toast.error(e?.message || 'Detect failed')
    } finally {
      setLoadingFields(false)
    }
  }

  async function save() {
    if (isDemo) {
      toast.error(demoReason)
      return
    }
    if (!connectionId) {
      toast.error('Select a connection')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/mappings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_connection_id: connectionId, mapping }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.message || json?.error || 'Save failed')
      toast.success('Mapping saved')
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function test() {
    if (isDemo) {
      toast.error(demoReason)
      return
    }
    if (!connectionId) {
      toast.error('Select a connection')
      return
    }
    setTesting(true)
    setPreview(null)
    setNullCount(null)
    try {
      const res = await fetch('/api/mappings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_connection_id: connectionId }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.message || json?.error || 'Test failed')
      setPreview(json.preview || [])
      setNullCount(Number(json.nullCount || 0))
      toast.success('Test complete')
    } catch (e: any) {
      toast.error(e?.message || 'Test failed')
    } finally {
      setTesting(false)
    }
  }

  const connectionOptions = connections

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Connection</CardTitle>
          <CardDescription>Choose which connection’s events you want to map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Connection</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={connectionId}
              onChange={(e) => {
                setConnectionId(e.target.value)
                setPreview(null)
                setNullCount(null)
              }}
            >
              <option value="">Select…</option>
              {connectionOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" onClick={detectFields} disabled={loadingFields || !connectionId}>
            {loadingFields ? 'Detecting…' : 'Detect Fields'}
          </Button>

          {fields.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Detected: <span className="font-mono">{fields.join(', ')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mapping</CardTitle>
          <CardDescription>Minimum viable mapping into metric_values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Metric key</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={mapping.metric_key}
              onChange={(e) => setMapping((m) => ({ ...m, metric_key: e.target.value }))}
              {...disabledProps(isDemo, demoReason)}
            >
              {metricCatalog.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.key} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Occurred on</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={mapping.occurred_on.mode}
                onChange={(e) =>
                  setMapping((m) => ({
                    ...m,
                    occurred_on: e.target.value === 'field' ? { mode: 'field', field: fields[0] || 'date' } : { mode: 'today' },
                  }))
                }
                {...disabledProps(isDemo, demoReason)}
              >
                <option value="today">Use today</option>
                <option value="field">From field</option>
              </select>
              {mapping.occurred_on.mode === 'field' ? (
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={mapping.occurred_on.field}
                  onChange={(e) => setMapping((m) => ({ ...m, occurred_on: { mode: 'field', field: e.target.value } }))}
                  {...disabledProps(isDemo, demoReason)}
                >
                  {fields.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              ) : (
                <Input value="today" readOnly />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Value (numeric field)</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={mapping.value_num?.field || ''}
              onChange={(e) => setMapping((m) => ({ ...m, value_num: { field: e.target.value } }))}
              {...disabledProps(isDemo, demoReason)}
            >
              {(fields.length ? fields : ['value']).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={mapping.source?.mode || 'fixed'}
                onChange={(e) =>
                  setMapping((m) => ({
                    ...m,
                    source: e.target.value === 'field' ? { mode: 'field', field: fields[0] || 'source' } : { mode: 'fixed', value: m.source?.mode === 'fixed' ? m.source.value : 'ingestion' },
                  }))
                }
                {...disabledProps(isDemo, demoReason)}
              >
                <option value="fixed">Fixed</option>
                <option value="field">From field</option>
              </select>
              {mapping.source?.mode === 'field' ? (
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={mapping.source.field}
                  onChange={(e) => setMapping((m) => ({ ...m, source: { mode: 'field', field: e.target.value } }))}
                  {...disabledProps(isDemo, demoReason)}
                >
                  {fields.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={mapping.source?.mode === 'fixed' ? mapping.source.value : 'ingestion'}
                  onChange={(e) => setMapping((m) => ({ ...m, source: { mode: 'fixed', value: e.target.value } }))}
                  placeholder="e.g., hubspot"
                  {...disabledProps(isDemo, demoReason)}
                />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving || isDemo} {...disabledProps(isDemo, demoReason)}>
              {saving ? 'Saving…' : 'Save Mapping'}
            </Button>
            <Button variant="outline" onClick={test} disabled={testing || isDemo} {...disabledProps(isDemo, demoReason)}>
              {testing ? 'Testing…' : 'Test Mapping'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Shows up to 20 normalized rows from recent raw events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {preview === null ? (
            <div className="text-sm text-muted-foreground">Run “Test Mapping” to preview results.</div>
          ) : preview.length === 0 ? (
            <div className="text-sm text-muted-foreground">No normalized rows. Null count: {nullCount ?? 0}.</div>
          ) : (
            <pre className="text-xs overflow-auto rounded border bg-muted/30 p-3">
              {JSON.stringify({ preview, nullCount }, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

