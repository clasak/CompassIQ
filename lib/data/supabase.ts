/**
 * Supabase Data Adapter
 * Wraps existing Supabase queries
 */

import { createClient } from '../supabase/server'
import { getActiveOrgId } from '../org'
import { isDevDemoMode } from '../runtime'
import { serverPerf } from '../perf'

export async function getKPIs(startDate?: Date, endDate?: Date) {
  return serverPerf('data:getKPIs', async () => {
    const { getActivePreviewId } = await import('@/lib/preview')
    const previewWorkspaceId = await getActivePreviewId()
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }

    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate || new Date()

    const now = new Date()
    const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Parallelize independent queries
    const [
      { data: revenueData },
      { data: pipeline30 },
      { data: pipeline60 },
      { data: pipeline90 },
      { data: invoices },
      { data: payments },
    ] = await Promise.all([
      serverPerf('data:getKPIs:revenue', async () => {
        const result = await supabase
          .from('invoices')
          .select('total')
          .eq('org_id', orgId)
          .in('status', ['SENT', 'PAID', 'OVERDUE'])
          .gte('issue_date', start.toISOString().split('T')[0])
          .lte('issue_date', end.toISOString().split('T')[0])
        return result
      }),
      serverPerf('data:getKPIs:pipeline30', async () => {
        const result = await supabase
          .from('opportunities')
          .select('amount')
          .eq('org_id', orgId)
          .not('stage', 'in', '(WON,LOST)')
          .lte('close_date', day30.toISOString().split('T')[0])
        return result
      }),
      serverPerf('data:getKPIs:pipeline60', async () => {
        const result = await supabase
          .from('opportunities')
          .select('amount')
          .eq('org_id', orgId)
          .not('stage', 'in', '(WON,LOST)')
          .lte('close_date', day60.toISOString().split('T')[0])
        return result
      }),
      serverPerf('data:getKPIs:pipeline90', async () => {
        const result = await supabase
          .from('opportunities')
          .select('amount')
          .eq('org_id', orgId)
          .not('stage', 'in', '(WON,LOST)')
          .lte('close_date', day90.toISOString().split('T')[0])
        return result
      }),
      serverPerf('data:getKPIs:invoices', async () => {
        const result = await supabase
          .from('invoices')
          .select('id, total, status')
          .eq('org_id', orgId)
          .not('status', 'eq', 'VOID')
        return result
      }),
      serverPerf('data:getKPIs:payments', async () => {
        const result = await supabase
          .from('payments')
          .select('invoice_id, amount')
          .eq('org_id', orgId)
        return result
      }),
    ])

    const revenueMTD = revenueData?.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) || 0
    const pipeline30Sum = pipeline30?.reduce((sum, opp) => sum + (Number(opp.amount) || 0), 0) || 0
    const pipeline60Sum = pipeline60?.reduce((sum, opp) => sum + (Number(opp.amount) || 0), 0) || 0
    const pipeline90Sum = pipeline90?.reduce((sum, opp) => sum + (Number(opp.amount) || 0), 0) || 0

    const invoiceTotals = new Map<string, number>()
    invoices?.forEach((inv) => {
      invoiceTotals.set(inv.id, Number(inv.total) || 0)
    })

    const paymentTotals = new Map<string, number>()
    payments?.forEach((pay) => {
      const current = paymentTotals.get(pay.invoice_id) || 0
      paymentTotals.set(pay.invoice_id, current + (Number(pay.amount) || 0))
    })

    let arOutstanding = 0
    invoiceTotals.forEach((total, invoiceId) => {
      const paid = paymentTotals.get(invoiceId) || 0
      if (total > paid) {
        arOutstanding += total - paid
      }
    })

    const renewalThreshold = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

    // Parallelize remaining queries
    const [
      { data: workOrders },
      { data: accounts },
      { data: overdueInvoices },
    ] = await Promise.all([
      serverPerf('data:getKPIs:workOrders', async () => {
        const result = await supabase
          .from('work_orders')
          .select('status, completed_at, due_date')
          .eq('org_id', orgId)
          .eq('status', 'DONE')
        return result
      }),
      serverPerf('data:getKPIs:accounts', async () => {
        const result = await supabase
          .from('accounts')
          .select('id, renewal_date, health_override')
          .eq('org_id', orgId)
        return result
      }),
      serverPerf('data:getKPIs:overdueInvoices', async () => {
        const result = await supabase
          .from('invoices')
          .select('account_id')
          .eq('org_id', orgId)
          .eq('status', 'OVERDUE')
        return result
      }),
    ])

    const onTime =
      workOrders?.filter((wo) => {
        if (!wo.completed_at || !wo.due_date) return false
        return new Date(wo.completed_at) <= new Date(wo.due_date)
      }).length || 0
    const total = workOrders?.length || 0
    const onTimeDelivery = total > 0 ? onTime / total : 0

    const overdueAccountIds = new Set(overdueInvoices?.map((inv) => inv.account_id) || [])

    let churnRisk = 0
    accounts?.forEach((acc) => {
      if (acc.renewal_date && new Date(acc.renewal_date) <= renewalThreshold) {
        const health = acc.health_override !== null ? Number(acc.health_override) : 50
        if (health < 50 || overdueAccountIds.has(acc.id)) {
          churnRisk++
        }
      }
    })

    const computed = {
      revenueMTD,
      pipeline30: pipeline30Sum,
      pipeline60: pipeline60Sum,
      pipeline90: pipeline90Sum,
      arOutstanding,
      onTimeDelivery,
      churnRisk,
    }

    // If ingested metric_values exist, let them override computed KPIs (real data takes precedence).
    try {
      const keys = [
        'revenue_mtd',
        'pipeline_30',
        'pipeline_60',
        'pipeline_90',
        'ar_outstanding',
        'on_time_delivery',
        'churn_risk',
      ]
      // Check for preview mode - if preview_workspace_id is provided, filter by it
      let query = supabase
        .from('metric_values')
        .select('metric_key, value_num, occurred_on')
        .eq('org_id', orgId)
        .in('metric_key', keys as any)

      if (previewWorkspaceId) {
        query = query.eq('preview_workspace_id', previewWorkspaceId)
      } else {
        query = query.is('preview_workspace_id', null) // Only non-preview data in normal mode
      }

      query = query
        .order('occurred_on', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1000) // Get recent values

      const { data: allValues } = await query

      // Group by metric_key and get latest (similar to metric_values_latest view logic)
      const latestMap = new Map<string, any>()
      for (const row of (allValues as any[]) || []) {
        const key = String(row.metric_key)
        if (!latestMap.has(key)) {
          latestMap.set(key, row)
        }
      }
      const latest = Array.from(latestMap.values())

      for (const row of (latest as any[]) || []) {
        const key = String(row.metric_key)
        const n = row.value_num !== null && row.value_num !== undefined ? Number(row.value_num) : null
        if (!Number.isFinite(n as any)) continue
        if (key === 'revenue_mtd') computed.revenueMTD = n as any
        if (key === 'pipeline_30') computed.pipeline30 = n as any
        if (key === 'pipeline_60') computed.pipeline60 = n as any
        if (key === 'pipeline_90') computed.pipeline90 = n as any
        if (key === 'ar_outstanding') computed.arOutstanding = n as any
        if (key === 'on_time_delivery') computed.onTimeDelivery = n as any
        if (key === 'churn_risk') computed.churnRisk = Math.round(n as any) as any
      }
    } catch {
      // ignore, fall back to computed
    }

    return computed
  })
}

export async function getAlerts() {
  return serverPerf('data:getAlerts', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }

    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

    const { getActivePreviewId } = await import('@/lib/preview')
    const previewWorkspaceId = await getActivePreviewId()

    // If preview mode, get preview alerts
    if (previewWorkspaceId) {
      const { data: previewAlerts } = await supabase
        .from('preview_alerts')
        .select('title, description, severity')
        .eq('org_id', orgId)
        .eq('preview_workspace_id', previewWorkspaceId)
        .order('created_at', { ascending: false })

      if (previewAlerts && previewAlerts.length > 0) {
        return previewAlerts.map((alert, index) => ({
          id: `preview-alert-${index}`,
          title: alert.title,
          description: alert.description,
          severity: alert.severity || 'medium',
        }))
      }
    }

    const alerts: any[] = []

    const today = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { data: overdueInvoices },
      { data: overdueTasks },
      { data: oldTickets },
      { data: blockedWorkOrders },
      { data: dataSources },
    ] = await Promise.all([
      serverPerf('data:getAlerts:overdueInvoices', async () => {
        const result = await supabase
          .from('invoices')
          .select('id, invoice_number, account_id, accounts(name)')
          .eq('org_id', orgId)
          .eq('status', 'OVERDUE')
        return result
      }),
      serverPerf('data:getAlerts:overdueTasks', async () => {
        const result = await supabase
          .from('tasks')
          .select('id')
          .eq('org_id', orgId)
          .in('status', ['OPEN', 'IN_PROGRESS'])
          .lt('due_date', today)
        return result
      }),
      serverPerf('data:getAlerts:oldTickets', async () => {
        const result = await supabase
          .from('tickets')
          .select('id')
          .eq('org_id', orgId)
          .in('status', ['OPEN', 'IN_PROGRESS'])
          .lt('opened_at', sevenDaysAgo)
        return result
      }),
      serverPerf('data:getAlerts:blockedWorkOrders', async () => {
        const result = await supabase
          .from('work_orders')
          .select('id')
          .eq('org_id', orgId)
          .eq('status', 'BLOCKED')
        return result
      }),
      serverPerf('data:getAlerts:dataSources', async () => {
        const result = await supabase
          .from('data_sources')
          .select('name, last_sync_at, cadence')
          .eq('org_id', orgId)
        return result
      }),
    ])

    if (overdueInvoices && overdueInvoices.length > 0) {
      alerts.push({
        id: 'overdue-invoices',
        title: 'Overdue Invoices',
        description: `${overdueInvoices.length} invoice(s) are overdue`,
        severity: 'high' as const,
        count: overdueInvoices.length,
      })
    }

    if (overdueTasks && overdueTasks.length > 0) {
      alerts.push({
        id: 'overdue-tasks',
        title: 'Overdue Tasks',
        description: `${overdueTasks.length} task(s) are past due`,
        severity: 'medium' as const,
        count: overdueTasks.length,
      })
    }

    if (oldTickets && oldTickets.length > 0) {
      alerts.push({
        id: 'old-tickets',
        title: 'Stale Tickets',
        description: `${oldTickets.length} ticket(s) open for more than 7 days`,
        severity: 'medium' as const,
        count: oldTickets.length,
      })
    }

    if (blockedWorkOrders && blockedWorkOrders.length > 0) {
      alerts.push({
        id: 'blocked-work-orders',
        title: 'Blocked Work Orders',
        description: `${blockedWorkOrders.length} work order(s) are blocked`,
        severity: 'high' as const,
        count: blockedWorkOrders.length,
      })
    }

    const staleSources =
      dataSources?.filter((ds) => {
        if (!ds.last_sync_at) return true
        const lastSync = new Date(ds.last_sync_at)
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)
        const cadenceHours = ds.cadence ? parseInt(ds.cadence) : 24
        return hoursSinceSync > cadenceHours
      }) || []

    if (staleSources.length > 0) {
      alerts.push({
        id: 'stale-data',
        title: 'Stale Data Sources',
        description: `${staleSources.length} data source(s) are stale`,
        severity: 'low' as const,
        count: staleSources.length,
      })
    }

    return alerts
  })
}

export async function isDemoOrg() {
  return serverPerf('data:isDemoOrg', async () => {
    if (isDevDemoMode()) {
      return true
    }

    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) return false

    const { data: org } = await supabase.from('organizations').select('is_demo').eq('id', orgId).single()
    return org?.is_demo || false
  })
}

// Additional helper functions that pages might need
export async function getAccounts() {
  return serverPerf('data:getAccounts', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }
  
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

    return data || []
  })
}

export async function getOpportunities() {
  return serverPerf('data:getOpportunities', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }
  
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

  const { data } = await supabase
    .from('opportunities')
    .select('*, accounts(name)')
    .eq('org_id', orgId)
    .order('close_date')

    return data || []
  })
}

export async function getInvoices() {
  return serverPerf('data:getInvoices', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }
  
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

  const { data } = await supabase
    .from('invoices')
    .select('*, accounts(name), payments(*)')
    .eq('org_id', orgId)
    .order('issue_date', { ascending: false })

    return data || []
  })
}

export async function getWorkOrders() {
  return serverPerf('data:getWorkOrders', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }
  
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

  const { data } = await supabase
    .from('work_orders')
    .select('*, accounts(name)')
    .eq('org_id', orgId)
    .order('due_date')

    return data || []
  })
}

export async function getMetricCatalog() {
  return serverPerf('data:getMetricCatalog', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }
  
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

  const { data } = await supabase
    .from('metric_catalog')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

    return data || []
  })
}

export async function getOrgSettings() {
  return serverPerf('data:getOrgSettings', async () => {
    if (isDevDemoMode()) {
      throw new Error('Use dev demo adapter in dev demo mode')
    }
  
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) throw new Error('No org context')

  const { data } = await supabase
    .from('org_settings')
    .select('*')
    .eq('org_id', orgId)
    .single()

    return data || { roi_defaults: {}, alert_thresholds: {}, metadata: {} }
  })
}
