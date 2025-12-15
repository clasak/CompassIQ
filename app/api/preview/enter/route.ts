import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/org'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const previewId = searchParams.get('id')

    if (!previewId) {
      return NextResponse.json({ error: 'Preview ID required' }, { status: 400 })
    }

    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify preview workspace exists and belongs to user's org
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 })
    }

    const { data: workspace, error } = await supabase
      .from('preview_workspaces')
      .select('id, org_id')
      .eq('id', previewId)
      .eq('org_id', orgId)
      .single()

    if (error || !workspace) {
      return NextResponse.json({ error: 'Preview workspace not found' }, { status: 404 })
    }

    // Set preview cookie in response
    const response = NextResponse.redirect(new URL('/app', request.url))
    response.cookies.set('preview-workspace-id', previewId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/app',
    })

    return response
  } catch (error: any) {
    console.error('Preview enter error:', error)
    return NextResponse.json({ error: error.message || 'Failed to enter preview' }, { status: 500 })
  }
}

