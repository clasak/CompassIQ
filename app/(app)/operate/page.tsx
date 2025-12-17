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
import { formatDate } from '@/lib/utils'
import { useRole } from '@/hooks/use-role'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Download, Gauge, RefreshCw, ShieldCheck, Target, CalendarDays } from 'lucide-react'

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

type HealthColor = 'green' | 'yellow' | 'red'

interface ExecutiveTile {
  key: string
  title: string
  value: string
  statusLabel: string
  statusColor: HealthColor
  helper: string
}

interface JobRiskRow {
  id: string
  project: string
  customer: string
  segment: string
  projectManager: string
  marginPct: number
  budgetOverPct: number
  unbilledWip: string
  statusColor: HealthColor
  nextAction: string
}

interface CashRiskRow {
  id: string
  customer: string
  segment: string
  projectManager: string
  arOver60: string
  billingLagDays: number
  unbilledWip: string
  statusColor: HealthColor
  nextAction: string
}

interface ScorecardRow {
  id: string
  kpi: string
  owner: string
  target: string
  actual: string
  statusColor: HealthColor
  note: string
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
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [filters, setFilters] = useState<{ customer: string; segment: string; projectManager: string }>({
    customer: 'all',
    segment: 'all',
    projectManager: 'all',
  })

  useEffect(() => {
    // In demo mode, we still fetch (if params are present) but always render a proof-first experience.
    // In non-demo mode, we only fetch when a client/OS context is selected.
    if (isDemo || clientProjectId || osInstanceId) {
      fetchData()
    } else {
      setLoading(false)
    }
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
      setLastUpdatedAt(new Date())
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

  const demoTiles: ExecutiveTile[] = [
    {
      key: 'jobs_over_budget',
      title: 'Jobs over budget',
      value: '6',
      statusLabel: 'At risk',
      statusColor: 'yellow',
      helper: 'Margin leakage surfaced daily',
    },
    {
      key: 'ar_over_60',
      title: 'AR > 60 days',
      value: '$412k',
      statusLabel: 'Critical',
      statusColor: 'red',
      helper: 'Cash drag prioritized by owner',
    },
    {
      key: 'unbilled_wip',
      title: 'Unbilled WIP',
      value: '$287k',
      statusLabel: 'At risk',
      statusColor: 'yellow',
      helper: 'Billing backlog visible within 24h',
    },
    {
      key: 'utilization',
      title: 'Utilization',
      value: '72%',
      statusLabel: 'On track',
      statusColor: 'green',
      helper: 'Labor efficiency in one glance',
    },
  ]

  const placeholderTiles: ExecutiveTile[] = [
    {
      key: 'jobs_over_budget',
      title: 'Jobs over budget',
      value: '—',
      statusLabel: 'Connect job costing',
      statusColor: 'yellow',
      helper: 'Requires cost-to-complete + budget feeds',
    },
    {
      key: 'ar_over_60',
      title: 'AR > 60 days',
      value: '—',
      statusLabel: 'Connect AR aging',
      statusColor: 'yellow',
      helper: 'Requires AR aging + payments feeds',
    },
    {
      key: 'unbilled_wip',
      title: 'Unbilled WIP',
      value: '—',
      statusLabel: 'Connect billing',
      statusColor: 'yellow',
      helper: 'Requires billing backlog + WIP feeds',
    },
    {
      key: 'utilization',
      title: 'Utilization',
      value: '—',
      statusLabel: 'Connect labor',
      statusColor: 'yellow',
      helper: 'Requires time/labor feeds',
    },
  ]

  const demoJobsAtRisk: JobRiskRow[] = [
    {
      id: 'jr-1',
      project: 'Riverside Logistics — Phase 2',
      customer: 'Riverside Logistics',
      segment: 'Industrial',
      projectManager: 'A. Patel',
      marginPct: 8.4,
      budgetOverPct: 6.2,
      unbilledWip: '$64k',
      statusColor: 'red',
      nextAction: 'Approve change order + rebalance crews',
    },
    {
      id: 'jr-2',
      project: 'Oakview Medical — Renovation',
      customer: 'Oakview Medical',
      segment: 'Healthcare',
      projectManager: 'S. Chen',
      marginPct: 11.2,
      budgetOverPct: 3.4,
      unbilledWip: '$41k',
      statusColor: 'yellow',
      nextAction: 'Lock scope + reforecast labor hours',
    },
    {
      id: 'jr-3',
      project: 'Cedar Grove Apartments — Sitework',
      customer: 'Cedar Grove DevCo',
      segment: 'Multifamily',
      projectManager: 'J. Rivera',
      marginPct: 9.6,
      budgetOverPct: 2.1,
      unbilledWip: '$28k',
      statusColor: 'yellow',
      nextAction: 'Review subcontractor overruns',
    },
    {
      id: 'jr-4',
      project: 'Westport Schools — Gym Addition',
      customer: 'Westport Schools',
      segment: 'Public',
      projectManager: 'M. Johnson',
      marginPct: 13.8,
      budgetOverPct: 1.2,
      unbilledWip: '$19k',
      statusColor: 'green',
      nextAction: 'Monitor procurement lead times',
    },
  ]

  const demoCashAtRisk: CashRiskRow[] = [
    {
      id: 'cr-1',
      customer: 'Oakview Medical',
      segment: 'Healthcare',
      projectManager: 'S. Chen',
      arOver60: '$168k',
      billingLagDays: 18,
      unbilledWip: '$41k',
      statusColor: 'red',
      nextAction: 'Escalate AR: CFO call + payment plan',
    },
    {
      id: 'cr-2',
      customer: 'Riverside Logistics',
      segment: 'Industrial',
      projectManager: 'A. Patel',
      arOver60: '$124k',
      billingLagDays: 12,
      unbilledWip: '$64k',
      statusColor: 'yellow',
      nextAction: 'Push billing: release invoice #2149',
    },
    {
      id: 'cr-3',
      customer: 'Cedar Grove DevCo',
      segment: 'Multifamily',
      projectManager: 'J. Rivera',
      arOver60: '$72k',
      billingLagDays: 9,
      unbilledWip: '$28k',
      statusColor: 'yellow',
      nextAction: 'Confirm lien waivers + submit draw',
    },
    {
      id: 'cr-4',
      customer: 'Westport Schools',
      segment: 'Public',
      projectManager: 'M. Johnson',
      arOver60: '$48k',
      billingLagDays: 6,
      unbilledWip: '$19k',
      statusColor: 'green',
      nextAction: 'Routine follow-up (AP weekly)',
    },
  ]

  const demoAlerts: Alert[] = [
    {
      id: 'da-1',
      title: 'Billing lag > 14 days on Oakview Medical (invoices not submitted)',
      severity: 'critical',
      state: 'open',
      owner: 'Controller',
      due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'da-2',
      title: 'Job margin compression: Riverside Logistics trending -3.1 pts WoW',
      severity: 'high',
      state: 'open',
      owner: 'Ops Director',
      due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'da-3',
      title: 'Unbilled WIP > $50k on Riverside Logistics (pending approvals)',
      severity: 'high',
      state: 'open',
      owner: 'PMO Lead',
      due_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'da-4',
      title: 'Labor utilization fell below target (72% vs 80%)',
      severity: 'medium',
      state: 'open',
      owner: 'Resource Manager',
      due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const demoTasks: Task[] = [
    {
      id: 'dt-1',
      title: 'Approve Oakview invoice pack + submit by EOD',
      owner: 'Controller',
      due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      state: 'in_progress',
    },
    {
      id: 'dt-2',
      title: 'Riverside: reforecast labor + lock scope changes',
      owner: 'Ops Director',
      due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      state: 'open',
    },
    {
      id: 'dt-3',
      title: 'Cedar Grove: confirm draw schedule + lien waivers',
      owner: 'PMO Lead',
      due_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      state: 'open',
    },
  ]

  const demoScorecard: ScorecardRow[] = [
    {
      id: 'sc-1',
      kpi: 'Gross margin (rolling 4 weeks)',
      owner: 'Ops Director',
      target: '≥ 14%',
      actual: '12.9%',
      statusColor: 'yellow',
      note: '2 jobs compressing margin this week',
    },
    {
      id: 'sc-2',
      kpi: 'AR > 60 days',
      owner: 'Controller',
      target: '≤ $250k',
      actual: '$412k',
      statusColor: 'red',
      note: 'Oakview is primary driver; escalated',
    },
    {
      id: 'sc-3',
      kpi: 'Unbilled WIP',
      owner: 'PMO Lead',
      target: '≤ $150k',
      actual: '$287k',
      statusColor: 'yellow',
      note: '3 invoice packs pending approvals',
    },
    {
      id: 'sc-4',
      kpi: 'Billing lag (median)',
      owner: 'Controller',
      target: '≤ 7 days',
      actual: '11 days',
      statusColor: 'yellow',
      note: 'Tighten approval SLA to 24h',
    },
    {
      id: 'sc-5',
      kpi: 'Labor utilization',
      owner: 'Resource Manager',
      target: '≥ 80%',
      actual: '72%',
      statusColor: 'yellow',
      note: 'Rebalance crews + reduce idle time',
    },
    {
      id: 'sc-6',
      kpi: 'Forecast accuracy (EAC vs actual)',
      owner: 'PMO Lead',
      target: '± 2%',
      actual: '± 3.6%',
      statusColor: 'yellow',
      note: 'Improve weekly reforecast discipline',
    },
  ]

  const isProofMode = isDemo
  const tiles = isProofMode ? demoTiles : placeholderTiles
  const jobsAtRisk = isProofMode ? demoJobsAtRisk : []
  const cashAtRisk = isProofMode ? demoCashAtRisk : []
  const scorecard = isProofMode ? demoScorecard : []

  const effectiveAlerts = isProofMode && topAlerts.length === 0 ? demoAlerts : topAlerts
  const effectiveTasks = isProofMode && tasks.length === 0 ? demoTasks : tasks

  const statusDotClass: Record<HealthColor, string> = {
    green: 'bg-green-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  }
  const statusBorderClass: Record<HealthColor, string> = {
    green: 'border-l-4 border-l-green-500',
    yellow: 'border-l-4 border-l-amber-500',
    red: 'border-l-4 border-l-red-500',
  }

  const allCustomers = Array.from(
    new Set([...jobsAtRisk.map((r) => r.customer), ...cashAtRisk.map((r) => r.customer)])
  ).sort()
  const allSegments = Array.from(
    new Set([...jobsAtRisk.map((r) => r.segment), ...cashAtRisk.map((r) => r.segment)])
  ).sort()
  const allPMs = Array.from(
    new Set([...jobsAtRisk.map((r) => r.projectManager), ...cashAtRisk.map((r) => r.projectManager)])
  ).sort()

  const filteredJobs = jobsAtRisk.filter((r) => {
    if (filters.customer !== 'all' && r.customer !== filters.customer) return false
    if (filters.segment !== 'all' && r.segment !== filters.segment) return false
    if (filters.projectManager !== 'all' && r.projectManager !== filters.projectManager) return false
    return true
  })
  const filteredCash = cashAtRisk.filter((r) => {
    if (filters.customer !== 'all' && r.customer !== filters.customer) return false
    if (filters.segment !== 'all' && r.segment !== filters.segment) return false
    if (filters.projectManager !== 'all' && r.projectManager !== filters.projectManager) return false
    return true
  })

  const combinedFeed = [
    ...effectiveAlerts.map((a) => ({
      type: 'alert' as const,
      id: a.id,
      title: a.title,
      owner: a.owner || 'Unassigned',
      due_at: a.due_at || null,
      severity: a.severity,
      state: a.state,
    })),
    ...effectiveTasks.map((t) => ({
      type: 'task' as const,
      id: t.id,
      title: t.title,
      owner: t.owner,
      due_at: t.due_at,
      severity: null as any,
      state: t.state,
    })),
  ]
    .sort((a, b) => {
      const ad = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY
      const bd = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY
      return ad - bd
    })
    .slice(0, 8)

  return (
    <OsPage
      title="Founder Command Center"
      description="Stop margin leakage, cash drag, and dashboard chaos—see what’s at risk, assign owners, and run a weekly scorecard in one place."
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
              ? 'This view is pre-populated to show what a CFO/COO sees during a 60-day proof pilot. Exec packet export is disabled in demo.'
              : 'Exec packet export requires OWNER or ADMIN permissions.'
          }
        />
      )}

      {!isDemo && !clientProjectId && !osInstanceId && (
        <OsEmptyState
          title="Select a client project"
          description="Open Operate Mode from a client project to view the executive command center for that engagement."
          icon={<Gauge className="h-6 w-6" aria-hidden="true" />}
          actionLabel="Go to Client Projects"
          onAction={() => router.push('/app/clients')}
        />
      )}

      {error && <OsErrorState description={error} onRetry={fetchData} />}

      {(loading || roleLoading) && (isDemo || clientProjectId || osInstanceId) && !error ? (
        <OsTableSkeleton rows={6} columns={5} />
      ) : isDemo || clientProjectId || osInstanceId ? (
        <>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="text-table-sm text-muted-foreground">
              {lastUpdatedAt ? (
                <>
                  Last updated <span className="font-medium text-foreground">{formatDate(lastUpdatedAt.toISOString())}</span>
                </>
              ) : (
                'Last updated —'
              )}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                Pilot proof view
              </Badge>
            </div>
          </div>

          {/* Top band: executive scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {tiles.map((t) => (
              <Card key={t.key} className={`border-border/50 ${statusBorderClass[t.statusColor]}`}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-section-sm text-muted-foreground">{t.title}</div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${statusDotClass[t.statusColor]}`} aria-hidden="true" />
                      <span className="text-[11px] text-muted-foreground">{t.statusLabel}</span>
                    </div>
                  </div>
                  <div className="text-[28px] leading-none font-semibold tracking-tight">{t.value}</div>
                  <div className="text-table-sm text-muted-foreground">{t.helper}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Middle: jobs + cash at risk (with filters) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-9 space-y-6">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-0.5">
                      <CardTitle className="text-section font-semibold">Jobs at risk</CardTitle>
                      <CardDescription className="text-table-sm text-muted-foreground">
                        Job costing signals that indicate margin compression, WIP health, and budget overruns.
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Select value={filters.customer} onValueChange={(v) => setFilters((s) => ({ ...s, customer: v }))}>
                        <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by customer">
                          <SelectValue placeholder="Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All customers</SelectItem>
                          {allCustomers.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filters.segment} onValueChange={(v) => setFilters((s) => ({ ...s, segment: v }))}>
                        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by segment">
                          <SelectValue placeholder="Segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All segments</SelectItem>
                          {allSegments.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filters.projectManager}
                        onValueChange={(v) => setFilters((s) => ({ ...s, projectManager: v }))}
                      >
                        <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by project manager">
                          <SelectValue placeholder="Project manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All PMs</SelectItem>
                          {allPMs.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table className="table-standard">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead className="hidden md:table-cell">PM</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Margin</TableHead>
                        <TableHead className="text-right">Over budget</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Unbilled WIP</TableHead>
                        <TableHead className="hidden lg:table-cell">Next action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="max-w-[520px]">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${statusDotClass[r.statusColor]}`} aria-hidden="true" />
                              <div className="min-w-0">
                                <div className="font-medium truncate">{r.project}</div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {r.customer} • {r.segment}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{r.projectManager}</TableCell>
                          <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                            {r.marginPct.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className={r.statusColor === 'red' ? 'text-red-600 dark:text-red-500' : r.statusColor === 'yellow' ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'}>
                              +{r.budgetOverPct.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                            {r.unbilledWip}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{r.nextAction}</TableCell>
                        </TableRow>
                      ))}
                      {!isProofMode && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-table text-muted-foreground">
                            Connect job costing to populate jobs at risk (margin trend, WIP health, budget variance).
                          </TableCell>
                        </TableRow>
                      )}
                      {isProofMode && filteredJobs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-table text-muted-foreground">
                            No jobs matched these filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="space-y-0.5">
                    <CardTitle className="text-section font-semibold">Cash at risk</CardTitle>
                    <CardDescription className="text-table-sm text-muted-foreground">
                      AR aging, billing lag, and unbilled WIP that create cash drag.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table className="table-standard">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">PM</TableHead>
                        <TableHead className="text-right">AR &gt; 60</TableHead>
                        <TableHead className="text-right">Billing lag</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Unbilled WIP</TableHead>
                        <TableHead className="hidden lg:table-cell">Next action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCash.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="max-w-[520px]">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${statusDotClass[r.statusColor]}`} aria-hidden="true" />
                              <div className="min-w-0">
                                <div className="font-medium truncate">{r.customer}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{r.segment}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{r.projectManager}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className={r.statusColor === 'red' ? 'text-red-600 dark:text-red-500' : r.statusColor === 'yellow' ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'}>
                              {r.arOver60}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{r.billingLagDays}d</TableCell>
                          <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                            {r.unbilledWip}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{r.nextAction}</TableCell>
                        </TableRow>
                      ))}
                      {!isProofMode && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-table text-muted-foreground">
                            Connect AR aging + billing feeds to populate cash at risk (slow payers, billing lag, backlog).
                          </TableCell>
                        </TableRow>
                      )}
                      {isProofMode && filteredCash.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-table text-muted-foreground">
                            No cash risks matched these filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right side: Pilot Proof Panel + CTA */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-border/50 lg:sticky lg:top-24">
                <CardHeader className="pb-3">
                  <div className="space-y-0.5">
                    <CardTitle className="text-section font-semibold">Pilot Proof Panel</CardTitle>
                    <CardDescription className="text-table-sm text-muted-foreground">
                      Map what you see to 60-day pilot outcomes.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                      <div>
                        <div className="font-medium">Margin protected</div>
                        <div className="text-muted-foreground text-[12px]">“Jobs over budget” + “Jobs at risk” show leakage early.</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                      <div>
                        <div className="font-medium">Cash accelerated</div>
                        <div className="text-muted-foreground text-[12px]">“AR &gt; 60” + billing lag alerts surface drag within 24h.</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                      <div>
                        <div className="font-medium">Accountability layer</div>
                        <div className="text-muted-foreground text-[12px]">Owners + due dates + weekly scorecard drive follow-through.</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                      <div>
                        <div className="font-medium">Weekly scorecard by Monday 9 AM</div>
                        <div className="text-muted-foreground text-[12px]">This week’s scorecard ties directly into Meeting Mode.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/30 bg-surface-2/30 p-3">
                    <div className="text-xs text-muted-foreground mb-2">Run a 60-day proof pilot</div>
                    <ul className="text-[12px] text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Systems connected</li>
                      <li>Dashboards live</li>
                      <li>Alerts firing daily</li>
                      <li>Weekly scorecard running</li>
                    </ul>
                    <Button
                      className="w-full mt-3"
                      onClick={() => toast.success('Pilot request captured (demo). Wire this CTA to your commercial flow next.')}
                    >
                      Run a 60-Day Proof Pilot
                    </Button>
                    <div className="text-[11px] text-muted-foreground mt-2">
                      CFO/COO-friendly: margin, cash, and labor in one place.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg border border-border/30 bg-surface-2/50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-section-sm text-muted-foreground mb-1">Data Trust</div>
                    <div className="text-section font-semibold">Healthy</div>
                    <div className="text-table-sm text-muted-foreground mt-1">
                      In demo, this is simulated. In production, this reflects ingest freshness and completeness.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom: alerts/commitments feed + weekly scorecard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-section font-semibold">Alerts & commitments</CardTitle>
                  <CardDescription className="text-table-sm text-muted-foreground">
                    5–8 core items with owners, due dates, and status.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/app/execute/alerts')}>
                    Alerts
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push('/app/execute/tasks')}>
                    Tasks
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {combinedFeed.length === 0 ? (
                  <div className="p-6 text-table text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    No alerts or commitments to show.
                  </div>
                ) : (
                  <Table className="table-standard">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden md:table-cell">Owner</TableHead>
                        <TableHead className="hidden md:table-cell">Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedFeed.map((i) => (
                        <TableRow key={`${i.type}-${i.id}`}>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {i.type === 'alert' ? 'Alert' : 'Commitment'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[520px]">
                            <div className="font-medium truncate">{i.title}</div>
                            {i.type === 'alert' && (
                              <div className="mt-1">
                                <SeverityPill severity={i.severity} />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{i.owner}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {i.due_at ? formatDate(i.due_at) : '—'}
                          </TableCell>
                          <TableCell>
                            {i.type === 'alert' ? <AlertStatePill state={i.state as any} /> : <TaskStatePill state={i.state as any} />}
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
                  <CardTitle className="text-section font-semibold">This week’s scorecard</CardTitle>
                  <CardDescription className="text-table-sm text-muted-foreground">
                    KPIs with owners and explicit weekly accountability.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const qp = clientProjectId ? `?client=${encodeURIComponent(clientProjectId)}` : osInstanceId ? `?os=${encodeURIComponent(osInstanceId)}` : ''
                    router.push(`/app/cadence${qp}`)
                  }}
                >
                  Open Meeting Mode
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="table-standard">
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead className="hidden md:table-cell">Owner</TableHead>
                      <TableHead className="hidden md:table-cell">Target</TableHead>
                      <TableHead>Actual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isProofMode && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-table text-muted-foreground">
                          Publish cadence rules to generate a weekly scorecard, then review it in Meeting Mode.
                        </TableCell>
                      </TableRow>
                    )}
                    {isProofMode && scorecard.slice(0, 6).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-[520px]">
                          <div className="flex items-start gap-2">
                            <div className={`h-2 w-2 rounded-full mt-1.5 ${statusDotClass[r.statusColor]}`} aria-hidden="true" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{r.kpi}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{r.note}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{r.owner}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{r.target}</TableCell>
                        <TableCell className="tabular-nums">
                          <span className={r.statusColor === 'red' ? 'text-red-600 dark:text-red-500' : r.statusColor === 'yellow' ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'}>
                            {r.actual}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </OsPage>
  )
}



