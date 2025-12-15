'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrgIdOrFirst } from '@/lib/org'
import { BRANDING_DEFAULTS, normalizeBranding, type OrgBranding } from '@/lib/branding'
import { serverPerf } from '@/lib/perf'
import { cache } from 'react'

async function _getBrandingForOrgId(orgId: string): Promise<OrgBranding> {
  try {
    const supabase = await serverPerf('branding:createClient', createClient)

    // Check for preview mode via cookie
    const { getActivePreviewId } = await import('@/lib/preview')
    const previewWorkspaceId = await getActivePreviewId()

    // Single round-trip; metadata supports preview mode.
    const result = await serverPerf('branding:query', async () => {
      const { data } = await supabase
        .from('org_branding')
        .select(
          'brand_name, tagline, logo_light_url, logo_dark_url, mark_url, primary_color, accent_color, metadata',
        )
        .eq('org_id', orgId)
        .maybeSingle()
      return { data }
    })

    const { data } = result as { data: any }
    if (!data) return BRANDING_DEFAULTS

    const metadata = (data.metadata as any) || {}
    if (previewWorkspaceId && metadata.preview_workspace_id === previewWorkspaceId) {
      return normalizeBranding(data)
    }

    // Fallback to org branding.
    return normalizeBranding(data)
  } catch {
    return BRANDING_DEFAULTS
  }
}

async function _getBrandingForActiveOrg(): Promise<OrgBranding> {
  const orgId = await serverPerf('branding:getActiveOrgIdOrFirst', getActiveOrgIdOrFirst)
  if (!orgId) return BRANDING_DEFAULTS
  return getBrandingForOrgId(orgId)
}

export const getBrandingForActiveOrg = cache(_getBrandingForActiveOrg)
export const getBrandingForOrgId = cache(_getBrandingForOrgId)
