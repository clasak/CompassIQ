'use client'

import { useEffect, useState } from 'react'
import { useRole } from '@/hooks/use-role'
import { createClient } from '@/lib/supabase/client'
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
import { AlertStatePill, SeverityPill } from '@/components/os/OsPills'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, RefreshCw, Search } from 'lucide-react'

interface Alert {
  id: string
  kpi_key: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  title: string
  description: string
  state: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'
  owner: string | null
  due_at: string | null
  disposition: string | null
  created_at: string
}

export default function AlertsPage() {
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<string>('')

  useEffect(() => {
    loadCurrentUserEmail()
  }, [])

  async function loadCurrentUserEmail() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) setCurrentUser(user.email)
    } catch {
      // ignore
    }
  }

  async function fetchAlerts() {
    setError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (stateFilter !== 'all') params.append('state', stateFilter)
      if (severityFilter !== 'all') params.append('severity', severityFilter)

      const res = await fetch(`/api/os/alerts?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load alerts (${res.status})`)
      }
      const data = await res.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load alerts'
      setError(message)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [stateFilter, severityFilter])

  async function handleUpdateAlert(alertId: string, updates: any) {
    if (!canWriteAdmin) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return
    }

    try {
      const res = await fetch(`/api/os/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
          return
        }
        throw new Error(data.error || 'Failed to update alert')
      }

      await fetchAlerts()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update alert')
    }
  }

  const filtered = alerts.filter((a) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      a.title.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.owner || '').toLowerCase().includes(q) ||
      (a.kpi_key || '').toLowerCase().includes(q)
    )
  })

  const canUpdateAlerts = canWriteAdmin && !isDemo
  const alertUpdateDisabledReason = isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'

  return (
    <OsPage
      title="Alerts"
      description="Monitor and manage OS execution alerts."
      actions={
        <Button variant="outline" size="sm" onClick={fetchAlerts} aria-label="Refresh alerts">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Refresh
        </Button>
      }
    >
      {(!canWriteAdmin || isDemo) && (
        <ReadOnlyBanner
          title={isDemo ? 'Demo org is read-only' : 'Permission required'}
          description={
            isDemo
              ? 'Alert updates are disabled in the demo organization.'
              : 'Alert updates require OWNER or ADMIN permissions.'
          }
        />
      )}

      <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-background/80 backdrop-blur border-b">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alerts…"
                className="pl-9"
                aria-label="Search alerts"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filtered.length} alerts
          </div>
        </div>

        <div className="pt-3">
          <ActiveFilters
            filters={[
              ...(search.trim()
                ? [{ key: 'search', label: `Search: “${search.trim()}”`, onClear: () => setSearch('') }]
                : []),
              ...(stateFilter !== 'all'
                ? [{ key: 'state', label: `State: ${stateFilter}`, onClear: () => setStateFilter('all') }]
                : []),
              ...(severityFilter !== 'all'
                ? [{ key: 'severity', label: `Severity: ${severityFilter}`, onClear: () => setSeverityFilter('all') }]
                : []),
            ]}
            onReset={() => {
              setSearch('')
              setStateFilter('all')
              setSeverityFilter('all')
            }}
          />
        </div>
      </div>

      {error && <OsErrorState description={error} onRetry={fetchAlerts} />}

      {(loading || roleLoading) && !error ? (
        <OsTableSkeleton rows={7} columns={6} />
      ) : filtered.length === 0 ? (
        <OsEmptyState
          title="No alerts found"
          description="Try adjusting filters, or publish an OS instance to generate alerts."
          icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
          action={
            <Button variant="outline" onClick={() => { setSearch(''); setStateFilter('all'); setSeverityFilter('all') }}>
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
                  <TableHead>Severity</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <SeverityPill severity={alert.severity} />
                    </TableCell>
                    <TableCell className="max-w-[520px]">
                      <div className="font-medium truncate">{alert.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {alert.description || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {alert.owner || 'Unassigned'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {alert.due_at ? formatDate(alert.due_at) : '—'}
                    </TableCell>
                    <TableCell>
                      <AlertStatePill state={alert.state} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <PermissionButton
                          allowed={canUpdateAlerts}
                          disabledReason={alertUpdateDisabledReason}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!currentUser) {
                              toast.error('Unable to detect your email for assignment')
                              return
                            }
                            handleUpdateAlert(alert.id, { owner: currentUser })
                          }}
                        >
                          Assign to me
                        </PermissionButton>
                        <PermissionButton
                          allowed={canUpdateAlerts}
                          disabledReason={alertUpdateDisabledReason}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const dueDate = new Date()
                            dueDate.setDate(dueDate.getDate() + 7)
                            handleUpdateAlert(alert.id, { due_at: dueDate.toISOString() })
                          }}
                        >
                          Set due
                        </PermissionButton>
                        {alert.state !== 'resolved' && alert.state !== 'dismissed' && (
                          <PermissionButton
                            allowed={canUpdateAlerts}
                            disabledReason={alertUpdateDisabledReason}
                            size="sm"
                            onClick={() => handleUpdateAlert(alert.id, { state: 'resolved' })}
                          >
                            Resolve
                          </PermissionButton>
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
    </OsPage>
  )
}
