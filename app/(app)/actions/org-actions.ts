'use server'

import { createClient } from '@/lib/supabase/server'
import { setActiveOrgId } from '@/lib/org'
import { revalidatePath } from 'next/cache'
import { isDevDemoMode, getDevDemoRole, getDevDemoOrg } from '@/lib/runtime'

export interface CreateOrgResult {
  success: boolean
  orgId?: string
  error?: string
}

/**
 * Create a new organization using the RPC function
 */
export async function createOrganization(
  name: string,
  slug: string
): Promise<CreateOrgResult> {
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

    // Call the RPC function
    const { data, error } = await supabase.rpc('create_organization_with_owner', {
      p_name: name,
      p_slug: slug,
    })

    if (error) {
      // Handle specific error codes
      if (error.code === '23505') {
        return {
          success: false,
          error: 'An organization with this slug already exists. Please choose a different slug.',
        }
      }
      if (error.code === 'P0001') {
        return {
          success: false,
          error: error.message || 'Failed to create organization',
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

    // Set active org cookie
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

/**
 * Switch active organization
 */
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

    // Verify user is a member of this org
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

/**
 * Get user's role in the active organization
 */
export async function getCurrentUserRole(): Promise<{
  role: string | null
  isDemo: boolean
  error?: string
}> {
  // Dev demo mode: return demo role
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

    const { getActiveOrgId } = await import('@/lib/org')
    const orgId = await getActiveOrgId()

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
