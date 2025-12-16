/**
 * Dev Demo Mode Data Adapter
 * Returns mock data from dev-demo.json
 */

import demoData from '../../data/dev-demo.json'
import { isDevDemoMode } from '../runtime'

export interface KPIMetric {
  value: number
  previousValue?: number
  trend?: number
  historicalData?: number[]
  lastUpdated?: Date | string
}

export interface KPIData {
  revenueMTD: KPIMetric
  pipeline30: KPIMetric
  pipeline60: KPIMetric
  pipeline90: KPIMetric
  arOutstanding: KPIMetric
  onTimeDelivery: KPIMetric
  churnRisk: KPIMetric
}

// Generate mock historical data (last 12 points with some variance)
function generateHistoricalData(baseValue: number, points = 12): number[] {
  const data: number[] = []
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 0.1 // ±5% variance
    data.push(Math.max(0, baseValue * (1 + variance)))
  }
  return data
}

export async function getKPIs(): Promise<KPIData> {
  if (!isDevDemoMode()) {
    throw new Error('Not in dev demo mode')
  }

  // Calculate from mock data
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = new Date()
  
  // Revenue MTD
  const revenueMTD = demoData.invoices
    .filter(inv => ['SENT', 'PAID', 'OVERDUE'].includes(inv.status))
    .filter(inv => {
      const issueDate = new Date(inv.issue_date)
      return issueDate >= startDate && issueDate <= endDate
    })
    .reduce((sum, inv) => sum + (inv.total || 0), 0)
  
  // Previous period (last month)
  const prevStartDate = new Date(startDate)
  prevStartDate.setMonth(prevStartDate.getMonth() - 1)
  const prevEndDate = new Date(startDate)
  prevEndDate.setDate(prevEndDate.getDate() - 1)
  
  const revenueMTDPrev = demoData.invoices
    .filter(inv => ['SENT', 'PAID', 'OVERDUE'].includes(inv.status))
    .filter(inv => {
      const issueDate = new Date(inv.issue_date)
      return issueDate >= prevStartDate && issueDate <= prevEndDate
    })
    .reduce((sum, inv) => sum + (inv.total || 0), 0)
  
  const revenueTrend = revenueMTDPrev > 0 ? ((revenueMTD - revenueMTDPrev) / revenueMTDPrev) * 100 : 0

  // Pipeline
  const now = new Date()
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const pipeline30 = demoData.opportunities
    .filter(opp => !['WON', 'LOST'].includes(opp.stage))
    .filter(opp => new Date(opp.close_date) <= day30)
    .reduce((sum, opp) => sum + (opp.amount || 0), 0)
  
  const pipeline60 = demoData.opportunities
    .filter(opp => !['WON', 'LOST'].includes(opp.stage))
    .filter(opp => new Date(opp.close_date) <= day60)
    .reduce((sum, opp) => sum + (opp.amount || 0), 0)

  const pipeline90 = demoData.opportunities
    .filter(opp => !['WON', 'LOST'].includes(opp.stage))
    .filter(opp => new Date(opp.close_date) <= day90)
    .reduce((sum, opp) => sum + (opp.amount || 0), 0)
  
  // Mock previous period pipeline (simplified - use 90% of current)
  const pipeline30Prev = pipeline30 * 0.9
  const pipeline60Prev = pipeline60 * 0.9
  const pipeline90Prev = pipeline90 * 0.9
  const pipeline30Trend = pipeline30Prev > 0 ? ((pipeline30 - pipeline30Prev) / pipeline30Prev) * 100 : 0
  const pipeline60Trend = pipeline60Prev > 0 ? ((pipeline60 - pipeline60Prev) / pipeline60Prev) * 100 : 0
  const pipeline90Trend = pipeline90Prev > 0 ? ((pipeline90 - pipeline90Prev) / pipeline90Prev) * 100 : 0

  // AR Outstanding
  const invoiceTotals = new Map<string, number>()
  demoData.invoices.forEach(inv => {
    invoiceTotals.set(inv.id, inv.total || 0)
  })

  const paymentTotals = new Map<string, number>()
  demoData.payments.forEach(pay => {
    const current = paymentTotals.get(pay.invoice_id) || 0
    paymentTotals.set(pay.invoice_id, current + (pay.amount || 0))
  })

  let arOutstanding = 0
  invoiceTotals.forEach((total, invoiceId) => {
    const paid = paymentTotals.get(invoiceId) || 0
    if (total > paid) {
      arOutstanding += total - paid
    }
  })

  // On-Time Delivery
  const workOrders = demoData.work_orders.filter(wo => wo.status === 'DONE')
  const onTime = workOrders.filter(wo => {
    if (!wo.completed_at || !wo.due_date) return false
    return new Date(wo.completed_at) <= new Date(wo.due_date)
  }).length
  const onTimeDelivery = workOrders.length > 0 ? onTime / workOrders.length : 0
  const onTimeDeliveryPrev = Math.max(0, Math.min(1, onTimeDelivery - 0.02)) // Mock 2% lower
  const onTimeTrend = onTimeDeliveryPrev > 0 ? ((onTimeDelivery - onTimeDeliveryPrev) / onTimeDeliveryPrev) * 100 : 0

  // Churn Risk
  const renewalThreshold = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const overdueAccountIds = new Set(
    demoData.invoices
      .filter(inv => inv.status === 'OVERDUE')
      .map(inv => inv.account_id)
  )

  const churnRisk = demoData.accounts.filter(acc => {
    if (acc.renewal_date && new Date(acc.renewal_date) <= renewalThreshold) {
      const health = acc.health_override !== null ? acc.health_override : 50
      return health < 50 || overdueAccountIds.has(acc.id)
    }
    return false
  }).length
  const churnRiskPrev = Math.max(0, churnRisk - 1) // Mock one less
  const churnTrend = churnRiskPrev > 0 ? ((churnRisk - churnRiskPrev) / churnRiskPrev) * 100 : (churnRisk > 0 ? 100 : 0)

  // AR Outstanding previous period
  const arOutstandingPrev = arOutstanding * 1.05 // Mock 5% higher (better if decreasing)
  const arTrend = arOutstandingPrev > 0 ? ((arOutstanding - arOutstandingPrev) / arOutstandingPrev) * 100 : 0

  const nowDate = new Date()

  return {
    revenueMTD: {
      value: revenueMTD,
      previousValue: revenueMTDPrev,
      trend: revenueTrend,
      historicalData: generateHistoricalData(revenueMTD),
      lastUpdated: nowDate,
    },
    pipeline30: {
      value: pipeline30,
      previousValue: pipeline30Prev,
      trend: pipeline30Trend,
      historicalData: generateHistoricalData(pipeline30),
      lastUpdated: nowDate,
    },
    pipeline60: {
      value: pipeline60,
      previousValue: pipeline60Prev,
      trend: pipeline60Trend,
      historicalData: generateHistoricalData(pipeline60),
      lastUpdated: nowDate,
    },
    pipeline90: {
      value: pipeline90,
      previousValue: pipeline90Prev,
      trend: pipeline90Trend,
      historicalData: generateHistoricalData(pipeline90),
      lastUpdated: nowDate,
    },
    arOutstanding: {
      value: arOutstanding,
      previousValue: arOutstandingPrev,
      trend: arTrend,
      historicalData: generateHistoricalData(arOutstanding),
      lastUpdated: nowDate,
    },
    onTimeDelivery: {
      value: onTimeDelivery,
      previousValue: onTimeDeliveryPrev,
      trend: onTimeTrend,
      historicalData: generateHistoricalData(onTimeDelivery),
      lastUpdated: nowDate,
    },
    churnRisk: {
      value: churnRisk,
      previousValue: churnRiskPrev,
      trend: churnTrend,
      historicalData: generateHistoricalData(churnRisk),
      lastUpdated: nowDate,
    },
  }
}

export async function getAlerts() {
  if (!isDevDemoMode()) {
    throw new Error('Not in dev demo mode')
  }

  const alerts = []
  const now = new Date()
  const lastEvaluated = new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes ago

  // Overdue invoices
  const overdueInvoices = demoData.invoices.filter(inv => inv.status === 'OVERDUE')
  if (overdueInvoices.length > 0) {
    alerts.push({
      id: 'overdue-invoices',
      title: 'Overdue Invoices',
      description: `${overdueInvoices.length} invoice(s) are overdue`,
      severity: 'high' as const,
      count: overdueInvoices.length,
      route: '/app/finance',
      filter: 'overdue',
      lastEvaluated,
      actions: [
        {
          label: 'Export CSV',
          onClick: () => {
            // In real implementation, trigger CSV export
            console.log('Export overdue invoices CSV')
          },
        },
      ],
    })
  }

  // Overdue tasks
  const today = new Date().toISOString().split('T')[0]
  const overdueTasks = demoData.tasks.filter(
    task => ['OPEN', 'IN_PROGRESS'].includes(task.status) && task.due_date < today
  )
  if (overdueTasks.length > 0) {
    alerts.push({
      id: 'overdue-tasks',
      title: 'Overdue Tasks',
      description: `${overdueTasks.length} task(s) are past due`,
      severity: 'medium' as const,
      count: overdueTasks.length,
      route: '/app/actions',
      filter: 'overdue',
      lastEvaluated,
    })
  }

  // Blocked work orders
  const blockedWorkOrders = demoData.work_orders.filter(wo => wo.status === 'BLOCKED')
  if (blockedWorkOrders.length > 0) {
    alerts.push({
      id: 'blocked-work-orders',
      title: 'Blocked Work Orders',
      description: `${blockedWorkOrders.length} work order(s) are blocked`,
      severity: 'high' as const,
      count: blockedWorkOrders.length,
      route: '/app/ops',
      filter: 'blocked',
      lastEvaluated,
    })
  }

  // Stale tickets (example)
  const staleThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days
  const staleTickets = demoData.tickets.filter(
    ticket => ticket.status === 'OPEN' && new Date(ticket.opened_at) < staleThreshold
  )
  if (staleTickets.length > 0) {
    alerts.push({
      id: 'stale-tickets',
      title: 'Stale Tickets',
      description: `${staleTickets.length} ticket(s) open for more than 7 days`,
      severity: 'medium' as const,
      count: staleTickets.length,
      route: '/app/success',
      filter: 'stale',
      lastEvaluated,
    })
  }

  return alerts
}

export function getDevDemoData() {
  return demoData
}

export function getDevDemoAccounts() {
  return demoData.accounts
}

export function getDevDemoOpportunities() {
  return demoData.opportunities
}

export function getDevDemoInvoices() {
  return demoData.invoices.map(inv => ({
    ...inv,
    accounts: { name: demoData.accounts.find(a => a.id === inv.account_id)?.name || 'Unknown' },
    payments: demoData.payments.filter(p => p.invoice_id === inv.id),
  }))
}

export function getDevDemoWorkOrders() {
  return demoData.work_orders.map(wo => ({
    ...wo,
    accounts: { name: demoData.accounts.find(a => a.id === wo.account_id)?.name || 'Unknown' },
  }))
}

export function getDevDemoMetricCatalog() {
  return demoData.metric_catalog
}

export function getDevDemoOrgSettings() {
  return demoData.org_settings
}

export function getDevDemoPayments() {
  return demoData.payments
}


