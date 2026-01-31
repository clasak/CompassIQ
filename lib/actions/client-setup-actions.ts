'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/org-context'
import { createOrganization } from './org-actions'
import { createInvite } from './settings-actions'
import { METRIC_CATALOG_TEMPLATE } from '@/lib/metric-catalog-template'
import { revalidatePath } from 'next/cache'

export interface ClientSetupResult {
  success: boolean
  orgId?: string
  inviteLink?: string
  error?: string
}

export async function setupClientInstance(
  orgName: string,
  orgSlug: string,
  adminEmail: string
): Promise<ClientSetupResult> {
  try {
    await requireAdmin()

    const createResult = await createOrganization(orgName, orgSlug)
    if (!createResult.success || !createResult.orgId) {
      return {
        success: false,
        error: createResult.error || 'Failed to create organization',
      }
    }

    const orgId = createResult.orgId
    const supabase = await createClient()

    const metrics = METRIC_CATALOG_TEMPLATE.map((metric) => ({
      org_id: orgId,
      key: metric.key,
      name: metric.name,
      description: metric.description,
      formula: metric.formula,
      source: metric.source,
      cadence: metric.cadence,
    }))

    const { error: metricsError } = await supabase.from('metric_catalog').insert(metrics)

    if (metricsError) {
      console.error('Error seeding metrics:', metricsError)
    }

    const inviteResult = await createInvite(adminEmail, 'ADMIN')
    if (!inviteResult.success || !inviteResult.token) {
      return {
        success: false,
        error: inviteResult.error || 'Failed to create admin invite',
        orgId,
      }
    }

    const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/invite/${inviteResult.token}`

    await supabase
      .from('org_settings')
      .upsert({ org_id: orgId, metadata: { is_client: true } }, { onConflict: 'org_id' })

    revalidatePath('/app/settings/setup')
    return {
      success: true,
      orgId,
      inviteLink,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to setup client instance',
    }
  }
}

