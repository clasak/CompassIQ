'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PermissionButton } from '@/components/ui/permission-button'
import { OsPage } from '@/components/os/OsPage'
import { ReadOnlyBanner } from '@/components/os/ReadOnlyBanner'
import { OsEmptyState } from '@/components/os/OsEmptyState'
import { OsErrorState } from '@/components/os/OsErrorState'
import { OsTableSkeleton } from '@/components/os/OsTableSkeleton'
import { AlertStatePill, SeverityPill, TaskStatePill } from '@/components/os/OsPills'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { useRole } from '@/hooks/use-role'
import { CalendarDays, Download, RefreshCw } from 'lucide-react'

interface AgendaItem {
  type: string
  title: string
  items: any[]
}

export default function CadencePage() {
  const searchParams = useSearchParams()
  const clientProjectId = searchParams.get('client')
  const osInstanceId = searchParams.get('os') // Legacy support
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [activeTab, setActiveTab] = useState('weekly')
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgenda = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const url = new URL(`/api/os/cadence/${activeTab}`, window.location.origin)
      if (clientProjectId) {
        url.searchParams.set('client', clientProjectId)
      } else if (osInstanceId) {
        url.searchParams.set('os', osInstanceId)
      }
      const res = await fetch(url.toString())
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load agenda (${res.status})`)
      }
      const data = await res.json()
      setAgenda(data.agenda || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load agenda'
      setError(message)
      setAgenda([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, clientProjectId, osInstanceId])

  useEffect(() => {
    if (clientProjectId || osInstanceId) {
      fetchAgenda()
    } else {
      setLoading(false)
    }
  }, [clientProjectId, osInstanceId, fetchAgenda])

  async function handleExportExecPacket() {
    if (!canWriteAdmin || isDemo) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return
    }
    if (!clientProjectId && !osInstanceId) {
      toast.error('Client project or OS instance ID required')
      return
    }

    try {
      const end = new Date()
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

      const res = await fetch('/api/os/exec-packets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          os_instance_id: osInstanceId || null,
          client_project_id: clientProjectId || null,
          period_start: start.toISOString(),
          period_end: end.toISOString()
        })
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (body.code === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
          return
        }
        throw new Error(body.error || 'Failed to generate exec packet')
      }

      const data = await res.json()
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(data.packet_json, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `exec-packet-${activeTab}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Exec packet exported')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export exec packet')
    }
  }

  const groupedAgenda = useMemo(() => {
    const map = new Map<string, AgendaItem>()
    for (const section of agenda) {
      const key = `${section.type}::${section.title}`
      const existing = map.get(key)
      if (existing) {
        existing.items = [...existing.items, ...(section.items || [])]
      } else {
        map.set(key, { type: section.type, title: section.title, items: [...(section.items || [])] })
      }
    }
    // De-dupe KPI sections (placeholder repeats)
    const out = Array.from(map.values()).map((s) => {
      if (s.type === 'kpis') return { ...s, items: [] }
      return s
    })
    return out
  }, [agenda])

  const totals = useMemo(() => {
    const alertsCount = groupedAgenda.filter((s) => s.type === 'alerts').reduce((sum, s) => sum + (s.items?.length || 0), 0)
    const tasksCount = groupedAgenda.filter((s) => s.type === 'tasks').reduce((sum, s) => sum + (s.items?.length || 0), 0)
    return { alertsCount, tasksCount, sections: groupedAgenda.length }
  }, [groupedAgenda])

  return (
    <OsPage
      title="Meeting Mode"
      description="Auto-generated agendas for your operating cadence."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={fetchAgenda} aria-label="Refresh agenda">
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
          {(clientProjectId || osInstanceId) && (
            <PermissionButton
              allowed={canWriteAdmin && !isDemo}
              disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
              size="sm"
              variant="outline"
              onClick={handleExportExecPacket}
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Export Exec Packet
            </PermissionButton>
          )}
        </>
      }
    >
      {(!canWriteAdmin || isDemo) && (
        <ReadOnlyBanner
          title={isDemo ? 'Demo org is read-only' : 'Permission required'}
          description={
            isDemo
              ? 'Exec packet export is disabled in the demo organization.'
              : 'Exec packet export requires OWNER or ADMIN permissions.'
          }
        />
      )}

      {!clientProjectId && !osInstanceId && (
        <OsEmptyState
          title="Select a client project"
          description="Open Meeting Mode from a client project to view the cadence agenda for that engagement."
          icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
          action={
            <Button variant="outline" onClick={() => window.location.href = '/app/clients'}>
              Go to Client Projects
            </Button>
          }
        />
      )}

      {error && <OsErrorState description={error} onRetry={fetchAgenda} />}

      {(loading || roleLoading) && (clientProjectId || osInstanceId) && !error ? (
        <OsTableSkeleton rows={6} columns={5} />
      ) : (clientProjectId || osInstanceId) && (groupedAgenda.length === 0 || (totals.alertsCount === 0 && totals.tasksCount === 0)) ? (
        <OsEmptyState
          title="No agenda items yet"
          description="Publish an OS instance to generate cadence rules, then open Meeting Mode again."
          icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
        />
      ) : (clientProjectId || osInstanceId) ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Open alerts</div>
                <div className="text-2xl font-semibold">{totals.alertsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Open tasks</div>
                <div className="text-2xl font-semibold">{totals.tasksCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Agenda sections</div>
                <div className="text-2xl font-semibold">{totals.sections}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {tab === 'daily' ? 'Daily Standup' : tab === 'weekly' ? 'Weekly Operations Review' : 'Monthly Business Review'}
                    </CardTitle>
                    <CardDescription>Auto-generated from open alerts and tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {groupedAgenda.map((section, idx) => (
                      <div key={`${section.type}-${idx}`} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{section.title}</div>
                          <div className="text-xs text-muted-foreground">{section.items.length} items</div>
                        </div>

                        {section.type === 'kpis' ? (
                          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                            KPI trend scoring is a placeholder in this version.
                          </div>
                        ) : section.items.length === 0 ? (
                          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                            No items matched the cadence rules.
                          </div>
                        ) : section.type === 'alerts' ? (
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Severity</TableHead>
                                  <TableHead>Alert</TableHead>
                                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                                  <TableHead className="hidden md:table-cell">Due</TableHead>
                                  <TableHead>State</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {section.items.slice(0, 8).map((a: any) => (
                                  <TableRow key={a.id}>
                                    <TableCell>
                                      <SeverityPill severity={a.severity} />
                                    </TableCell>
                                    <TableCell className="max-w-[520px]">
                                      <div className="font-medium truncate">{a.title}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">{a.description || '—'}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                      {a.owner || 'Unassigned'}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                      {a.due_at ? formatDate(a.due_at) : '—'}
                                    </TableCell>
                                    <TableCell>
                                      <AlertStatePill state={a.state} />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Task</TableHead>
                                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                                  <TableHead className="hidden md:table-cell">Due</TableHead>
                                  <TableHead>State</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {section.items.slice(0, 8).map((t: any) => (
                                  <TableRow key={t.id}>
                                    <TableCell className="max-w-[520px]">
                                      <div className="font-medium truncate">{t.title}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">{t.description || '—'}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                      {t.owner}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                      {t.due_at ? formatDate(t.due_at) : '—'}
                                    </TableCell>
                                    <TableCell>
                                      <TaskStatePill state={t.state} />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : null}
    </OsPage>
  )
}

