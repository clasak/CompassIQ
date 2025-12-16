/**
 * Data Adapter Selector
 * Automatically chooses between Supabase and Dev Demo adapters
 */

import { isDevDemoMode } from '../runtime'
import * as devDemo from './devDemo'
import * as supabase from './supabase'
import type { KPIData, KPIMetric } from './devDemo'

// Helper to normalize flat KPI format to KPIData format
function normalizeKPIs(flatKPIs: any): KPIData {
  const now = new Date()
  const createMetric = (value: number, previousValue?: number): KPIMetric => ({
    value,
    previousValue,
    trend: previousValue !== undefined && previousValue > 0 
      ? ((value - previousValue) / previousValue) * 100 
      : undefined,
    historicalData: undefined, // Can be populated later if needed
    lastUpdated: now,
  })

  return {
    revenueMTD: createMetric(flatKPIs.revenueMTD || 0),
    pipeline30: createMetric(flatKPIs.pipeline30 || 0),
    pipeline60: createMetric(flatKPIs.pipeline60 || 0),
    pipeline90: createMetric(flatKPIs.pipeline90 || 0),
    arOutstanding: createMetric(flatKPIs.arOutstanding || 0),
    onTimeDelivery: createMetric(flatKPIs.onTimeDelivery || 0),
    churnRisk: createMetric(flatKPIs.churnRisk || 0),
  }
}

// KPI and Alert functions
export async function getKPIs(startDate?: Date, endDate?: Date): Promise<KPIData> {
  if (isDevDemoMode()) {
    return devDemo.getKPIs()
  }
  const flatKPIs = await supabase.getKPIs(startDate, endDate)
  return normalizeKPIs(flatKPIs)
}

export async function getAlerts() {
  if (isDevDemoMode()) {
    return devDemo.getAlerts()
  }
  return supabase.getAlerts()
}

export async function isDemoOrg() {
  if (isDevDemoMode()) {
    return true // Dev demo mode is always demo
  }
  return supabase.isDemoOrg()
}

// Data retrieval functions
export async function getAccounts() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoAccounts()
  }
  return supabase.getAccounts()
}

export async function getOpportunities() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoOpportunities()
  }
  return supabase.getOpportunities()
}

export async function getInvoices() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoInvoices()
  }
  return supabase.getInvoices()
}

export async function getWorkOrders() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoWorkOrders()
  }
  return supabase.getWorkOrders()
}

export async function getMetricCatalog() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoMetricCatalog()
  }
  return supabase.getMetricCatalog()
}

export async function getOrgSettings() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoOrgSettings()
  }
  return supabase.getOrgSettings()
}

export async function getPayments() {
  if (isDevDemoMode()) {
    return devDemo.getDevDemoPayments()
  }
  // In Supabase mode, payments are included with invoices
  return []
}

// Helper to check if we can write
export function canWrite(): boolean {
  if (isDevDemoMode()) {
    return false // Dev demo mode is always read-only
  }
  return true // In Supabase mode, permissions are checked by RLS
}

// Helper to show read-only message
export function getReadOnlyMessage(): string {
  if (isDevDemoMode()) {
    return 'Dev Demo Mode is read-only.'
  }
  return 'Demo organization is read-only.'
}


