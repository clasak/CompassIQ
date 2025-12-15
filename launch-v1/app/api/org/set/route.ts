import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json()

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Verify user has access to this org
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 })
    }

    // Set the org cookie
    const cookieStore = await cookies()
    cookieStore.set('compass-org-id', orgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting org:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
