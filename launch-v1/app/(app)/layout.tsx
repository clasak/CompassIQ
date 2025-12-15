import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getPreviewId, isDemoOrg } from '@/lib/org'
import { Sidebar } from '@/components/app-shell/sidebar'
import { Topbar } from '@/components/app-shell/topbar'
import type { Role } from '@/lib/database.types'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organizations
  const { data: memberships } = await supabase
    .from('memberships')
    .select('org_id, role, organizations(id, name, slug, is_demo)')
    .eq('user_id', user.id) as { data: any[] | null }

  const organizations =
    memberships?.map((m) => ({
      id: (m.organizations as any).id,
      name: (m.organizations as any).name,
      slug: (m.organizations as any).slug,
      is_demo: (m.organizations as any).is_demo,
    })) || []

  // Get current org from cookie or default to first org
  let currentOrgId = await getCurrentOrgId()

  // If no org cookie, redirect to onboarding if no orgs, or set first org
  if (!currentOrgId) {
    if (organizations.length === 0) {
      redirect('/onboarding')
    }
    currentOrgId = organizations[0].id
  }

  // Verify user has access to current org
  const currentMembership = memberships?.find(
    (m) => (m.organizations as any).id === currentOrgId
  )

  if (!currentMembership && organizations.length > 0) {
    currentOrgId = organizations[0].id
  }

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || null
  const role = (currentMembership?.role as Role) || null
  const isDemo = currentOrg ? isDemoOrg(currentOrg.id) : false

  // Check for preview mode
  const previewId = await getPreviewId()
  let previewMode = null

  if (previewId) {
    const { data: preview } = await supabase
      .from('preview_workspaces')
      .select('id, name')
      .eq('id', previewId)
      .single() as { data: any | null }

    if (preview) {
      previewMode = preview
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isDemo={isDemo} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          user={{ id: user.id, email: user.email || '' }}
          currentOrg={currentOrg}
          organizations={organizations}
          role={role}
          previewMode={previewMode}
        />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  )
}
