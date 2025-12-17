'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/use-role'
import { Building2, DollarSign, Sparkles, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionButton } from '@/components/ui/permission-button'
import { OsPage } from '@/components/os/OsPage'
import { ReadOnlyBanner } from '@/components/os/ReadOnlyBanner'
import { OsEmptyState } from '@/components/os/OsEmptyState'
import { OsErrorState } from '@/components/os/OsErrorState'

interface Template {
  id: string
  key: string
  name: string
  description: string
  version: number
  template_json: any
}

export default function TemplatesPage() {
  const router = useRouter()
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load templates'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function handleCreateOS(templateKey: string) {
    if (!canWriteAdmin) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return
    }
    router.push(`/app/build/instances/create?template=${templateKey}`)
  }

  const templateIcons: Record<string, any> = {
    construction_ops: Building2,
    service_ops: Wrench,
    finance_ops: DollarSign,
  }

  if (loading || roleLoading) {
    return (
      <OsPage
        title="OS Templates"
        description="Choose a template to create your Operating System workspace."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </OsPage>
    )
  }

  return (
    <OsPage
      title="OS Templates"
      description="Choose a template to create your Operating System workspace."
    >
      {(!canWriteAdmin || isDemo) && (
        <ReadOnlyBanner
          title={isDemo ? 'Demo org is read-only' : 'Permission required'}
          description={
            isDemo
              ? 'Templates are visible, but creation and publishing are disabled in the demo organization.'
              : 'Create and publish actions require OWNER or ADMIN permissions.'
          }
        />
      )}

      {error && <OsErrorState description={error} onRetry={fetchTemplates} />}

      {!error && templates.length === 0 && (
        <OsEmptyState
          title="No templates available"
          description="If this is unexpected, retry loading templates."
          icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
          actionLabel="Retry"
          onAction={fetchTemplates}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = templateIcons[template.key] || Building2
          const kpiCount = template.template_json?.kpis?.length || 0
          const alertCount = template.template_json?.alerts?.length || 0

          return (
            <Card key={template.id} className="group overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border bg-muted/30 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{template.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">v{template.version}</Badge>
                      <span className="text-xs text-muted-foreground">Ready to deploy</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {template.description}
                </p>
                <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground mb-4">
                  <div className="rounded-md border bg-background/50 p-2">
                    <div className="font-medium text-foreground">{kpiCount}</div>
                    <div>KPIs</div>
                  </div>
                  <div className="rounded-md border bg-background/50 p-2">
                    <div className="font-medium text-foreground">{alertCount}</div>
                    <div>Alerts</div>
                  </div>
                  <div className="rounded-md border bg-background/50 p-2">
                    <div className="font-medium text-foreground">3</div>
                    <div>Cadences</div>
                  </div>
                </div>
                <PermissionButton
                  allowed={canWriteAdmin}
                  disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
                  onClick={() => handleCreateOS(template.key)}
                  className="w-full"
                >
                  Create OS
                </PermissionButton>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </OsPage>
  )
}



