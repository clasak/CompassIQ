'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveOrgIdForClient, switchOrganization } from '@/lib/actions/org-actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Building2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { isDevDemoMode, getDevDemoOrg, getDevDemoRole } from '@/lib/runtime'

interface Organization {
  id: string
  name: string
  slug: string
  is_demo: boolean
  role: string
}

export function OrgSwitcher() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [canCreateOrg, setCanCreateOrg] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadOrgs()
  }, [])

  function persistLastOrgSlug(slug: string) {
    try {
      if (slug) localStorage.setItem('LAST_ORG_SLUG', slug)
    } catch {
      // ignore
    }
  }

  async function loadOrgs() {
    // Dev demo mode: use demo org
    if (isDevDemoMode()) {
      const demoOrg = getDevDemoOrg()
      const demoRole = getDevDemoRole()
      setOrgs([{
        id: demoOrg.id,
        name: demoOrg.name,
        slug: demoOrg.slug,
        is_demo: demoOrg.is_demo,
        role: demoRole,
      }])
      setCurrentOrgId(demoOrg.id)
      persistLastOrgSlug(demoOrg.slug)
      setCanCreateOrg(false)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user's memberships with org details
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select('org_id, role, organizations(id, name, slug, is_demo)')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading orgs:', error)
        setLoading(false)
        return
      }

      if (memberships) {
        const orgList = memberships.map((m: any) => ({
          id: m.organizations.id,
          name: m.organizations.name,
          slug: m.organizations.slug,
          is_demo: m.organizations.is_demo,
          role: m.role,
        }))
        setOrgs(orgList)

        // Check if user can create orgs (OWNER or ADMIN in at least one org)
        const canCreate = orgList.some((org) => ['OWNER', 'ADMIN'].includes(org.role))
        setCanCreateOrg(canCreate)

        // Active org is stored in an HTTP-only cookie, so we must resolve it server-side.
        const active = await getActiveOrgIdForClient()
        const currentId = active.orgId

        if (currentId && orgList.find((o) => o.id === currentId)) {
          setCurrentOrgId(currentId)
          const slug = orgList.find((o) => o.id === currentId)?.slug
          if (slug) persistLastOrgSlug(slug)
        } else if (orgList.length > 0) {
          // Cookie missing or invalid; fall back to first org and persist it via server action.
          await handleOrgChange(orgList[0].id, orgList[0].slug)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading orgs:', error)
      setLoading(false)
    }
  }

  async function handleOrgChange(orgId: string, slugHint?: string) {
    const result = await switchOrganization(orgId)
    if (result.success) {
      setCurrentOrgId(orgId)
      const slug = slugHint || orgs.find((o) => o.id === orgId)?.slug
      if (slug) persistLastOrgSlug(slug)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to switch organization')
    }
  }

  const currentOrg = orgs.find((o) => o.id === currentOrgId)

  if (loading) {
    return (
      <Button
        variant="outline"
        disabled
        title="Loading organizations"
        data-disabled-reason="Loading organizations"
      >
        Loading...
      </Button>
    )
  }

  if (orgs.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          {currentOrg?.name || 'Select Org'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrgChange(org.id, org.slug)}
            className={currentOrgId === org.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{org.name}</span>
              {org.is_demo && (
                <span className="ml-2 text-xs text-muted-foreground">(Demo)</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        {canCreateOrg && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/app/onboarding')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Org
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
