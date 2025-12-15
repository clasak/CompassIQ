import { cookies } from 'next/headers'
import { createClient, getServerUser } from './supabase/server'
import { serverPerf } from './perf'
import { cache } from 'react'

const ORG_COOKIE_NAME = 'compass-org-id'

export async function getActiveOrgId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ORG_COOKIE_NAME)?.value || null
}

export async function setActiveOrgId(orgId: string) {
  const cookieStore = await cookies()
  cookieStore.set(ORG_COOKIE_NAME, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
}

export async function clearActiveOrgId() {
  const cookieStore = await cookies()
  cookieStore.delete(ORG_COOKIE_NAME)
}

/**
 * Get active org ID, or try to get user's first org membership
 * Returns null if user has no memberships
 */
async function _getActiveOrgIdOrFirst(): Promise<string | null> {
  const activeOrgId = await getActiveOrgId()
  const supabase = await serverPerf('org:getActiveOrgIdOrFirst:createClient', createClient)
  const user = await serverPerf('org:getActiveOrgIdOrFirst:getServerUser', getServerUser)

  if (!user) {
    return null
  }

  // If cookie exists, verify it's a valid membership for this user.
  if (activeOrgId) {
    const result = await serverPerf('org:getActiveOrgIdOrFirst:verifyCookieMembership', async () => {
      const { data } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('org_id', activeOrgId)
        .maybeSingle()
      return { data }
    })
    const { data: membershipForCookie } = result as { data: any }

    if (membershipForCookie?.org_id) {
      return activeOrgId
    }
  }

  // Otherwise, fall back to the user's first membership deterministically.
  const result = await serverPerf('org:getActiveOrgIdOrFirst:firstMembership', async () => {
    const { data } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    return { data }
  })
  const { data: membership } = result as { data: any }

  if (membership) {
    await setActiveOrgId(membership.org_id)
    return membership.org_id
  }

  return null
}

/**
 * Check if user has any org memberships
 */
async function _hasAnyMemberships(): Promise<boolean> {
  const supabase = await serverPerf('org:hasAnyMemberships:createClient', createClient)
  const user = await serverPerf('org:hasAnyMemberships:getServerUser', getServerUser)

  if (!user) {
    return false
  }

  const result = await serverPerf('org:hasAnyMemberships:query', async () => {
    const { data } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
    return { data }
  })
  const { data: memberships } = result as { data: any[] | null }

  return (memberships?.length || 0) > 0
}

export const getActiveOrgIdOrFirst = cache(_getActiveOrgIdOrFirst)
export const hasAnyMemberships = cache(_hasAnyMemberships)

// Legacy alias for backward compatibility
export const getOrgId = getActiveOrgId
export const setOrgId = setActiveOrgId
export const clearOrgId = clearActiveOrgId
