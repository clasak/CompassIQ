'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/use-role'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PermissionButton } from '@/components/ui/permission-button'
import { OsPage } from '@/components/os/OsPage'
import { ReadOnlyBanner } from '@/components/os/ReadOnlyBanner'
import { OsEmptyState } from '@/components/os/OsEmptyState'
import { OsErrorState } from '@/components/os/OsErrorState'
import { OsTableSkeleton } from '@/components/os/OsTableSkeleton'
import { ActiveFilters } from '@/components/os/ActiveFilters'
import { InstanceStatusPill } from '@/components/os/OsPills'
import { formatDate } from '@/lib/utils'
import { ArrowUpRight, Plus, RefreshCw } from 'lucide-react'

interface OSInstance {
  id: string
  name: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  os_templates: {
    name: string
    key: string
    description: string
  }
}

export default function OSInstancesPage() {
  const router = useRouter()
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [instances, setInstances] = useState<OSInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [publishingId, setPublishingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInstances()
  }, [])

  async function fetchInstances() {
    setError(null)
    try {
      const res = await fetch('/api/os/instances')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load instances (${res.status})`)
      }
      const data = await res.json()
      setInstances(data.instances || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load instances'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish(instanceId: string) {
    if (!canWriteAdmin) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return
    }

    try {
      setPublishingId(instanceId)
      const res = await fetch(`/api/os/instances/${instanceId}/publish`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
          return
        }
        throw new Error(data.error || `Failed to publish (${res.status})`)
      }

      await fetchInstances()
      toast.success('OS published: alerts and cadence created')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to publish')
    } finally {
      setPublishingId(null)
    }
  }

  const filtered = useMemo(() =>
    instances.filter((instance) => {
      const matchesStatus = statusFilter === 'all' ? true : instance.status === statusFilter
      if (!matchesStatus) return false
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        instance.name.toLowerCase().includes(q) ||
        instance.os_templates?.name?.toLowerCase().includes(q) ||
        instance.os_templates?.key?.toLowerCase().includes(q)
      )
    }),
    [instances, statusFilter, search]
  )

  if (loading || roleLoading) {
    return (
      <OsPage title="OS Instances" description="Manage your Operating System workspaces.">
        <OsTableSkeleton rows={6} columns={5} />
      </OsPage>
    )
  }

  return (
    <OsPage
      title="OS Instances"
      description="Manage your Operating System workspaces."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={fetchInstances} aria-label="Refresh instances">
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
          <PermissionButton
            allowed={canWriteAdmin}
            disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
            size="sm"
            onClick={() => router.push('/app/build/templates')}
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create OS
          </PermissionButton>
        </>
      }
    >
      {(!canWriteAdmin || isDemo) && (
        <ReadOnlyBanner
          title={isDemo ? 'Demo org is read-only' : 'Permission required'}
          description={
            isDemo
              ? 'Creation and publishing are disabled in the demo organization.'
              : 'Create and publish actions require OWNER or ADMIN permissions.'
          }
        />
      )}

      {error && <OsErrorState description={error} onRetry={fetchInstances} />}

      {!error && instances.length === 0 ? (
        <OsEmptyState
          title="No OS instances yet"
          description="Create your first OS from a template to generate alerts, tasks, and cadence agendas."
          icon={<ArrowUpRight className="h-6 w-6" aria-hidden="true" />}
          action={
            <PermissionButton
              allowed={canWriteAdmin}
              disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
              onClick={() => router.push('/app/build/templates')}
            >
              Browse templates
            </PermissionButton>
          }
        />
      ) : (
        <>
          <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-background/80 backdrop-blur border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-full md:w-[260px]">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search instances…"
                    aria-label="Search instances"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {filtered.length} of {instances.length} instances
              </div>
            </div>

            <div className="pt-3">
              <ActiveFilters
                filters={[
                  ...(statusFilter !== 'all'
                    ? [
                        {
                          key: 'status',
                          label: `Status: ${statusFilter}`,
                          onClear: () => setStatusFilter('all'),
                        },
                      ]
                    : []),
                  ...(search.trim()
                    ? [
                        {
                          key: 'search',
                          label: `Search: “${search.trim()}”`,
                          onClear: () => setSearch(''),
                        },
                      ]
                    : []),
                ]}
                onReset={() => {
                  setStatusFilter('all')
                  setSearch('')
                }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <OsEmptyState
              title="No instances match your filters"
              description="Try resetting filters or create a new OS instance."
              icon={<ArrowUpRight className="h-6 w-6" aria-hidden="true" />}
              action={
                <Button variant="outline" onClick={() => { setStatusFilter('all'); setSearch('') }}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="max-w-[420px]">
                          <div className="font-medium truncate">{instance.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {instance.os_templates?.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {instance.os_templates?.name}
                        </TableCell>
                        <TableCell>
                          <InstanceStatusPill status={instance.status} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {instance.published_at ? `Published ${formatDate(instance.published_at)}` : `Created ${formatDate(instance.created_at)}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {instance.status === 'draft' && (
                              <PermissionButton
                                allowed={canWriteAdmin}
                                disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
                                size="sm"
                                onClick={() => handlePublish(instance.id)}
                                disabled={publishingId === instance.id}
                              >
                                {publishingId === instance.id ? 'Publishing…' : 'Publish'}
                              </PermissionButton>
                            )}
                            {instance.status === 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/app/operate?os=${instance.id}`)}
                              >
                                Open
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </OsPage>
  )
}



