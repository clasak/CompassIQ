/**
 * Dev Demo Mode Data Adapter
 * Returns mock data from dev-demo.json
 */

import demoData from '../../data/dev-demo.json'
import { isDevDemoMode } from '../runtime'

export async function getKPIs() {
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

  return {
    revenueMTD,
    pipeline30,
    pipeline60,
    pipeline90,
    arOutstanding,
    onTimeDelivery,
    churnRisk,
  }
}

export async function getAlerts() {
  if (!isDevDemoMode()) {
    throw new Error('Not in dev demo mode')
  }

  const alerts = []

  // Overdue invoices
  const overdueInvoices = demoData.invoices.filter(inv => inv.status === 'OVERDUE')
  if (overdueInvoices.length > 0) {
    alerts.push({
      id: 'overdue-invoices',
      title: 'Overdue Invoices',
      description: `${overdueInvoices.length} invoice(s) are overdue`,
      severity: 'high' as const,
      count: overdueInvoices.length,
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

