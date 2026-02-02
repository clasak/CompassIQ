import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if env vars are set
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = !!supabase

// Types for leads table
export interface Lead {
  id: string
  company: string
  industry: string
  size: string
  location: string
  pain_points: string[]
  status: 'research' | 'outreach' | 'call-scheduled' | 'proposal' | 'won' | 'lost'
  estimated_value: number
  priority: 'high' | 'medium' | 'low'
  last_contact?: string
  next_action?: string
  notes?: string
  emails_sent?: number
  responses?: number
  created_at?: string
  updated_at?: string
}

// Lead CRUD operations
export const leadsApi = {
  async getAll(): Promise<Lead[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Lead | null> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getStats() {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('leads')
      .select('status, industry, estimated_value, priority')
    
    if (error) throw error
    
    const leads = data || []
    
    const byStatus: Record<string, number> = {}
    const byIndustry: Record<string, number> = {}
    let totalValue = 0
    
    leads.forEach(lead => {
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1
      byIndustry[lead.industry] = (byIndustry[lead.industry] || 0) + 1
      totalValue += lead.estimated_value || 0
    })
    
    return {
      total: leads.length,
      byStatus,
      byIndustry,
      totalValue,
      avgValue: leads.length > 0 ? Math.round(totalValue / leads.length) : 0
    }
  },

  async bulkInsert(leads: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[]): Promise<Lead[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select()
    
    if (error) throw error
    return data || []
  }
}
