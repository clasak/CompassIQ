/**
 * Runtime detection for Supabase configuration and dev demo mode
 */

export function isSupabaseConfigured(): boolean {
  // Check env vars (works on both client and server in Next.js)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Must be non-empty strings with reasonable length (Supabase URLs are typically 40+ chars, keys are 100+)
  return !!(url && url.trim().length > 20 && key && key.trim().length > 50)
}

export function isDevDemoMode(): boolean {
  // Never enable dev demo mode in production
  if (process.env.NODE_ENV === 'production') {
    return false
  }
  
  // Enable dev demo mode if Supabase is not configured
  return !isSupabaseConfigured()
}

export function getDevDemoUser() {
  return {
    id: 'dev-demo-user',
    email: 'dev@demo.local',
  }
}

export function getDevDemoOrg() {
  return {
    id: 'dev-demo-org',
    name: 'Dev Demo Org',
    slug: 'dev-demo',
    is_demo: true,
  }
}

export function getDevDemoRole(): 'OWNER' | 'ADMIN' | 'SALES' | 'OPS' | 'FINANCE' | 'VIEWER' {
  return 'OWNER'
}

export function getReadOnlyMessage(): string {
  if (isDevDemoMode()) {
    return 'Dev Demo Mode is read-only.'
  }
  return 'Demo organization is read-only.'
}



