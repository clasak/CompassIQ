import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ORG_COOKIE_NAME = 'compass-org-id'

export async function POST(request: Request) {
  try {
    const { session } = await request.json()
    if (
      !session ||
      typeof session.access_token !== 'string' ||
      typeof session.refresh_token !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Session payload missing' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase env not configured' },
        { status: 500 }
      )
    }

    const requestCookies = cookies()
    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return requestCookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    })

    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // Set active org cookie based on the user's memberships (best effort)
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const userId: string | undefined = session?.user?.id

      if (serviceRoleKey && userId) {
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)
        const { data: membership } = await adminClient
          .from('memberships')
          .select('org_id, organizations(slug)')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (membership?.org_id) {
          response.cookies.set(ORG_COOKIE_NAME, membership.org_id, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
          })
        }
      }
    } catch {
      // Non-fatal; session is still established even if org cookie fails
    }

    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 400 }
    )
  }
}
