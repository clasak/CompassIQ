'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/org-context'
import { getActiveOrgId } from '@/lib/org'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MetricCatalogSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  formula: z.string().optional(),
  source: z.string().optional(),
  cadence: z.string().optional(),
})

const ConfigSchema = z.object({
  metric_catalog: z.array(MetricCatalogSchema).optional(),
  roi_defaults: z.record(z.any()).optional(),
  alert_thresholds: z.record(z.any()).optional(),
})

export async function exportConfiguration(): Promise<{
  success: boolean
  config?: any
  error?: string
}> {
  try {
    const { isDevDemoMode } = await import('@/lib/runtime')
    const { getMetricCatalog, getOrgSettings } = await import('@/lib/data')

    if (isDevDemoMode()) {
      const metrics = await getMetricCatalog()
      const settings = await getOrgSettings()

      const config = {
        metric_catalog: metrics.map((m: any) => ({
          key: m.key,
          name: m.name,
          description: m.description,
          formula: m.formula,
          source: m.source,
          cadence: m.cadence,
        })),
        roi_defaults: settings.roi_defaults || {},
        alert_thresholds: settings.alert_thresholds || {},
        exported_at: new Date().toISOString(),
      }

      return { success: true, config }
    }

    await requireAdmin()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()

    const { data: metrics, error: metricsError } = await supabase
      .from('metric_catalog')
      .select('key, name, description, formula, source, cadence')
      .eq('org_id', orgId)

    if (metricsError) {
      return { success: false, error: metricsError.message }
    }

    const { data: settings, error: settingsError } = await supabase
      .from('org_settings')
      .select('roi_defaults, alert_thresholds')
      .eq('org_id', orgId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      return { success: false, error: settingsError.message }
    }

    const config = {
      metric_catalog: metrics || [],
      roi_defaults: settings?.roi_defaults || {},
      alert_thresholds: settings?.alert_thresholds || {},
      exported_at: new Date().toISOString(),
    }

    return { success: true, config }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to export configuration' }
  }
}

export async function importConfiguration(config: any): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { isDevDemoMode } = await import('@/lib/runtime')

    if (isDevDemoMode()) {
      const validated = ConfigSchema.safeParse(config)
      if (!validated.success) {
        return {
          success: false,
          error: `Invalid configuration format: ${validated.error.message}`,
        }
      }
      return { success: true }
    }

    await requireAdmin()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { success: false, error: 'No organization context' }
    }

    const validated = ConfigSchema.safeParse(config)
    if (!validated.success) {
      return {
        success: false,
        error: `Invalid configuration format: ${validated.error.message}`,
      }
    }

    const supabase = await createClient()

    if (validated.data.metric_catalog && validated.data.metric_catalog.length > 0) {
      const metrics = validated.data.metric_catalog.map((metric) => ({
        org_id: orgId,
        key: metric.key,
        name: metric.name,
        description: metric.description || null,
        formula: metric.formula || null,
        source: metric.source || null,
        cadence: metric.cadence || null,
      }))

      // Batch upsert all metrics at once instead of sequential inserts
      const { error } = await supabase.from('metric_catalog').upsert(metrics, { onConflict: 'org_id,key' })

      if (error) {
        return { success: false, error: `Failed to import metrics: ${error.message}` }
      }
    }

    if (validated.data.roi_defaults || validated.data.alert_thresholds) {
      const { data: existing } = await supabase
        .from('org_settings')
        .select('roi_defaults, alert_thresholds')
        .eq('org_id', orgId)
        .single()

      const mergedDefaults = {
        ...(existing?.roi_defaults || {}),
        ...(validated.data.roi_defaults || {}),
      }

      const mergedThresholds = {
        ...(existing?.alert_thresholds || {}),
        ...(validated.data.alert_thresholds || {}),
      }

      const { error: settingsError } = await supabase
        .from('org_settings')
        .upsert(
          {
            org_id: orgId,
            roi_defaults: mergedDefaults,
            alert_thresholds: mergedThresholds,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'org_id' }
        )

      if (settingsError) {
        return { success: false, error: `Failed to import settings: ${settingsError.message}` }
      }
    }

    revalidatePath('/app/settings/import')
    revalidatePath('/app/data/metrics')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to import configuration' }
  }
}

