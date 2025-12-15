export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'OWNER' | 'ADMIN' | 'SALES' | 'OPS' | 'FINANCE' | 'VIEWER'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          is_demo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: Role
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role: Role
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: Role
          created_at?: string
          updated_at?: string
        }
      }
      org_invites: {
        Row: {
          id: string
          org_id: string
          email: string
          role: Role
          token: string
          expires_at: string
          accepted_at: string | null
          revoked_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role: Role
          token?: string
          expires_at?: string
          accepted_at?: string | null
          revoked_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: Role
          token?: string
          expires_at?: string
          accepted_at?: string | null
          revoked_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
      org_branding: {
        Row: {
          id: string
          org_id: string
          logo_light_url: string | null
          logo_dark_url: string | null
          logo_mark_url: string | null
          primary_color: string | null
          accent_color: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          logo_light_url?: string | null
          logo_dark_url?: string | null
          logo_mark_url?: string | null
          primary_color?: string | null
          accent_color?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          logo_light_url?: string | null
          logo_dark_url?: string | null
          logo_mark_url?: string | null
          primary_color?: string | null
          accent_color?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          org_id: string
          name: string
          industry: string | null
          website: string | null
          employee_count: number | null
          annual_revenue: number | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          notes: string | null
          status: 'prospect' | 'active' | 'churned' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          industry?: string | null
          website?: string | null
          employee_count?: number | null
          annual_revenue?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          status?: 'prospect' | 'active' | 'churned' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          industry?: string | null
          website?: string | null
          employee_count?: number | null
          annual_revenue?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          status?: 'prospect' | 'active' | 'churned' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          org_id: string
          company_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          title: string | null
          is_primary: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          company_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          title?: string | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          company_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          title?: string | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          org_id: string
          company_id: string
          name: string
          value: number
          stage: 'lead' | 'qualified' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          probability: number
          expected_close_date: string | null
          actual_close_date: string | null
          notes: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          company_id: string
          name: string
          value?: number
          stage?: 'lead' | 'qualified' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          notes?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          company_id?: string
          name?: string
          value?: number
          stage?: 'lead' | 'qualified' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          notes?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discovery_sessions: {
        Row: {
          id: string
          org_id: string
          opportunity_id: string
          session_date: string
          attendees: string | null
          pains: Json
          kpi_baselines: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          opportunity_id: string
          session_date?: string
          attendees?: string | null
          pains?: Json
          kpi_baselines?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          opportunity_id?: string
          session_date?: string
          attendees?: string | null
          pains?: Json
          kpi_baselines?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      preview_workspaces: {
        Row: {
          id: string
          org_id: string
          opportunity_id: string | null
          name: string
          branding: Json
          kpi_values: Json
          alerts: Json
          pains: Json
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          opportunity_id?: string | null
          name: string
          branding?: Json
          kpi_values?: Json
          alerts?: Json
          pains?: Json
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          opportunity_id?: string | null
          name?: string
          branding?: Json
          kpi_values?: Json
          alerts?: Json
          pains?: Json
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      pilot_scopes: {
        Row: {
          id: string
          org_id: string
          opportunity_id: string
          name: string
          data_sources: Json
          dashboards: Json
          alerts: Json
          kpis: Json
          duration_days: number
          price: number | null
          status: 'draft' | 'proposed' | 'accepted' | 'rejected' | 'converted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          opportunity_id: string
          name: string
          data_sources?: Json
          dashboards?: Json
          alerts?: Json
          kpis?: Json
          duration_days?: number
          price?: number | null
          status?: 'draft' | 'proposed' | 'accepted' | 'rejected' | 'converted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          opportunity_id?: string
          name?: string
          data_sources?: Json
          dashboards?: Json
          alerts?: Json
          kpis?: Json
          duration_days?: number
          price?: number | null
          status?: 'draft' | 'proposed' | 'accepted' | 'rejected' | 'converted'
          created_at?: string
          updated_at?: string
        }
      }
      delivery_projects: {
        Row: {
          id: string
          org_id: string
          pilot_scope_id: string | null
          company_id: string
          name: string
          status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          start_date: string | null
          target_end_date: string | null
          actual_end_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          pilot_scope_id?: string | null
          company_id: string
          name: string
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          target_end_date?: string | null
          actual_end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          pilot_scope_id?: string | null
          company_id?: string
          name?: string
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          target_end_date?: string | null
          actual_end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          org_id: string
          delivery_project_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'blocked' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          assigned_to: string | null
          milestone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          delivery_project_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'blocked' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          assigned_to?: string | null
          milestone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          delivery_project_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'blocked' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          assigned_to?: string | null
          milestone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weekly_review_packs: {
        Row: {
          id: string
          org_id: string
          delivery_project_id: string
          week_of: string
          kpi_snapshot: Json
          alerts_snapshot: Json
          tasks_snapshot: Json
          action_items: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          delivery_project_id: string
          week_of?: string
          kpi_snapshot?: Json
          alerts_snapshot?: Json
          tasks_snapshot?: Json
          action_items?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          delivery_project_id?: string
          week_of?: string
          kpi_snapshot?: Json
          alerts_snapshot?: Json
          tasks_snapshot?: Json
          action_items?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      action_log: {
        Row: {
          id: string
          org_id: string
          weekly_review_id: string | null
          delivery_project_id: string | null
          title: string
          description: string | null
          owner: string | null
          due_date: string | null
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          weekly_review_id?: string | null
          delivery_project_id?: string | null
          title: string
          description?: string | null
          owner?: string | null
          due_date?: string | null
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          weekly_review_id?: string | null
          delivery_project_id?: string | null
          title?: string
          description?: string | null
          owner?: string | null
          due_date?: string | null
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      role: Role
      company_status: 'prospect' | 'active' | 'churned' | 'inactive'
      opportunity_stage: 'lead' | 'qualified' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
      pilot_status: 'draft' | 'proposed' | 'accepted' | 'rejected' | 'converted'
      project_status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
      task_status: 'todo' | 'in_progress' | 'blocked' | 'done'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      action_status: 'open' | 'in_progress' | 'completed' | 'cancelled'
    }
  }
}
