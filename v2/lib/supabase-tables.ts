import { supabase, isSupabaseConfigured } from './supabase'

// Types
export interface Campaign {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  type: 'email' | 'call' | 'linkedin' | 'multi-channel'
  target_industry?: string
  emails_in_sequence: number
  sequence_days: number
  leads_enrolled: number
  emails_sent: number
  opens: number
  replies: number
  meetings_booked: number
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  name: string
  lead_id?: string
  company: string
  value: number
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  probability: number
  expected_close_date?: string
  owner: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  lead_id?: string
  deal_id?: string
  company?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  due_date?: string
  assignee: string
  created_at: string
  updated_at: string
}

export interface CampaignLead {
  id: string
  campaign_id: string
  lead_id: string
  status: 'enrolled' | 'sent' | 'opened' | 'replied' | 'converted' | 'unsubscribed'
  emails_sent: number
  last_email_at?: string
  enrolled_at: string
}

export interface Activity {
  id: string
  type: 'email_sent' | 'email_opened' | 'email_replied' | 'call' | 'meeting' | 'note' | 'status_change' | 'deal_created'
  lead_id?: string
  deal_id?: string
  campaign_id?: string
  description?: string
  metadata: Record<string, any>
  created_at: string
}

// Campaigns API
export const campaignsApi = {
  async getAll(): Promise<Campaign[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Campaign | null> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(campaign: Partial<Campaign>): Promise<Campaign> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async startCampaign(campaignId: string, leadIds: string[]): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    // Enroll leads in campaign
    const enrollments = leadIds.map(lead_id => ({
      campaign_id: campaignId,
      lead_id,
      status: 'enrolled' as const,
      emails_sent: 0
    }))
    
    const { error: enrollError } = await supabase
      .from('campaign_leads')
      .upsert(enrollments, { onConflict: 'campaign_id,lead_id' })
    if (enrollError) throw enrollError
    
    // Update campaign status and lead count
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'active', 
        leads_enrolled: leadIds.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
    if (updateError) throw updateError
  },

  async getStats() {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('campaigns')
      .select('status, leads_enrolled, emails_sent, opens, replies, meetings_booked')
    if (error) throw error
    
    const campaigns = data || []
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalLeadsEnrolled: campaigns.reduce((sum, c) => sum + (c.leads_enrolled || 0), 0),
      totalEmailsSent: campaigns.reduce((sum, c) => sum + (c.emails_sent || 0), 0),
      totalOpens: campaigns.reduce((sum, c) => sum + (c.opens || 0), 0),
      totalReplies: campaigns.reduce((sum, c) => sum + (c.replies || 0), 0),
      totalMeetings: campaigns.reduce((sum, c) => sum + (c.meetings_booked || 0), 0)
    }
  }
}

// Deals API
export const dealsApi = {
  async getAll(): Promise<Deal[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(deal: Partial<Deal>): Promise<Deal> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('deals')
      .insert([deal])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Deal>): Promise<Deal> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getByStage() {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('deals')
      .select('stage, value, probability')
    if (error) throw error
    
    const deals = data || []
    const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed-won']
    return stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + (d.value || 0), 0),
      weightedValue: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0)
    }))
  },

  async getPipelineValue() {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('deals')
      .select('value, probability, stage')
      .not('stage', 'eq', 'closed-lost')
    if (error) throw error
    
    const deals = data || []
    return {
      total: deals.reduce((sum, d) => sum + (d.value || 0), 0),
      weighted: deals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0),
      count: deals.length
    }
  }
}

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })
    if (error) throw error
    return data || []
  },

  async getPending(): Promise<Task[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['pending', 'in-progress'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .limit(10)
    if (error) throw error
    return data || []
  },

  async create(task: Partial<Task>): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// Activities API
export const activitiesApi = {
  async getRecent(limit = 20): Promise<Activity[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  async create(activity: Partial<Activity>): Promise<Activity> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single()
    if (error) throw error
    return data
  }
}
