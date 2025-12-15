/**
 * Data Adapter Selector
 * Automatically chooses between Supabase and Dev Demo adapters
 */

import { isDevDemoMode } from '../runtime'
import * as devDemo from './devDemo'
import * as supabase from './supabase'

// KPI and Alert functions
export async function getKPIs(startDate?: Date, endDate?: Date) {
  if (isDevDemoMode()) {
    return devDemo.getKPIs()
  }
  return supabase.getKPIs(startDate, endDate)
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


