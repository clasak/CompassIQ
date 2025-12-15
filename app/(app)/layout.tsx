import { Sidebar } from '@/components/app-shell/Sidebar'
import { Topbar } from '@/components/app-shell/Topbar'
import { ErrorBoundary } from '@/components/app-shell/ErrorBoundary'
import { ModeBanner } from '@/components/app-shell/ModeBanner'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveOrgIdOrFirst, hasAnyMemberships } from '@/lib/org'
import { isDevDemoMode } from '@/lib/runtime'
import React from 'react'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dev demo mode: skip auth checks
  if (isDevDemoMode()) {
    return (
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">
              <ModeBanner />
              {children}
            </main>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // Real Supabase mode: require auth
  // Check if required environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/login?error=missing_env_vars')
  }

  let supabase
  let user = null
  try {
    supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // If Supabase client creation fails, redirect to login
    console.error('Failed to create Supabase client:', error)
    redirect('/login?error=supabase_config')
  }

  if (!user) {
    redirect('/login')
  }

  // Check if user has any memberships
  let hasMemberships = false
  try {
    hasMemberships = await hasAnyMemberships()
  } catch (error) {
    console.error('Failed to check memberships:', error)
    redirect('/login?error=supabase_config')
  }

  if (!hasMemberships) {
    // User has no orgs, redirect to onboarding
    redirect('/app/onboarding')
  }

  // Ensure org context is set
  let orgId = null
  try {
    orgId = await getActiveOrgIdOrFirst()
  } catch (error) {
    console.error('Failed to get org ID:', error)
    redirect('/login?error=supabase_config')
  }

  if (!orgId) {
    // This shouldn't happen if hasMemberships is true, but handle it anyway
    redirect('/app/onboarding')
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <ModeBanner />
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
