'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireOrgContext } from '@/lib/org-context'
import { revalidatePath } from 'next/cache'
import { normalizeError } from '@/lib/errors'

export interface PreviewWorkspace {
  id: string
  org_id: string
  name: string
  industry: string | null
  pains: string[]
  kpis: string[]
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreatePreviewResult {
  success: boolean
  workspaceId?: string
  error?: string
}

export interface PreviewBranding {
  brand_name: string
  primary_color: string
  accent_color: string
  logo_light_url?: string
  logo_dark_url?: string
  mark_url?: string
}

/**
 * Create a preview workspace with branding, metrics, and alerts
 */
export async function createPreviewWorkspace(data: {
  name: string
  industry?: string
  pains: string[]
  kpis: string[]
  branding: PreviewBranding
  metricValues: Array<{ key: string; value: number }>
  accountId?: string
  opportunityId?: string
}): Promise<CreatePreviewResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Create preview workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('preview_workspaces')
      .insert({
        org_id: context.orgId,
        name: data.name,
        industry: data.industry || null,
        pains: data.pains,
        kpis: data.kpis,
        account_id: data.accountId || null,
        opportunity_id: data.opportunityId || null,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (workspaceError || !workspace) {
      return { success: false, error: normalizeError(workspaceError) }
    }

    // Create intake pack from preview data
    const { createIntakePackFromPreview } = await import('./client-project-actions')
    const intakeResult = await createIntakePackFromPreview({
      accountId: data.accountId,
      opportunityId: data.opportunityId,
      previewWorkspaceId: workspace.id,
      companyName: data.name,
      industry: data.industry,
      pains: data.pains,
      kpis: data.kpis,
      branding: data.branding,
      metricValues: data.metricValues,
    })

    if (!intakeResult.success) {
      // Log error but don't fail the preview creation
      console.error('Failed to create intake pack:', intakeResult.error)
    }

    // Create preview-specific branding entry (separate from org branding)
    // We'll insert a new row with metadata pointing to the preview workspace
    // Note: org_branding has org_id as PK, so we need to handle this differently
    // Solution: Store preview branding in a way that doesn't conflict with org branding
    // We'll insert with a special metadata flag and query by metadata when in preview mode
    const { error: brandingError } = await supabase.from('org_branding').insert({
      org_id: context.orgId,
      brand_name: data.branding.brand_name,
      primary_color: data.branding.primary_color,
      accent_color: data.branding.accent_color,
      logo_light_url: data.branding.logo_light_url || null,
      logo_dark_url: data.branding.logo_dark_url || null,
      mark_url: data.branding.mark_url || null,
      metadata: { preview_workspace_id: workspace.id, is_preview: true },
    }).select().single()

    // If insert fails due to existing org_id, update the existing row's metadata
    if (brandingError && brandingError.code === '23505') {
      // Update existing branding to include preview metadata
      await supabase
        .from('org_branding')
        .update({
          brand_name: data.branding.brand_name,
          primary_color: data.branding.primary_color,
          accent_color: data.branding.accent_color,
          logo_light_url: data.branding.logo_light_url || null,
          logo_dark_url: data.branding.logo_dark_url || null,
          mark_url: data.branding.mark_url || null,
          metadata: { preview_workspace_id: workspace.id, is_preview: true },
        })
        .eq('org_id', context.orgId)
    } else if (brandingError) {
      console.error('Branding insert error:', brandingError)
    }

    if (brandingError) {
      // Don't fail if branding fails, just log it
      console.error('Branding upsert error:', brandingError)
    }

    // Insert metric values for preview
    if (data.metricValues.length > 0) {
      const metricInserts = data.metricValues.map((mv) => ({
        org_id: context.orgId,
        metric_key: mv.key,
        value_num: mv.value,
        occurred_on: new Date().toISOString().split('T')[0],
        source: 'preview',
        preview_workspace_id: workspace.id,
      }))

      const { error: metricsError } = await supabase
        .from('metric_values')
        .insert(metricInserts)

      if (metricsError) {
        console.error('Metric values insert error:', metricsError)
      }
    }

    // Create preview alerts based on pains
    const alerts = generateAlertsFromPains(data.pains, workspace.id, context.orgId)
    if (alerts.length > 0) {
      const { error: alertsError } = await supabase.from('preview_alerts').insert(alerts)

      if (alertsError) {
        console.error('Alerts insert error:', alertsError)
      }
    }

    revalidatePath('/app')
    revalidatePath('/app/sales/preview')

    // Return workspace ID - client will redirect to /api/preview/enter
    return { success: true, workspaceId: workspace.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create preview workspace' }
  }
}

/**
 * Generate alerts based on selected pains
 */
function generateAlertsFromPains(
  pains: string[],
  workspaceId: string,
  orgId: string
): Array<{
  org_id: string
  preview_workspace_id: string
  title: string
  description: string
  severity: string
  rule: any
}> {
  const alerts: Array<{
    org_id: string
    preview_workspace_id: string
    title: string
    description: string
    severity: string
    rule: any
  }> = []

  const painToAlerts: Record<string, Array<{ title: string; description: string; severity: string }>> = {
    'data-silos': [
      {
        title: 'Data Silos Detected',
        description: 'Multiple systems not integrated, causing data inconsistencies',
        severity: 'high',
      },
      {
        title: 'Manual Data Entry Required',
        description: 'Teams spending 10+ hours/week on manual reporting',
        severity: 'medium',
      },
    ],
    'reporting-delays': [
      {
        title: 'Delayed Financial Reports',
        description: 'Monthly reports taking 5+ days to compile',
        severity: 'high',
      },
      {
        title: 'Stale Pipeline Data',
        description: 'Sales pipeline updated weekly instead of real-time',
        severity: 'medium',
      },
    ],
    'lack-visibility': [
      {
        title: 'Limited Executive Visibility',
        description: 'No single source of truth for business metrics',
        severity: 'high',
      },
      {
        title: 'Department Metrics Isolated',
        description: 'Each department tracking metrics independently',
        severity: 'medium',
      },
    ],
    'manual-processes': [
      {
        title: 'Manual KPI Calculation',
        description: 'KPIs calculated manually in spreadsheets',
        severity: 'high',
      },
      {
        title: 'Time-Consuming Reporting',
        description: 'Weekly reporting taking 8+ hours per team',
        severity: 'medium',
      },
    ],
    'inaccurate-forecasting': [
      {
        title: 'Pipeline Forecast Inaccuracy',
        description: 'Forecasts off by 20%+ due to stale data',
        severity: 'high',
      },
      {
        title: 'Revenue Projections Delayed',
        description: 'Quarterly projections available 2 weeks late',
        severity: 'medium',
      },
    ],
  }

  for (const pain of pains) {
    const painAlerts = painToAlerts[pain] || [
      {
        title: `${pain.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Issue`,
        description: 'Attention required',
        severity: 'medium',
      },
    ]

    for (const alert of painAlerts) {
      alerts.push({
        org_id: orgId,
        preview_workspace_id: workspaceId,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        rule: { pain, type: 'preview' },
      })
    }
  }

  // Ensure at least 5 alerts
  while (alerts.length < 5) {
    alerts.push({
      org_id: orgId,
      preview_workspace_id: workspaceId,
      title: `Sample Alert ${alerts.length + 1}`,
      description: 'Illustrative preview data',
      severity: 'medium',
      rule: { type: 'preview' },
    })
  }

  return alerts.slice(0, 10) // Max 10 alerts
}

/**
 * Get preview workspace by ID
 */
export async function getPreviewWorkspace(id: string): Promise<{
  success: boolean
  workspace?: PreviewWorkspace
  error?: string
}> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data: workspace, error } = await supabase
      .from('preview_workspaces')
      .select('*')
      .eq('id', id)
      .eq('org_id', context.orgId)
      .single()

    if (error || !workspace) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, workspace }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get preview workspace' }
  }
}

