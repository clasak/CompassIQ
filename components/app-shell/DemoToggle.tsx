'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveOrgIdForClient, switchOrganization } from '@/lib/actions/org-actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { isDevDemoMode } from '@/lib/runtime'

export function DemoToggle() {
  const [isDemo, setIsDemo] = useState(false)
  const [demoOrgId, setDemoOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkDemoMode()
  }, [])

  async function checkDemoMode() {
    // In dev demo mode, always show as demo
    if (isDevDemoMode()) {
      setIsDemo(true)
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

      // Active org is stored in an HTTP-only cookie, so we must resolve it server-side.
      const active = await getActiveOrgIdForClient()
      const currentOrgId = active.orgId

      if (!currentOrgId) {
        setLoading(false)
        return
      }

      // Check if current org is demo
      const { data: org } = await supabase
        .from('organizations')
        .select('is_demo')
        .eq('id', currentOrgId)
        .single()

      setIsDemo(org?.is_demo || false)

      // Also find demo org if it exists
      const { data: demoOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'demo')
        .eq('is_demo', true)
        .single()

      setDemoOrgId(demoOrg?.id || null)
      setLoading(false)
    } catch (error) {
      console.error('Error checking demo mode:', error)
      setLoading(false)
    }
  }

  async function handleToggle() {
    // In dev demo mode, toggle is disabled
    if (isDevDemoMode()) {
      toast.info('Dev Demo Mode is always active. Configure Supabase to use production mode.')
      return
    }

    if (!demoOrgId) {
      toast.error('Demo organization not found. Run the seed script to create it.')
      return
    }

    if (isDemo) {
      // Switch back to first non-demo org
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: memberships } = await supabase
          .from('memberships')
          .select('org_id, organizations(is_demo)')
          .eq('user_id', user.id)

        const nonDemoOrg = memberships?.find(
          (m: any) => !m.organizations.is_demo
        )

        if (nonDemoOrg) {
          const result = await switchOrganization(nonDemoOrg.org_id)
          if (result.success) {
            router.refresh()
          } else {
            toast.error(result.error || 'Failed to switch organization')
          }
        }
      } catch (error) {
        console.error('Error switching org:', error)
        toast.error('Failed to switch organization')
      }
    } else {
      // Switch to demo org
      const result = await switchOrganization(demoOrgId)
      if (result.success) {
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to switch to demo org')
      }
    }
  }

  if (loading) {
    return null
  }

  // In dev demo mode, show as always demo
  if (isDevDemoMode()) {
    const reason = 'Dev Demo Mode is always active. Configure Supabase to use production mode.'
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              disabled
              title={reason}
              data-disabled-reason={reason}
            >
              <Sparkles className="h-4 w-4" />
              Dev Demo Mode
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {reason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!demoOrgId && !isDemo) {
    const reason = 'Run seed script to create demo org'
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled
              title={reason}
              data-disabled-reason={reason}
            >
              <Sparkles className="h-4 w-4" />
              Demo Mode
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {reason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isDemo ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={handleToggle}
          >
            <Sparkles className="h-4 w-4" />
            {isDemo ? 'Demo Mode' : 'Production Mode'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDemo
            ? 'Demo data is read-only. Click to switch to production.'
            : 'Click to switch to demo org'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
