'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/org'
import { requireOrgContext, requireAdmin } from '@/lib/org-context'
import { revalidatePath } from 'next/cache'
import { normalizeError } from '@/lib/errors'

export interface UpdateOrgNameResult {
  success: boolean
  error?: string
}

export async function updateOrgName(name: string): Promise<UpdateOrgNameResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return {
        success: false,
        error: 'Demo organization cannot be modified',
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('organizations').update({ name }).eq('id', context.orgId)

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    revalidatePath('/app/settings/org')
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to update organization name',
    }
  }
}

export interface MemberInfo {
  user_id: string
  email: string | null
  role: string
  created_at: string
}

export async function getOrgMembers(): Promise<{
  success: boolean
  members?: MemberInfo[]
  error?: string
}> {
  try {
    const context = await requireOrgContext()
    const supabase = await createClient()

    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('user_id, role, created_at')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    const members: MemberInfo[] = []
    for (const m of memberships || []) {
      members.push({
        user_id: m.user_id,
        email: null,
        role: m.role,
        created_at: m.created_at,
      })
    }

    return {
      success: true,
      members,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to get members',
    }
  }
}

export interface UpdateMemberRoleResult {
  success: boolean
  error?: string
}

export async function updateMemberRole(userId: string, role: string): Promise<UpdateMemberRoleResult> {
  try {
    await requireAdmin()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return {
        success: false,
        error: 'No organization context',
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc('update_member_role', {
      p_org_id: orgId,
      p_user_id: userId,
      p_role: role,
    })

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    revalidatePath('/app/settings/users')
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to update member role',
    }
  }
}

export interface RemoveMemberResult {
  success: boolean
  error?: string
}

export async function removeMember(userId: string): Promise<RemoveMemberResult> {
  try {
    await requireAdmin()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return {
        success: false,
        error: 'No organization context',
      }
    }

    const supabase = await createClient()
    const { data: ownerMemberships } = await supabase.from('memberships').select('role').eq('org_id', orgId).eq('role', 'OWNER')

    const { data: targetMembership } = await supabase
      .from('memberships')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single()

    if (targetMembership?.role === 'OWNER' && (ownerMemberships?.length || 0) <= 1) {
      return {
        success: false,
        error: 'Cannot remove the last OWNER from the organization',
      }
    }

    const { error } = await supabase.from('memberships').delete().eq('org_id', orgId).eq('user_id', userId)

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    revalidatePath('/app/settings/users')
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to remove member',
    }
  }
}

export interface CreateInviteResult {
  success: boolean
  inviteId?: string
  token?: string
  error?: string
}

export async function createInvite(email: string, role: string): Promise<CreateInviteResult> {
  try {
    await requireAdmin()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return {
        success: false,
        error: 'No organization context',
      }
    }

    const supabase = await createClient()
    const { data: inviteId, error: createError } = await supabase.rpc('create_invite', {
      p_org_id: orgId,
      p_email: email,
      p_role: role,
    })

    if (createError) {
      return {
        success: false,
        error: normalizeError(createError),
      }
    }

    const { data: invite, error: fetchError } = await supabase
      .from('org_invites')
      .select('token')
      .eq('id', inviteId)
      .single()

    if (fetchError || !invite) {
      return {
        success: false,
        error: 'Failed to retrieve invite token',
      }
    }

    revalidatePath('/app/settings/invites')
    return {
      success: true,
      inviteId,
      token: invite.token,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to create invite',
    }
  }
}

export interface InviteInfo {
  id: string
  email: string
  role: string
  token: string
  created_at: string
  accepted_at: string | null
  expires_at: string
  created_by: string | null
}

export async function getOrgInvites(): Promise<{
  success: boolean
  invites?: InviteInfo[]
  error?: string
}> {
  try {
    const context = await requireOrgContext()
    const supabase = await createClient()

    const { data: invites, error } = await supabase
      .from('org_invites')
      .select('id, email, role, token, created_at, accepted_at, expires_at, created_by')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    return {
      success: true,
      invites: invites || [],
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to get invites',
    }
  }
}

export interface RevokeInviteResult {
  success: boolean
  error?: string
}

export async function revokeInvite(inviteId: string): Promise<RevokeInviteResult> {
  try {
    await requireAdmin()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return {
        success: false,
        error: 'No organization context',
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('org_invites').delete().eq('id', inviteId).eq('org_id', orgId)

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    revalidatePath('/app/settings/invites')
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to revoke invite',
    }
  }
}

export interface AcceptInviteResult {
  success: boolean
  orgId?: string
  error?: string
}

export async function acceptInvite(token: string): Promise<AcceptInviteResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to accept an invitation',
      }
    }

    const { data: orgId, error } = await supabase.rpc('accept_invite', {
      p_token: token,
    })

    if (error) {
      return {
        success: false,
        error: normalizeError(error),
      }
    }

    if (!orgId) {
      return {
        success: false,
        error: 'Invalid invitation token',
      }
    }

    const { setActiveOrgId } = await import('@/lib/org')
    await setActiveOrgId(orgId)

    revalidatePath('/app')
    return {
      success: true,
      orgId,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to accept invitation',
    }
  }
}

