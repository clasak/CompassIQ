import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Check if dev demo mode (must match lib/runtime.ts logic)
function isDevDemoMode(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  // Dev demo mode is enabled when Supabase is NOT properly configured
  return !(url && url.length > 20 && key && key.length > 50)
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Dev demo mode: allow /app routes without auth
  const devDemoMode = isDevDemoMode()
  if (devDemoMode) {
    // Allow all routes in dev demo mode
    return supabaseResponse
  }

  // Real Supabase mode: check env vars
  // Check if required environment variables are set (not empty strings)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const hasEnvVars = !!(supabaseUrl && supabaseKey && supabaseUrl.length > 0 && supabaseKey.length > 0)

  if (!hasEnvVars) {
    // If accessing /app routes without env vars, redirect to login with error
    if (request.nextUrl.pathname.startsWith('/app')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'missing_env_vars')
      return NextResponse.redirect(url)
    }
    // For root path, redirect to login
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'missing_env_vars')
      return NextResponse.redirect(url)
    }
    // Otherwise, allow the request to proceed (e.g., login page)
    return supabaseResponse
  }

  // Only create Supabase client if env vars are present
  let supabase
  try {
    // Use the trimmed values we already validated
      supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
          cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            request.cookies.delete(name)
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, '', { ...options, maxAge: 0 })
          },
          },
        }
      )
  } catch (error) {
    // If Supabase client creation fails, log and allow request to proceed
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create Supabase client in middleware:', error)
    }
    // Redirect /app routes to login, but allow other routes
    if (request.nextUrl.pathname.startsWith('/app')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'supabase_config')
      return NextResponse.redirect(url)
    }
    // For root path, redirect to login
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'supabase_config')
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Supabase auth error:', (error as any)?.message || error)
    }
  }

  // Protect /app routes (only if env vars are set)
  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from login
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  // Redirect root path based on auth status
  if (request.nextUrl.pathname === '/') {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/app'
      return NextResponse.redirect(url)
    } else {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Canonicalize preview query param: /app?preview=<id> -> /api/preview/enter?id=<id>
  if (request.nextUrl.pathname.startsWith('/app') && !request.nextUrl.pathname.startsWith('/api')) {
    const previewId = request.nextUrl.searchParams.get('preview')
    if (previewId) {
      const url = request.nextUrl.clone()
      url.pathname = '/api/preview/enter'
      url.searchParams.delete('preview')
      url.searchParams.set('id', previewId)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
