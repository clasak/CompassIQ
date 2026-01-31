import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isDevDemoMode } from '@/lib/runtime'
import { cache } from 'react'

async function _createClient() {
  // In dev demo mode, return a mock client that won't crash
  if (isDevDemoMode()) {
    const cookieStore = await cookies()
    const url = 'https://dev-demo.supabase.co'
    const key = 'dev-demo-key'
    return createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch {
            // Ignore in Server Components
          }
        },
      },
    })
  }

  // Check if required environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  )
}

export const createClient = cache(_createClient)

export const getServerUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
