import { Sidebar } from '@/components/app-shell/Sidebar'
import { Topbar } from '@/components/app-shell/Topbar'
import { ErrorBoundary } from '@/components/app-shell/ErrorBoundary'
import { ModeBanner } from '@/components/app-shell/ModeBanner'
import { getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveOrgIdOrFirst } from '@/lib/org'
import { isDevDemoMode } from '@/lib/runtime'
import React from 'react'
import { UiClickAudit } from '@/components/audit/UiClickAudit'
import { DemoTour } from '@/components/demo/DemoTour'
import { getBrandingForActiveOrg, getBrandingForOrgId } from '@/lib/branding/server'
import { BRANDING_DEFAULTS } from '@/lib/branding'
import { BrandProvider } from '@/components/branding/BrandProvider'
import { PreviewBanner } from '@/components/app-shell/PreviewBanner'
import { PerfNavCapture } from '@/components/perf/PerfNavCapture'
import { serverPerf } from '@/lib/perf'
import { getActivePreviewId } from '@/lib/preview'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dev demo mode: skip auth checks
  if (isDevDemoMode()) {
    // In dev demo mode, use default branding (don't try to fetch from DB)
    const branding = BRANDING_DEFAULTS
    const previewId = await getActivePreviewId()
    return (
      <BrandProvider branding={branding}>
        <ErrorBoundary>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6">
                <PreviewBanner previewId={previewId} />
                <ModeBanner />
                {children}
                <UiClickAudit />
                <DemoTour />
                <PerfNavCapture />
              </main>
            </div>
          </div>
        </ErrorBoundary>
      </BrandProvider>
    )
  }

  // Real Supabase mode: require auth
  // Check if required environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/login?error=missing_env_vars')
  }

  let user = null
  try {
    user = await serverPerf('layout:getServerUser', getServerUser)
  } catch (error) {
    // If Supabase client creation fails, redirect to login
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create Supabase client:', error)
    }
    redirect('/login?error=supabase_config')
  }

  if (!user) {
    redirect('/login')
  }

  // Ensure org context is set
  let orgId = null
  try {
    orgId = await serverPerf('layout:getActiveOrgIdOrFirst', getActiveOrgIdOrFirst)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get org ID:', error)
    }
    redirect('/login?error=supabase_config')
  }

  if (!orgId) {
    // User has no orgs, redirect to onboarding.
    redirect('/app/onboarding')
  }

  const branding = await serverPerf('layout:getBrandingForOrgId', () => getBrandingForOrgId(orgId))
  const previewId = await getActivePreviewId()

  return (
    <BrandProvider branding={branding}>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">
              <PreviewBanner previewId={previewId} />
              <ModeBanner />
              {children}
              <UiClickAudit />
              <DemoTour />
              <PerfNavCapture />
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </BrandProvider>
  )
}
