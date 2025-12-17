import { createClient } from './supabase/server'
import { getActiveOrgId } from './org'
import type { ROIDefaults } from './roi-calc'

export type { ROIDefaults } from './roi-calc'

/**
 * Get ROI defaults for active org
 */
export async function getROIDefaults(): Promise<ROIDefaults> {
  const { isDevDemoMode } = await import('./runtime')
  const { getOrgSettings } = await import('./data')
  
  if (isDevDemoMode()) {
    // In dev demo mode, get from localStorage (client-side) or return defaults
    const settings = await getOrgSettings()
    return (settings.roi_defaults as ROIDefaults) || {}
  }

  const orgId = await getActiveOrgId()
  if (!orgId) {
    return {}
  }

  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('org_settings')
    .select('roi_defaults')
    .eq('org_id', orgId)
    .single()

  return (settings?.roi_defaults as ROIDefaults) || {}
}

/**
 * Save ROI defaults for active org
 */
export async function saveROIDefaults(defaults: ROIDefaults): Promise<{ success: boolean; error?: string }> {
  try {
    const { isDevDemoMode, getReadOnlyMessage } = await import('./runtime')
    const { getReadOnlyMessage: getMsg } = await import('./data')
    
    if (isDevDemoMode()) {
      // In dev demo mode, save to localStorage (handled client-side)
      // This function is called from server action, so we'll handle it there
      return { success: false, error: getMsg() }
    }

    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    
    // Upsert settings
    const { error } = await supabase
      .from('org_settings')
      .upsert(
        {
          org_id: orgId,
          roi_defaults: defaults,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'org_id',
        }
      )

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save ROI defaults' }
  }
}

/**
 * Get live KPIs for ROI defaults population
 */
export async function getLiveKPIsForROI(): Promise<{
  averageDealSize?: number
  winRate?: number
  averageSalesCycleDays?: number
  averageARDays?: number
}> {
  const orgId = await getActiveOrgId()
  if (!orgId) {
    return {}
  }

  const supabase = await createClient()

  // Get average deal size from won opportunities
  const { data: wonOpportunities } = await supabase
    .from('opportunities')
    .select('amount, stage, close_date, created_at')
    .eq('org_id', orgId)
    .eq('stage', 'WON')

  const averageDealSize =
    wonOpportunities && wonOpportunities.length > 0
      ? wonOpportunities.reduce((sum, opp) => sum + Number(opp.amount || 0), 0) / wonOpportunities.length
      : undefined

  // Get win rate (won / (won + lost))
  const { data: allOpportunities } = await supabase
    .from('opportunities')
    .select('stage')
    .eq('org_id', orgId)
    .in('stage', ['WON', 'LOST'])

  const won = allOpportunities?.filter((o) => o.stage === 'WON').length || 0
  const total = allOpportunities?.length || 0
  const winRate = total > 0 ? (won / total) * 100 : undefined

  // Get average sales cycle (close_date - created_at for won deals)
  let averageSalesCycleDays: number | undefined
  if (wonOpportunities && wonOpportunities.length > 0) {
    const cycles = wonOpportunities
      .filter((opp) => opp.close_date && opp.created_at)
      .map((opp) => {
        const created = new Date(opp.created_at).getTime()
        const closed = new Date(opp.close_date).getTime()
        return Math.max(0, (closed - created) / (1000 * 60 * 60 * 24))
      })
      .filter((days) => days > 0)

    if (cycles.length > 0) {
      averageSalesCycleDays = cycles.reduce((sum, days) => sum + days, 0) / cycles.length
    }
  }

  // Get average AR days (simplified: based on invoice dates and payments)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, issue_date, due_date, status, total')
    .eq('org_id', orgId)
    .in('status', ['SENT', 'OVERDUE', 'PAID'])

  const { data: payments } = await supabase
    .from('payments')
    .select('paid_at, invoice_id, amount')
    .eq('org_id', orgId)

  let averageARDays: number | undefined
  if (invoices && payments) {
    const arDays = invoices
      .map((inv) => {
        const payment = payments.find((p) => p.invoice_id === inv.id)
        if (payment && payment.paid_at && inv.issue_date) {
          const issueDate = new Date(inv.issue_date).getTime()
          const paidDate = new Date(payment.paid_at).getTime()
          return Math.max(0, (paidDate - issueDate) / (1000 * 60 * 60 * 24))
        }
        // For unpaid invoices, use days since issue
        if (inv.status !== 'PAID' && inv.issue_date) {
          const issueDate = new Date(inv.issue_date).getTime()
          const now = Date.now()
          return Math.max(0, (now - issueDate) / (1000 * 60 * 60 * 24))
        }
        return null
      })
      .filter((days): days is number => days !== null)

    if (arDays.length > 0) {
      averageARDays = arDays.reduce((sum, days) => sum + days, 0) / arDays.length
    }
  }

  return {
    averageDealSize: averageDealSize ? Math.round(averageDealSize) : undefined,
    winRate: winRate ? Math.round(winRate * 10) / 10 : undefined,
    averageSalesCycleDays: averageSalesCycleDays ? Math.round(averageSalesCycleDays) : undefined,
    averageARDays: averageARDays ? Math.round(averageARDays) : undefined,
  }
}



