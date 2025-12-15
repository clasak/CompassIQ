import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const previewId = searchParams.get('id')
    const redirect = searchParams.get('redirect') || '/app'

    if (!previewId) {
      return NextResponse.redirect(new URL(redirect, request.url))
    }

    const supabase = await createServerSupabaseClient()

    // Verify preview workspace exists and user has access
    const { data: preview } = await supabase
      .from('preview_workspaces')
      .select('id, org_id, name')
      .eq('id', previewId)
      .single()

    if (!preview) {
      return NextResponse.redirect(new URL(redirect, request.url))
    }

    // Set the preview cookie
    const cookieStore = await cookies()
    cookieStore.set('compass-preview-id', previewId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.redirect(new URL(redirect, request.url))
  } catch (error) {
    console.error('Error entering preview:', error)
    return NextResponse.redirect(new URL('/app', request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const { previewId } = await request.json()

    if (!previewId) {
      return NextResponse.json({ error: 'Preview ID required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Verify preview workspace exists
    const { data: preview } = await supabase
      .from('preview_workspaces')
      .select('id, name')
      .eq('id', previewId)
      .single()

    if (!preview) {
      return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
    }

    // Set the preview cookie
    const cookieStore = await cookies()
    cookieStore.set('compass-preview-id', previewId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({ success: true, preview })
  } catch (error) {
    console.error('Error entering preview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
