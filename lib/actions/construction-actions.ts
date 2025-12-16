'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/org'
import { revalidatePath } from 'next/cache'

export interface ConstructionProject {
  id: string
  org_id: string
  preview_workspace_id?: string | null
  name: string
  job_number?: string | null
  customer_name?: string | null
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETE' | 'CANCELLED'
  start_date?: string | null
  end_date?: string | null
  pm_name?: string | null
  superintendent?: string | null
  region?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ConstructionJobCostSnapshot {
  id: string
  org_id: string
  project_id: string
  snapshot_date: string
  cost_code_id?: string | null
  budget: number
  committed: number
  actual_cost: number
  percent_complete?: number | null
  earned_value?: number | null
  metadata: Record<string, any>
}

export interface ConstructionChangeOrder {
  id: string
  org_id: string
  project_id: string
  number: string
  title: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BILLED'
  amount: number
  submitted_date?: string | null
  approved_date?: string | null
  billed_date?: string | null
  metadata: Record<string, any>
}

export interface ConstructionScheduleMilestone {
  id: string
  org_id: string
  project_id: string
  name: string
  baseline_date?: string | null
  forecast_date?: string | null
  actual_date?: string | null
  status: string
  metadata: Record<string, any>
}

export interface ConstructionLaborEntry {
  id: string
  org_id: string
  project_id: string
  work_date: string
  crew?: string | null
  trade?: string | null
  hours: number
  cost: number
  units_completed?: number | null
  cost_code_id?: string | null
  metadata: Record<string, any>
}

export interface ConstructionEquipmentLog {
  id: string
  org_id: string
  project_id: string
  equipment_name: string
  date: string
  hours_used: number
  idle_hours: number
  location?: string | null
  cost: number
  metadata: Record<string, any>
}

export interface ConstructionInvoice {
  id: string
  org_id: string
  project_id?: string | null
  invoice_number: string
  customer: string
  invoice_date: string
  due_date: string
  amount: number
  balance: number
  status: 'DRAFT' | 'SENT' | 'OVERDUE' | 'PAID' | 'VOID'
  metadata: Record<string, any>
}

export async function listConstructionProjects() {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { projects: [], error: 'No org context' }
    }

    const { data, error } = await supabase
      .from('construction_projects')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return { projects: [], error: error.message }
    }

    return { projects: (data || []) as ConstructionProject[] }
  } catch (err: any) {
    return { projects: [], error: err.message || 'Failed to list projects' }
  }
}

export async function listJobCostSnapshots(projectId?: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { snapshots: [], error: 'No org context' }
    }

    let query = supabase
      .from('construction_job_cost_snapshots')
      .select('*')
      .eq('org_id', orgId)
      .order('snapshot_date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return { snapshots: [], error: error.message }
    }

    return { snapshots: (data || []) as ConstructionJobCostSnapshot[] }
  } catch (err: any) {
    return { snapshots: [], error: err.message || 'Failed to list job cost snapshots' }
  }
}

export async function listChangeOrders(projectId?: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { changeOrders: [], error: 'No org context' }
    }

    let query = supabase
      .from('construction_change_orders')
      .select('*')
      .eq('org_id', orgId)
      .order('submitted_date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return { changeOrders: [], error: error.message }
    }

    return { changeOrders: (data || []) as ConstructionChangeOrder[] }
  } catch (err: any) {
    return { changeOrders: [], error: err.message || 'Failed to list change orders' }
  }
}

export async function listScheduleMilestones(projectId?: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { milestones: [], error: 'No org context' }
    }

    let query = supabase
      .from('construction_schedule_milestones')
      .select('*')
      .eq('org_id', orgId)
      .order('baseline_date', { ascending: true })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return { milestones: [], error: error.message }
    }

    return { milestones: (data || []) as ConstructionScheduleMilestone[] }
  } catch (err: any) {
    return { milestones: [], error: err.message || 'Failed to list milestones' }
  }
}

export async function listLaborEntries(projectId?: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { laborEntries: [], error: 'No org context' }
    }

    let query = supabase
      .from('construction_labor_entries')
      .select('*')
      .eq('org_id', orgId)
      .order('work_date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return { laborEntries: [], error: error.message }
    }

    return { laborEntries: (data || []) as ConstructionLaborEntry[] }
  } catch (err: any) {
    return { laborEntries: [], error: err.message || 'Failed to list labor entries' }
  }
}

export async function listEquipmentLogs(projectId?: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { equipmentLogs: [], error: 'No org context' }
    }

    let query = supabase
      .from('construction_equipment_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return { equipmentLogs: [], error: error.message }
    }

    return { equipmentLogs: (data || []) as ConstructionEquipmentLog[] }
  } catch (err: any) {
    return { equipmentLogs: [], error: err.message || 'Failed to list equipment logs' }
  }
}

export async function listConstructionInvoices(projectId?: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return { invoices: [], error: 'No org context' }
    }

    let query = supabase
      .from('construction_invoices')
      .select('*')
      .eq('org_id', orgId)
      .order('invoice_date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return { invoices: [], error: error.message }
    }

    return { invoices: (data || []) as ConstructionInvoice[] }
  } catch (err: any) {
    return { invoices: [], error: err.message || 'Failed to list invoices' }
  }
}
