'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRole } from '@/hooks/use-role'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PermissionButton } from '@/components/ui/permission-button'
import { OsPage } from '@/components/os/OsPage'
import { ReadOnlyBanner } from '@/components/os/ReadOnlyBanner'
import { OsErrorState } from '@/components/os/OsErrorState'
import { OsEmptyState } from '@/components/os/OsEmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface Template {
  id: string
  key: string
  name: string
  description: string
  version?: number
  template_json?: any
  created_at?: string
}

export default function CreateOSInstancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateKey = searchParams.get('template')
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templateKey || '')
  const [name, setName] = useState('')
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setError(null)
    try {
      const res = await fetch('/api/os/templates')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load templates (${res.status})`)
      }
      const data = await res.json()
      setTemplates(data.templates || [])
      if (templateKey) {
        setSelectedTemplate(templateKey)
        const template = data.templates?.find((t: Template) => t.key === templateKey)
        if (template) {
          setName(`${template.name} - ${new Date().toLocaleDateString()}`)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load templates'
      setError(message)
    } finally {
      setLoadingTemplates(false)
    }
  }

  async function handleCreate() {
    if (!canWriteAdmin) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return
    }

    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/os/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateKey: selectedTemplate,
          name: name || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
          return
        }
        throw new Error(data.error || 'Failed to create instance')
      }

      await res.json().catch(() => ({}))
      toast.success('OS instance created')
      router.push(`/app/build/instances`)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create instance')
    } finally {
      setCreating(false)
    }
  }

  const selected = templates.find((t) => t.key === selectedTemplate)
  const kpiCount = selected?.template_json?.kpis?.length || 0
  const alertCount = selected?.template_json?.alerts?.length || 0

  return (
    <OsPage title="Create OS Instance" description="Create a new Operating System workspace from a template.">
      {(!canWriteAdmin || isDemo) && (
        <ReadOnlyBanner
          title={isDemo ? 'Demo org is read-only' : 'Permission required'}
          description={
            isDemo
              ? 'Instance creation is disabled in the demo organization.'
              : 'Create and publish actions require OWNER or ADMIN permissions.'
          }
        />
      )}

      {error && <OsErrorState description={error} onRetry={fetchTemplates} />}

      {(roleLoading || loadingTemplates) && !error ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-28" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
        </div>
      ) : (
        templates.length === 0 ? (
          <OsEmptyState
            title="No templates available"
            description="If this is unexpected, retry loading templates."
            icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
            actionLabel="Retry"
            onAction={fetchTemplates}
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Instance details</CardTitle>
              <CardDescription>Choose a template and optionally customize the instance name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger disabled={!canWriteAdmin} aria-label="Select template">
                    <SelectValue placeholder="Select a template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name (optional)</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Auto-generated if not provided"
                  disabled={!canWriteAdmin}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => router.push('/app/build/templates')}>
                  Back to templates
                </Button>
                <PermissionButton
                  allowed={canWriteAdmin}
                  disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
                  onClick={handleCreate}
                  disabled={!selectedTemplate || creating}
                >
                  {creating ? 'Creating…' : 'Create OS Instance'}
                </PermissionButton>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Template preview</CardTitle>
              <CardDescription>What you’ll get after publishing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selected ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground flex items-start gap-3">
                  <Sparkles className="h-4 w-4 mt-0.5" aria-hidden="true" />
                  <span>Select a template to see KPIs, alerts, and cadence details.</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium leading-tight">{selected.name}</div>
                        <div className="text-xs text-muted-foreground">{selected.key}</div>
                      </div>
                      {typeof selected.version === 'number' && <Badge variant="outline">v{selected.version}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{selected.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md border bg-background/50 p-3">
                      <div className="text-lg font-semibold">{kpiCount}</div>
                      <div className="text-xs text-muted-foreground">KPIs</div>
                    </div>
                    <div className="rounded-md border bg-background/50 p-3">
                      <div className="text-lg font-semibold">{alertCount}</div>
                      <div className="text-xs text-muted-foreground">Alerts</div>
                    </div>
                    <div className="rounded-md border bg-background/50 p-3">
                      <div className="text-lg font-semibold">3</div>
                      <div className="text-xs text-muted-foreground">Cadences</div>
                    </div>
                  </div>

                  {selected.created_at && (
                    <p className="text-xs text-muted-foreground">Template created {formatDate(selected.created_at)}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        )
      )}
    </OsPage>
  )
}



