'use server'

import { createClient } from '@/lib/supabase/server'
import { requireOrgContext, requireAdmin } from '@/lib/org-context'
import { revalidatePath } from 'next/cache'
import { normalizeError } from '@/lib/errors'

export interface ClientProject {
  id: string
  org_id: string
  account_id: string
  opportunity_id: string | null
  name: string
  status: 'onboarding' | 'active' | 'at_risk' | 'paused' | 'completed'
  intake_pack_id: string | null
  preview_workspace_id: string | null
  production_os_instance_id: string | null
  team: Array<{ user_id: string; role: string; name: string }>
  next_review_date: string | null
  notes: string | null
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export interface ClientIntakePack {
  id: string
  org_id: string
  account_id: string | null
  opportunity_id: string | null
  preview_workspace_id: string | null
  company_name: string
  industry: string | null
  pains: string[]
  kpis: string[]
  data_sources: Array<{ type: string; name: string; description?: string }>
  stakeholders: Array<{ name: string; email: string; title?: string; role?: string }>
  branding: {
    brand_name: string
    primary_color: string
    accent_color: string
    logo_light_url?: string
    logo_dark_url?: string
    mark_url?: string
  } | null
  metric_values: Array<{ key: string; value: number }>
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

/**
 * Get all client projects for the current org
 */
export async function getClientProjects(): Promise<{
  success: boolean
  projects?: ClientProject[]
  error?: string
}> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data: projects, error } = await supabase
      .from('client_projects')
      .select('*')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, projects: projects || [] }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get client projects' }
  }
}

/**
 * Get a single client project by ID
 */
export async function getClientProject(id: string): Promise<{
  success: boolean
  project?: ClientProject
  error?: string
}> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data: project, error } = await supabase
      .from('client_projects')
      .select('*')
      .eq('id', id)
      .eq('org_id', context.orgId)
      .single()

    if (error || !project) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, project }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get client project' }
  }
}

/**
 * Create a client project from an opportunity
 */
export async function createClientProjectFromOpportunity(
  opportunityId: string
): Promise<{
  success: boolean
  projectId?: string
  error?: string
}> {
  try {
    const context = await requireAdmin()
    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get opportunity details
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('*, accounts(*)')
      .eq('id', opportunityId)
      .eq('org_id', context.orgId)
      .single()

    if (oppError || !opportunity) {
      return { success: false, error: 'Opportunity not found' }
    }

    // Check if opportunity is won
    if (opportunity.stage !== 'WON') {
      return { success: false, error: 'Opportunity must be in WON stage to create client project' }
    }

    // Check if client project already exists for this opportunity
    const { data: existing } = await supabase
      .from('client_projects')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('org_id', context.orgId)
      .single()

    if (existing) {
      return { success: false, error: 'Client project already exists for this opportunity' }
    }

    // Get intake pack if it exists (from preview workspace)
    let intakePackId: string | null = null
    const { data: previewWorkspace } = await supabase
      .from('preview_workspaces')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('org_id', context.orgId)
      .single()

    if (previewWorkspace) {
      const { data: intakePack } = await supabase
        .from('client_intake_packs')
        .select('id')
        .eq('preview_workspace_id', previewWorkspace.id)
        .eq('org_id', context.orgId)
        .single()

      if (intakePack) {
        intakePackId = intakePack.id
      }
    }

    // Create client project
    const account = opportunity.accounts as any
    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .insert({
        org_id: context.orgId,
        account_id: opportunity.account_id,
        opportunity_id: opportunityId,
        name: account?.name || opportunity.name || 'New Client Project',
        status: 'onboarding',
        intake_pack_id: intakePackId,
        preview_workspace_id: previewWorkspace?.id || null,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (projectError || !project) {
      return { success: false, error: normalizeError(projectError) }
    }

    revalidatePath('/app/clients')
    revalidatePath(`/app/clients/${project.id}`)
    revalidatePath(`/app/crm/opportunities/${opportunityId}`)

    return { success: true, projectId: project.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create client project' }
  }
}

/**
 * Create intake pack from preview generator data
 */
export async function createIntakePackFromPreview(data: {
  accountId?: string
  opportunityId?: string
  previewWorkspaceId?: string
  companyName: string
  industry?: string
  pains: string[]
  kpis: string[]
  dataSources?: Array<{ type: string; name: string; description?: string }>
  stakeholders?: Array<{ name: string; email: string; title?: string; role?: string }>
  branding: {
    brand_name: string
    primary_color: string
    accent_color: string
    logo_light_url?: string
    logo_dark_url?: string
    mark_url?: string
  }
  metricValues: Array<{ key: string; value: number }>
}): Promise<{
  success: boolean
  intakePackId?: string
  error?: string
}> {
  try {
    const context = await requireAdmin()
    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: intakePack, error } = await supabase
      .from('client_intake_packs')
      .insert({
        org_id: context.orgId,
        account_id: data.accountId || null,
        opportunity_id: data.opportunityId || null,
        preview_workspace_id: data.previewWorkspaceId || null,
        company_name: data.companyName,
        industry: data.industry || null,
        pains: data.pains,
        kpis: data.kpis,
        data_sources: data.dataSources || [],
        stakeholders: data.stakeholders || [],
        branding: data.branding,
        metric_values: data.metricValues,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error || !intakePack) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/clients')
    revalidatePath('/app/sales/preview')

    return { success: true, intakePackId: intakePack.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create intake pack' }
  }
}

/**
 * Get intake pack by ID
 */
export async function getIntakePack(id: string): Promise<{
  success: boolean
  intakePack?: ClientIntakePack
  error?: string
}> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data: intakePack, error } = await supabase
      .from('client_intake_packs')
      .select('*')
      .eq('id', id)
      .eq('org_id', context.orgId)
      .single()

    if (error || !intakePack) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, intakePack }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get intake pack' }
  }
}

/**
 * Update client project
 */
export async function updateClientProject(
  id: string,
  updates: Partial<ClientProject>
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const context = await requireAdmin()
    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('client_projects')
      .update({
        ...updates,
        updated_by: user?.id || null,
      })
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/clients')
    revalidatePath(`/app/clients/${id}`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update client project' }
  }
}

// ============================================================
// DATA SOURCES
// ============================================================

export interface ClientDataSource {
  id: string
  org_id: string
  client_project_id: string
  type: string
  name: string
  description: string | null
  status: 'pending' | 'connected' | 'error' | 'disconnected'
  last_sync_at: string | null
  sync_error: string | null
  created_at: string
}

export async function getDataSources(projectId: string) {
  try {
    const context = await requireOrgContext()
    if (!context) return { success: false, error: 'No organization context' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_data_sources')
      .select('*')
      .eq('client_project_id', projectId)
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: normalizeError(error) }
    return { success: true, dataSources: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createDataSource(data: {
  projectId: string
  type: string
  name: string
  description?: string
}) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: dataSource, error } = await supabase
      .from('client_data_sources')
      .insert({
        org_id: context.orgId,
        client_project_id: data.projectId,
        type: data.type,
        name: data.name,
        description: data.description || null,
        status: 'pending',
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath(`/app/clients/${data.projectId}`)
    return { success: true, dataSource }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateDataSource(id: string, updates: Partial<ClientDataSource>) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('client_data_sources')
      .update({ ...updates, updated_by: user?.id || null })
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteDataSource(id: string) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('client_data_sources')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ============================================================
// KPI CATALOG
// ============================================================

export interface ClientKPI {
  id: string
  org_id: string
  client_project_id: string
  metric_key: string
  metric_name: string
  definition: string | null
  formula: string | null
  target_value: number | null
  unit: string | null
  is_active: boolean
  created_at: string
}

export async function getKPICatalog(projectId: string) {
  try {
    const context = await requireOrgContext()
    if (!context) return { success: false, error: 'No organization context' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_kpi_catalog')
      .select('*')
      .eq('client_project_id', projectId)
      .eq('org_id', context.orgId)
      .order('metric_name')

    if (error) return { success: false, error: normalizeError(error) }
    return { success: true, kpis: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createKPI(data: {
  projectId: string
  metricKey: string
  metricName: string
  definition?: string
  formula?: string
  targetValue?: number
  unit?: string
}) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: kpi, error } = await supabase
      .from('client_kpi_catalog')
      .insert({
        org_id: context.orgId,
        client_project_id: data.projectId,
        metric_key: data.metricKey,
        metric_name: data.metricName,
        definition: data.definition || null,
        formula: data.formula || null,
        target_value: data.targetValue || null,
        unit: data.unit || null,
        is_active: true,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath(`/app/clients/${data.projectId}`)
    return { success: true, kpi }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateKPI(id: string, updates: Partial<ClientKPI>) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('client_kpi_catalog')
      .update({ ...updates, updated_by: user?.id || null })
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteKPI(id: string) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('client_kpi_catalog')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ============================================================
// ALERT RULES
// ============================================================

export interface ClientAlertRule {
  id: string
  org_id: string
  client_project_id: string
  kpi_key: string
  condition_type: 'threshold' | 'trend' | 'anomaly' | 'forecast'
  condition_config: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  notification_channels: Array<{ type: string; target: string }>
  is_active: boolean
  created_at: string
}

export async function getAlertRules(projectId: string) {
  try {
    const context = await requireOrgContext()
    if (!context) return { success: false, error: 'No organization context' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_alert_rules')
      .select('*')
      .eq('client_project_id', projectId)
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: normalizeError(error) }
    return { success: true, alertRules: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createAlertRule(data: {
  projectId: string
  kpiKey: string
  conditionType: 'threshold' | 'trend' | 'anomaly' | 'forecast'
  conditionConfig: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  notificationChannels?: Array<{ type: string; target: string }>
}) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: alertRule, error } = await supabase
      .from('client_alert_rules')
      .insert({
        org_id: context.orgId,
        client_project_id: data.projectId,
        kpi_key: data.kpiKey,
        condition_type: data.conditionType,
        condition_config: data.conditionConfig,
        severity: data.severity,
        notification_channels: data.notificationChannels || [],
        is_active: true,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath(`/app/clients/${data.projectId}`)
    return { success: true, alertRule }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateAlertRule(id: string, updates: Partial<ClientAlertRule>) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('client_alert_rules')
      .update({ ...updates, updated_by: user?.id || null })
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteAlertRule(id: string) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('client_alert_rules')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ============================================================
// CADENCE
// ============================================================

export interface ClientCadence {
  id: string
  org_id: string
  client_project_id: string
  day_of_week: number
  time_of_day: string
  timezone: string
  attendees: Array<{ user_id?: string; email: string; name: string }>
  agenda_template: any
  is_active: boolean
  created_at: string
}

export async function getCadences(projectId: string) {
  try {
    const context = await requireOrgContext()
    if (!context) return { success: false, error: 'No organization context' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_cadence')
      .select('*')
      .eq('client_project_id', projectId)
      .eq('org_id', context.orgId)
      .order('day_of_week')

    if (error) return { success: false, error: normalizeError(error) }
    return { success: true, cadences: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createCadence(data: {
  projectId: string
  dayOfWeek: number
  timeOfDay: string
  timezone: string
  attendees: Array<{ user_id?: string; email: string; name: string }>
  agendaTemplate?: any
}) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: cadence, error } = await supabase
      .from('client_cadence')
      .insert({
        org_id: context.orgId,
        client_project_id: data.projectId,
        day_of_week: data.dayOfWeek,
        time_of_day: data.timeOfDay,
        timezone: data.timezone,
        attendees: data.attendees,
        agenda_template: data.agendaTemplate || null,
        is_active: true,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath(`/app/clients/${data.projectId}`)
    return { success: true, cadence }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateCadence(id: string, updates: Partial<ClientCadence>) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('client_cadence')
      .update({ ...updates, updated_by: user?.id || null })
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteCadence(id: string) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('client_cadence')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ============================================================
// MEETING HISTORY
// ============================================================

export interface ClientMeeting {
  id: string
  org_id: string
  client_project_id: string
  cadence_id: string | null
  meeting_date: string
  attendees: Array<{ user_id?: string; email: string; name: string; attended: boolean }>
  agenda: any
  action_items: Array<{ id: string; title: string; owner: string; due_date: string; status: string }>
  notes: string | null
  recording_url: string | null
  exec_pack_url: string | null
  created_at: string
}

export async function getMeetings(projectId: string) {
  try {
    const context = await requireOrgContext()
    if (!context) return { success: false, error: 'No organization context' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_meeting_history')
      .select('*')
      .eq('client_project_id', projectId)
      .eq('org_id', context.orgId)
      .order('meeting_date', { ascending: false })

    if (error) return { success: false, error: normalizeError(error) }
    return { success: true, meetings: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createMeeting(data: {
  projectId: string
  cadenceId?: string
  meetingDate: string
  attendees: Array<{ user_id?: string; email: string; name: string; attended: boolean }>
  agenda?: any
  actionItems?: Array<{ id: string; title: string; owner: string; due_date: string; status: string }>
  notes?: string
  recordingUrl?: string
  execPackUrl?: string
}) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: meeting, error } = await supabase
      .from('client_meeting_history')
      .insert({
        org_id: context.orgId,
        client_project_id: data.projectId,
        cadence_id: data.cadenceId || null,
        meeting_date: data.meetingDate,
        attendees: data.attendees,
        agenda: data.agenda || null,
        action_items: data.actionItems || [],
        notes: data.notes || null,
        recording_url: data.recordingUrl || null,
        exec_pack_url: data.execPackUrl || null,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath(`/app/clients/${data.projectId}`)
    return { success: true, meeting }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateMeeting(id: string, updates: Partial<ClientMeeting>) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('client_meeting_history')
      .update({ ...updates, updated_by: user?.id || null })
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteMeeting(id: string) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('client_meeting_history')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ============================================================
// DELIVERABLES
// ============================================================

export interface ClientDeliverable {
  id: string
  org_id: string
  client_project_id: string
  type: 'pilot_plan' | 'kpi_dictionary' | 'weekly_pack' | 'exec_pack' | 'custom'
  title: string
  description: string | null
  file_url: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export async function getDeliverables(projectId: string) {
  try {
    const context = await requireOrgContext()
    if (!context) return { success: false, error: 'No organization context' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_deliverables')
      .select('*')
      .eq('client_project_id', projectId)
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: normalizeError(error) }
    return { success: true, deliverables: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createDeliverable(data: {
  projectId: string
  type: 'pilot_plan' | 'kpi_dictionary' | 'weekly_pack' | 'exec_pack' | 'custom'
  title: string
  description?: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
}) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: deliverable, error } = await supabase
      .from('client_deliverables')
      .insert({
        org_id: context.orgId,
        client_project_id: data.projectId,
        type: data.type,
        title: data.title,
        description: data.description || null,
        file_url: data.fileUrl,
        file_size: data.fileSize || null,
        mime_type: data.mimeType || null,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath(`/app/clients/${data.projectId}`)
    return { success: true, deliverable }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteDeliverable(id: string) {
  try {
    const context = await requireAdmin()
    if (context.isDemo) return { success: false, error: 'DEMO_READ_ONLY' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('client_deliverables')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) return { success: false, error: normalizeError(error) }

    revalidatePath('/app/clients')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}


