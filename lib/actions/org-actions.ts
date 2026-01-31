'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrgIdOrFirst, setActiveOrgId } from '@/lib/org'
import { revalidatePath } from 'next/cache'
import { isDevDemoMode, getDevDemoRole, getDevDemoOrg } from '@/lib/runtime'

export interface CreateOrgResult {
  success: boolean
  orgId?: string
  error?: string
}

export async function createOrganization(name: string, slug: string): Promise<CreateOrgResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { data, error } = await supabase.rpc('create_organization_with_owner', {
      p_name: name,
      p_slug: slug,
    })

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: 'An organization with this slug already exists. Please choose a different slug.',
        }
      }
      return {
        success: false,
        error: error.message || 'Failed to create organization',
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'No organization ID returned',
      }
    }

    await setActiveOrgId(data)

    revalidatePath('/app')
    return {
      success: true,
      orgId: data,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    }
  }
}

export async function switchOrganization(orgId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return {
        success: false,
        error: 'You are not a member of this organization',
      }
    }

    await setActiveOrgId(orgId)
    revalidatePath('/app')
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to switch organization',
    }
  }
}

export async function getActiveOrgIdForClient(): Promise<{ orgId: string | null; error?: string }> {
  try {
    const orgId = await getActiveOrgIdOrFirst()
    return { orgId }
  } catch (err: any) {
    return { orgId: null, error: err?.message || 'Failed to resolve active org' }
  }
}

export async function getCurrentUserRole(): Promise<{
  role: string | null
  isDemo: boolean
  error?: string
}> {
  if (isDevDemoMode()) {
    const demoRole = getDevDemoRole()
    const demoOrg = getDevDemoOrg()
    return {
      role: demoRole,
      isDemo: demoOrg.is_demo,
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        role: null,
        isDemo: false,
        error: 'Not authenticated',
      }
    }

    const orgId = await getActiveOrgIdOrFirst()

    if (!orgId) {
      return {
        role: null,
        isDemo: false,
        error: 'No active organization',
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
        error: 'Not a member of this organization',
      }
    }

    const isDemo = (membership.organizations as any)?.is_demo || false

    return {
      role: membership.role,
      isDemo,
    }
  } catch (err: any) {
    return {
      role: null,
      isDemo: false,
      error: err.message || 'Failed to get user role',
    }
  }
}

