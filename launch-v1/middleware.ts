import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/invite']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // API routes are handled separately
  if (pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  // Redirect to login if not authenticated and not on public route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to app if authenticated and on login page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  // Handle preview mode entry via query param
  if (pathname.startsWith('/app') && request.nextUrl.searchParams.has('preview')) {
    const previewId = request.nextUrl.searchParams.get('preview')
    if (previewId) {
      const url = request.nextUrl.clone()
      url.pathname = '/api/preview/enter'
      url.searchParams.set('id', previewId)
      url.searchParams.set('redirect', pathname)
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
