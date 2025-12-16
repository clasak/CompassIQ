'use server'

import { createClient } from './supabase/server'
import { getActiveOrgId } from './org'

export type Role = 'OWNER' | 'ADMIN' | 'SALES' | 'OPS' | 'FINANCE' | 'VIEWER'

export interface RoleCheckResult {
  role: Role | null
  isDemo: boolean
  canWrite: boolean
  canWriteSales: boolean
  canWriteOps: boolean
  canWriteFinance: boolean
  canWriteAdmin: boolean
}

/**
 * Get current user's role and permissions for the active org
 */
export async function getCurrentRole(): Promise<RoleCheckResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      role: null,
      isDemo: false,
      canWrite: false,
      canWriteSales: false,
      canWriteOps: false,
      canWriteFinance: false,
      canWriteAdmin: false,
    }
  }

  const orgId = await getActiveOrgId()
  if (!orgId) {
    return {
      role: null,
      isDemo: false,
      canWrite: false,
      canWriteSales: false,
      canWriteOps: false,
      canWriteFinance: false,
      canWriteAdmin: false,
    }
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role, organizations(is_demo)')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return {
      role: null,
      isDemo: false,
      canWrite: false,
      canWriteSales: false,
      canWriteOps: false,
      canWriteFinance: false,
      canWriteAdmin: false,
    }
  }

  const role = membership.role as Role
  const isDemo = (membership.organizations as any)?.is_demo || false

  // Demo org is always read-only
  if (isDemo) {
    return {
      role,
      isDemo: true,
      canWrite: false,
      canWriteSales: false,
      canWriteOps: false,
      canWriteFinance: false,
      canWriteAdmin: false,
    }
  }

  // Calculate permissions based on role
  const canWriteAdmin = ['OWNER', 'ADMIN'].includes(role)
  const canWriteSales = ['OWNER', 'ADMIN', 'SALES'].includes(role)
  const canWriteOps = ['OWNER', 'ADMIN', 'OPS'].includes(role)
  const canWriteFinance = ['OWNER', 'ADMIN', 'FINANCE'].includes(role)
  const canWrite = canWriteAdmin || canWriteSales || canWriteOps || canWriteFinance

  return {
    role,
    isDemo: false,
    canWrite,
    canWriteSales,
    canWriteOps,
    canWriteFinance,
    canWriteAdmin,
  }
}

/**
 * Check if user can perform a specific action type
 */
export async function canPerformAction(
  actionType: 'sales' | 'ops' | 'finance' | 'admin' | 'any'
): Promise<boolean> {
  const roleCheck = await getCurrentRole()
  if (roleCheck.isDemo) return false

  switch (actionType) {
    case 'sales':
      return roleCheck.canWriteSales
    case 'ops':
      return roleCheck.canWriteOps
    case 'finance':
      return roleCheck.canWriteFinance
    case 'admin':
      return roleCheck.canWriteAdmin
    case 'any':
      return roleCheck.canWrite
    default:
      return false
  }
}



