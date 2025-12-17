'use server'

import { createClient, getServerUser } from './supabase/server'
import { getActiveOrgIdOrFirst } from './org'
import { isDevDemoMode, getDevDemoUser, getDevDemoOrg, getDevDemoRole } from './runtime'
import { serverPerf } from './perf'
import { cache } from 'react'

export interface OrgContext {
  orgId: string
  orgName: string
  orgSlug: string
  isDemo: boolean
  role: 'OWNER' | 'ADMIN' | 'SALES' | 'OPS' | 'FINANCE' | 'VIEWER' | null
  isAdmin: boolean
  canWrite: boolean
  canWriteSales: boolean
  canWriteOps: boolean
  canWriteFinance: boolean
  canWriteAdmin: boolean
}

/**
 * Get complete org context including org details, user role, and permissions
 * This is the centralized function for permission gating
 */
async function _getOrgContext(): Promise<OrgContext | null> {
  // Dev demo mode: return fake context
  if (isDevDemoMode()) {
    const demoOrg = getDevDemoOrg()
    const demoRole = getDevDemoRole()
    const isAdmin = ['OWNER', 'ADMIN'].includes(demoRole || '')
    
    return {
      orgId: demoOrg.id,
      orgName: demoOrg.name,
      orgSlug: demoOrg.slug,
      isDemo: true,
      role: demoRole,
      isAdmin,
      canWrite: false, // Dev demo is always read-only
      canWriteSales: false,
      canWriteOps: false,
      canWriteFinance: false,
      canWriteAdmin: false,
    }
  }

  // Real Supabase mode
  const supabase = await serverPerf('orgContext:createClient', createClient)
  const user = await serverPerf('orgContext:getServerUser', getServerUser)

  if (!user) {
    return null
  }

  const orgId = await serverPerf('orgContext:getActiveOrgIdOrFirst', getActiveOrgIdOrFirst)
  if (!orgId) {
    return null
  }

  // Get org details and membership
  const result = await serverPerf('orgContext:membership', async () => {
    const { data } = await supabase
      .from('memberships')
      .select('role, organizations(id, name, slug, is_demo)')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single()
    return { data }
  })
  const { data: membership } = result as { data: any }

  if (!membership) {
    return null
  }

  const org = membership.organizations as any
  const role = membership.role as OrgContext['role']
  const isDemo = org?.is_demo || false

  // Calculate permissions (demo org is always read-only)
  const isAdmin = ['OWNER', 'ADMIN'].includes(role || '')
  const canWriteAdmin = !isDemo && isAdmin
  const canWriteSales = !isDemo && ['OWNER', 'ADMIN', 'SALES'].includes(role || '')
  const canWriteOps = !isDemo && ['OWNER', 'ADMIN', 'OPS'].includes(role || '')
  const canWriteFinance = !isDemo && ['OWNER', 'ADMIN', 'FINANCE'].includes(role || '')
  const canWrite = canWriteAdmin || canWriteSales || canWriteOps || canWriteFinance

  return {
    orgId,
    orgName: org?.name || '',
    orgSlug: org?.slug || '',
    isDemo,
    role,
    isAdmin,
    canWrite,
    canWriteSales,
    canWriteOps,
    canWriteFinance,
    canWriteAdmin,
  }
}

export const getOrgContext = cache(_getOrgContext)

/**
 * Require org context or throw error
 */
export async function requireOrgContext(): Promise<OrgContext> {
  const context = await getOrgContext()
  if (!context) {
    throw new Error('No organization context')
  }
  return context
}

/**
 * Require admin role or throw error
 */
export async function requireAdmin(): Promise<OrgContext> {
  const context = await requireOrgContext()
  if (!context.canWriteAdmin) {
    throw new Error('Insufficient permissions: OWNER or ADMIN required')
  }
  return context
}




