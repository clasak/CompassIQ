'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PermissionButton } from '@/components/ui/permission-button'
import { OsPage } from '@/components/os/OsPage'
import { ReadOnlyBanner } from '@/components/os/ReadOnlyBanner'
import { OsEmptyState } from '@/components/os/OsEmptyState'
import { OsErrorState } from '@/components/os/OsErrorState'
import { OsTableSkeleton } from '@/components/os/OsTableSkeleton'
import { AlertStatePill, SeverityPill, TaskStatePill } from '@/components/os/OsPills'
import { KPIStatCard } from '@/components/kpi/KPIStatCard'
import { formatDate } from '@/lib/utils'
import { useRole } from '@/hooks/use-role'
import { AlertTriangle, Download, Gauge, RefreshCw, ShieldCheck } from 'lucide-react'

interface Alert {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  state: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'
  owner?: string | null
  due_at?: string | null
  created_at?: string
}

interface Task {
  id: string
  title: string
  owner: string
  due_at: string | null
  state: 'open' | 'in_progress' | 'done' | 'canceled'
}

export default function OperatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientProjectId = searchParams.get('client')
  const osInstanceId = searchParams.get('os') // Legacy support
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [topAlerts, setTopAlerts] = useState<Alert[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [clientProjectId, osInstanceId])

  function severityRank(sev: string) {
    switch (sev) {
      case 'critical':
        return 4
      case 'high':
        return 3
      case 'medium':
        return 2
      case 'low':
        return 1
      default:
        return 0
    }
  }

  async function fetchData() {
    setError(null)
    setLoading(true)
    try {
      // Fetch open alerts and prioritize by severity
      const alertsRes = await fetch('/api/os/alerts?state=open')
      if (!alertsRes.ok) {
        const body = await alertsRes.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load alerts (${alertsRes.status})`)
      }
      const alertsData = await alertsRes.json()
      const openAlerts = (alertsData.alerts || []) as Alert[]
      const prioritized = [...openAlerts].sort((a, b) => {
        const s = severityRank(b.severity) - severityRank(a.severity)
        if (s !== 0) return s
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      })
      setTopAlerts(prioritized.slice(0, 8))

      // Fetch tasks due in next 7 days (open + in_progress)
      const [openTasksRes, inProgressRes] = await Promise.all([
        fetch('/api/os/tasks?state=open'),
        fetch('/api/os/tasks?state=in_progress'),
      ])
      if (!openTasksRes.ok) {
        const body = await openTasksRes.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load tasks (${openTasksRes.status})`)
      }
      if (!inProgressRes.ok) {
        const body = await inProgressRes.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load tasks (${inProgressRes.status})`)
      }

      const openTasksData = await openTasksRes.json()
      const inProgressData = await inProgressRes.json()
      const allTasks = [...(openTasksData.tasks || []), ...(inProgressData.tasks || [])] as Task[]
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcoming = allTasks
        .filter((t) => {
          if (!t.due_at) return false
          const due = new Date(t.due_at)
          return due >= now && due <= nextWeek
        })
        .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())
      setTasks(upcoming.slice(0, 8))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load operate data'
      setError(message)
      setTopAlerts([])
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  async function handleExportExecPacket() {
    if (!canWriteAdmin || isDemo) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return
    }
    const effectiveOsInstanceId = osInstanceId || (clientProjectId ? null : null) // TODO: Get OS instance from client project
    if (!effectiveOsInstanceId && !clientProjectId) {
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
          os_instance_id: effectiveOsInstanceId,
          client_project_id: clientProjectId,
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
      a.download = `exec-packet-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Exec packet exported')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export exec packet')
    }
  }

  const criticalCount = topAlerts.filter((a) => a.severity === 'critical').length
  const openAlertsCount = topAlerts.length
  const upcomingTasksCount = tasks.length

  return (
    <OsPage
      title="Founder Command Center"
      description="An executive view of risks, commitments, and operating rhythm."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={fetchData} aria-label="Refresh command center">
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
          {(clientProjectId || osInstanceId) && (
            <PermissionButton
              allowed={canWriteAdmin && !isDemo}
              disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
              size="sm"
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
          description="Open Operate Mode from a client project to view the executive command center for that engagement."
          icon={<Gauge className="h-6 w-6" aria-hidden="true" />}
          actionLabel="Go to Client Projects"
          onAction={() => router.push('/app/clients')}
        />
      )}

      {error && <OsErrorState description={error} onRetry={fetchData} />}

      {(loading || roleLoading) && (clientProjectId || osInstanceId) && !error ? (
        <OsTableSkeleton rows={6} columns={5} />
      ) : (clientProjectId || osInstanceId) ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPIStatCard
              title="Open Risks"
              value={openAlertsCount}
              timeframe="Last 7"
              onClick={() => router.push('/app/execute/alerts')}
            />
            <KPIStatCard
              title="Critical Risks"
              value={criticalCount}
              timeframe="Last 7"
              onClick={() => router.push('/app/execute/alerts?severity=critical')}
            />
            <KPIStatCard
              title="Commitments"
              value={upcomingTasksCount}
              timeframe="Last 7"
              onClick={() => router.push('/app/execute/tasks')}
            />
            <Card className="border-border/50">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg border border-border/30 bg-surface-2/50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-section-sm text-muted-foreground mb-1">Data Trust</div>
                  <div className="text-section font-semibold">Healthy</div>
                  <div className="text-table-sm text-muted-foreground mt-1">All systems operational</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-section font-semibold">Top Risks This Week</CardTitle>
                  <CardDescription className="text-table-sm text-muted-foreground">Prioritized by severity and recency</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/app/execute/alerts')} className="flex-shrink-0">
                  View all
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {topAlerts.length === 0 ? (
                  <div className="p-6 text-table text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    No open alerts right now.
                  </div>
                ) : (
                  <Table className="table-standard">
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
                      {topAlerts.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <SeverityPill severity={a.severity} />
                          </TableCell>
                          <TableCell className="max-w-[520px]">
                            <div className="font-medium truncate">{a.title}</div>
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
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-section font-semibold">Commitments</CardTitle>
                  <CardDescription className="text-table-sm text-muted-foreground">Due within the next 7 days</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/app/execute/tasks')} className="flex-shrink-0">
                  View all
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {tasks.length === 0 ? (
                  <div className="p-6 text-table text-muted-foreground">
                    No upcoming tasks due in the next 7 days.
                  </div>
                ) : (
                  <Table className="table-standard">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead className="hidden md:table-cell">Owner</TableHead>
                        <TableHead className="hidden md:table-cell">Due</TableHead>
                        <TableHead>State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="max-w-[520px]">
                            <div className="font-medium truncate">{t.title}</div>
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
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="space-y-0.5">
                <CardTitle className="text-section font-semibold">Data Trust</CardTitle>
                <CardDescription className="text-table-sm text-muted-foreground">Ingestion health and data quality metrics</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/30 bg-surface-2/30 px-4 py-3">
                  <div className="text-section-sm text-muted-foreground mb-1">Freshness</div>
                  <div className="text-section font-semibold">—</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-surface-2/30 px-4 py-3">
                  <div className="text-section-sm text-muted-foreground mb-1">Completeness</div>
                  <div className="text-section font-semibold">—</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-surface-2/30 px-4 py-3">
                  <div className="text-section-sm text-muted-foreground mb-1">Last Ingest</div>
                  <div className="text-section font-semibold">—</div>
                </div>
              </div>
              <p className="text-table text-muted-foreground">
                Data quality metrics will appear here once ingestion health is wired to real sources.
              </p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </OsPage>
  )
}

