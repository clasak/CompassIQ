import { createBrowserClient } from '@supabase/ssr'
import { isDevDemoMode } from '@/lib/runtime'

export function createClient() {
  // In dev demo mode, return a mock client that won't crash
  if (isDevDemoMode()) {
    // Return a minimal mock client that has the methods we need
    const url = 'https://dev-demo.supabase.co'
    const key = 'dev-demo-key'
    return createBrowserClient(url, key)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  return createBrowserClient(url, key)
}
