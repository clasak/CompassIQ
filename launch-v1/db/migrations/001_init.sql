-- CompassIQ Launch v1 - Initial Schema
-- This migration creates all tables, enums, indexes, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE role AS ENUM ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE', 'VIEWER');
CREATE TYPE company_status AS ENUM ('prospect', 'active', 'churned', 'inactive');
CREATE TYPE opportunity_stage AS ENUM ('lead', 'qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE pilot_status AS ENUM ('draft', 'proposed', 'accepted', 'rejected', 'converted');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE action_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Memberships (user-org relationships)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role role NOT NULL DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_memberships_org_id ON memberships(org_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);

-- Organization invites
CREATE TABLE org_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role role NOT NULL DEFAULT 'VIEWER',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_invites_token ON org_invites(token);
CREATE INDEX idx_org_invites_org_id ON org_invites(org_id);

-- Organization branding
CREATE TABLE org_branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  logo_light_url TEXT,
  logo_dark_url TEXT,
  logo_mark_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_branding_org_id ON org_branding(org_id);

-- =============================================================================
-- CRM TABLES
-- =============================================================================

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  employee_count INTEGER,
  annual_revenue NUMERIC,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  status company_status NOT NULL DEFAULT 'prospect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_org_id ON companies(org_id);
CREATE INDEX idx_companies_status ON companies(org_id, status);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  stage opportunity_stage NOT NULL DEFAULT 'lead',
  probability INTEGER NOT NULL DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_org_id ON opportunities(org_id);
CREATE INDEX idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX idx_opportunities_stage ON opportunities(org_id, stage);

-- =============================================================================
-- WORKFLOW TABLES
-- =============================================================================

-- Discovery sessions
CREATE TABLE discovery_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  attendees TEXT,
  pains JSONB NOT NULL DEFAULT '[]',
  kpi_baselines JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discovery_sessions_org_id ON discovery_sessions(org_id);
CREATE INDEX idx_discovery_sessions_opportunity_id ON discovery_sessions(opportunity_id);

-- Preview workspaces
CREATE TABLE preview_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  branding JSONB NOT NULL DEFAULT '{}',
  kpi_values JSONB NOT NULL DEFAULT '{}',
  alerts JSONB NOT NULL DEFAULT '[]',
  pains JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_preview_workspaces_org_id ON preview_workspaces(org_id);
CREATE INDEX idx_preview_workspaces_opportunity_id ON preview_workspaces(opportunity_id);

-- Pilot scopes
CREATE TABLE pilot_scopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_sources JSONB NOT NULL DEFAULT '[]',
  dashboards JSONB NOT NULL DEFAULT '[]',
  alerts JSONB NOT NULL DEFAULT '[]',
  kpis JSONB NOT NULL DEFAULT '[]',
  duration_days INTEGER NOT NULL DEFAULT 60,
  price NUMERIC,
  status pilot_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pilot_scopes_org_id ON pilot_scopes(org_id);
CREATE INDEX idx_pilot_scopes_opportunity_id ON pilot_scopes(opportunity_id);

-- Delivery projects
CREATE TABLE delivery_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pilot_scope_id UUID REFERENCES pilot_scopes(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_projects_org_id ON delivery_projects(org_id);
CREATE INDEX idx_delivery_projects_company_id ON delivery_projects(company_id);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  delivery_project_id UUID REFERENCES delivery_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  milestone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tasks_project_id ON tasks(delivery_project_id);
CREATE INDEX idx_tasks_status ON tasks(org_id, status);

-- Weekly review packs
CREATE TABLE weekly_review_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  delivery_project_id UUID NOT NULL REFERENCES delivery_projects(id) ON DELETE CASCADE,
  week_of DATE NOT NULL DEFAULT CURRENT_DATE,
  kpi_snapshot JSONB NOT NULL DEFAULT '{}',
  alerts_snapshot JSONB NOT NULL DEFAULT '[]',
  tasks_snapshot JSONB NOT NULL DEFAULT '[]',
  action_items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weekly_review_packs_org_id ON weekly_review_packs(org_id);
CREATE INDEX idx_weekly_review_packs_project_id ON weekly_review_packs(delivery_project_id);

-- Action log
CREATE TABLE action_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  weekly_review_id UUID REFERENCES weekly_review_packs(id) ON DELETE SET NULL,
  delivery_project_id UUID REFERENCES delivery_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  due_date DATE,
  status action_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_action_log_org_id ON action_log(org_id);
CREATE INDEX idx_action_log_project_id ON action_log(delivery_project_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_review_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check membership
CREATE OR REPLACE FUNCTION user_has_org_access(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = check_org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role in org
CREATE OR REPLACE FUNCTION user_org_role(check_org_id UUID)
RETURNS role AS $$
DECLARE
  user_role role;
BEGIN
  SELECT m.role INTO user_role
  FROM memberships m
  WHERE m.org_id = check_org_id AND m.user_id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if org is demo
CREATE OR REPLACE FUNCTION is_demo_org(check_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  demo BOOLEAN;
BEGIN
  SELECT o.is_demo INTO demo FROM organizations o WHERE o.id = check_org_id;
  RETURN COALESCE(demo, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- RLS POLICIES - Organizations
-- =============================================================================

CREATE POLICY "Users can view orgs they belong to"
  ON organizations FOR SELECT
  USING (user_has_org_access(id));

CREATE POLICY "Users can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can update non-demo orgs"
  ON organizations FOR UPDATE
  USING (
    user_org_role(id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(id)
  );

-- =============================================================================
-- RLS POLICIES - Memberships
-- =============================================================================

CREATE POLICY "Users can view memberships in their orgs"
  ON memberships FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Owners/Admins can manage memberships in non-demo orgs"
  ON memberships FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Owners/Admins can update memberships in non-demo orgs"
  ON memberships FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Owners/Admins can delete memberships in non-demo orgs"
  ON memberships FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Invites
-- =============================================================================

CREATE POLICY "Users can view invites in their orgs"
  ON org_invites FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Admins can create invites in non-demo orgs"
  ON org_invites FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can update invites in non-demo orgs"
  ON org_invites FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Branding
-- =============================================================================

CREATE POLICY "Users can view branding in their orgs"
  ON org_branding FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Admins can manage branding in non-demo orgs"
  ON org_branding FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can update branding in non-demo orgs"
  ON org_branding FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Companies
-- =============================================================================

CREATE POLICY "Users can view companies in their orgs"
  ON companies FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Sales+ can create companies in non-demo orgs"
  ON companies FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Sales+ can update companies in non-demo orgs"
  ON companies FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete companies in non-demo orgs"
  ON companies FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Contacts
-- =============================================================================

CREATE POLICY "Users can view contacts in their orgs"
  ON contacts FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Sales+ can create contacts in non-demo orgs"
  ON contacts FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Sales+ can update contacts in non-demo orgs"
  ON contacts FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete contacts in non-demo orgs"
  ON contacts FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Opportunities
-- =============================================================================

CREATE POLICY "Users can view opportunities in their orgs"
  ON opportunities FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Sales+ can create opportunities in non-demo orgs"
  ON opportunities FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Sales+ can update opportunities in non-demo orgs"
  ON opportunities FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete opportunities in non-demo orgs"
  ON opportunities FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Discovery Sessions
-- =============================================================================

CREATE POLICY "Users can view discovery sessions in their orgs"
  ON discovery_sessions FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Sales+ can create discovery sessions in non-demo orgs"
  ON discovery_sessions FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Sales+ can update discovery sessions in non-demo orgs"
  ON discovery_sessions FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete discovery sessions in non-demo orgs"
  ON discovery_sessions FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Preview Workspaces
-- =============================================================================

CREATE POLICY "Users can view preview workspaces in their orgs"
  ON preview_workspaces FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Sales+ can create preview workspaces in non-demo orgs"
  ON preview_workspaces FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Sales+ can update preview workspaces in non-demo orgs"
  ON preview_workspaces FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete preview workspaces in non-demo orgs"
  ON preview_workspaces FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Pilot Scopes
-- =============================================================================

CREATE POLICY "Users can view pilot scopes in their orgs"
  ON pilot_scopes FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Sales+ can create pilot scopes in non-demo orgs"
  ON pilot_scopes FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Sales+ can update pilot scopes in non-demo orgs"
  ON pilot_scopes FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete pilot scopes in non-demo orgs"
  ON pilot_scopes FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Delivery Projects
-- =============================================================================

CREATE POLICY "Users can view delivery projects in their orgs"
  ON delivery_projects FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Ops+ can create delivery projects in non-demo orgs"
  ON delivery_projects FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Ops+ can update delivery projects in non-demo orgs"
  ON delivery_projects FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete delivery projects in non-demo orgs"
  ON delivery_projects FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Tasks
-- =============================================================================

CREATE POLICY "Users can view tasks in their orgs"
  ON tasks FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Ops+ can create tasks in non-demo orgs"
  ON tasks FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Ops+ can update tasks in non-demo orgs"
  ON tasks FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete tasks in non-demo orgs"
  ON tasks FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Weekly Review Packs
-- =============================================================================

CREATE POLICY "Users can view weekly review packs in their orgs"
  ON weekly_review_packs FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Ops+ can create weekly review packs in non-demo orgs"
  ON weekly_review_packs FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Ops+ can update weekly review packs in non-demo orgs"
  ON weekly_review_packs FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete weekly review packs in non-demo orgs"
  ON weekly_review_packs FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- RLS POLICIES - Action Log
-- =============================================================================

CREATE POLICY "Users can view action log in their orgs"
  ON action_log FOR SELECT
  USING (user_has_org_access(org_id));

CREATE POLICY "Ops+ can create action log entries in non-demo orgs"
  ON action_log FOR INSERT
  WITH CHECK (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Ops+ can update action log entries in non-demo orgs"
  ON action_log FOR UPDATE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES')
    AND NOT is_demo_org(org_id)
  );

CREATE POLICY "Admins can delete action log entries in non-demo orgs"
  ON action_log FOR DELETE
  USING (
    user_org_role(org_id) IN ('OWNER', 'ADMIN')
    AND NOT is_demo_org(org_id)
  );

-- =============================================================================
-- STORAGE BUCKET FOR LOGOS
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for logos bucket
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their org logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their org logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
  );

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_branding_updated_at BEFORE UPDATE ON org_branding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discovery_sessions_updated_at BEFORE UPDATE ON discovery_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preview_workspaces_updated_at BEFORE UPDATE ON preview_workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilot_scopes_updated_at BEFORE UPDATE ON pilot_scopes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_projects_updated_at BEFORE UPDATE ON delivery_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_review_packs_updated_at BEFORE UPDATE ON weekly_review_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_action_log_updated_at BEFORE UPDATE ON action_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
