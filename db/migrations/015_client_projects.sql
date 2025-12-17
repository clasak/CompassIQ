-- ============================================================
-- 015_client_projects.sql
-- Client Project Workspace: Core object that ties together intake → preview → engagement → delivery
-- ============================================================

-- CLIENT PROJECT STATUS ENUM
CREATE TYPE client_project_status_enum AS ENUM ('onboarding', 'active', 'at_risk', 'paused', 'completed');

-- CLIENT PROJECTS (Master engagement record)
CREATE TABLE IF NOT EXISTS client_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
    name text NOT NULL,
    status client_project_status_enum NOT NULL DEFAULT 'onboarding',
    intake_pack_id uuid, -- Will reference client_intake_packs
    preview_workspace_id uuid REFERENCES preview_workspaces(id) ON DELETE SET NULL,
    production_os_instance_id uuid REFERENCES os_instances(id) ON DELETE SET NULL,
    team jsonb DEFAULT '[]', -- Array of {user_id, role, name}
    next_review_date timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT INTAKE PACKS (Stored intake data from preview generator)
CREATE TABLE IF NOT EXISTS client_intake_packs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
    opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
    preview_workspace_id uuid REFERENCES preview_workspaces(id) ON DELETE SET NULL,
    company_name text NOT NULL,
    industry text,
    pains jsonb NOT NULL DEFAULT '[]', -- Array of pain IDs
    kpis jsonb NOT NULL DEFAULT '[]', -- Array of KPI keys
    data_sources jsonb DEFAULT '[]', -- Array of {type, name, description}
    stakeholders jsonb DEFAULT '[]', -- Array of {name, email, title, role}
    branding jsonb, -- {brand_name, primary_color, accent_color, logo_light_url, logo_dark_url, mark_url}
    metric_values jsonb DEFAULT '[]', -- Array of {key, value}
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT DATA SOURCES (Client's connected systems - separate from org-level data_sources)
CREATE TABLE IF NOT EXISTS client_data_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'google_sheets', 'procore', 'quickbooks', 'hubspot', 'custom'
    name text NOT NULL,
    description text,
    credentials jsonb, -- Encrypted credentials (stored securely)
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
    last_sync_at timestamptz,
    sync_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT DATA MAPPINGS (Field-to-KPI mappings)
CREATE TABLE IF NOT EXISTS client_data_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    data_source_id uuid NOT NULL REFERENCES client_data_sources(id) ON DELETE CASCADE,
    source_field text NOT NULL, -- Column name from data source
    target_kpi_key text NOT NULL, -- KPI key from metric_catalog
    transform_rule jsonb, -- {type: 'direct'|'formula', formula?: string}
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT KPI CATALOG (Finalized metrics for this client project)
CREATE TABLE IF NOT EXISTS client_kpi_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    metric_key text NOT NULL, -- References metric_catalog.key
    metric_name text NOT NULL,
    definition text,
    formula text,
    target_value numeric,
    unit text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid,
    UNIQUE(client_project_id, metric_key)
);

-- CLIENT ALERT RULES (Threshold/notification setup for this client)
CREATE TABLE IF NOT EXISTS client_alert_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    kpi_key text NOT NULL, -- References metric_catalog.key or client_kpi_catalog.metric_key
    condition_type text NOT NULL CHECK (condition_type IN ('threshold', 'trend', 'anomaly', 'forecast')),
    condition_config jsonb NOT NULL, -- {operator: 'gt'|'lt'|'eq', value: number, ...}
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    notification_channels jsonb DEFAULT '[]', -- Array of {type: 'email'|'slack', target: string}
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT CADENCE (Weekly review schedule)
CREATE TABLE IF NOT EXISTS client_cadence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    time_of_day time NOT NULL, -- e.g., '10:00:00'
    timezone text NOT NULL DEFAULT 'UTC',
    attendees jsonb DEFAULT '[]', -- Array of {user_id, email, name}
    agenda_template jsonb, -- Template for meeting agenda
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT MEETING HISTORY (Past reviews)
CREATE TABLE IF NOT EXISTS client_meeting_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    cadence_id uuid REFERENCES client_cadence(id) ON DELETE SET NULL,
    meeting_date timestamptz NOT NULL,
    attendees jsonb DEFAULT '[]', -- Array of {user_id, email, name, attended: boolean}
    agenda jsonb, -- Meeting agenda items
    action_items jsonb DEFAULT '[]', -- Array of {id, title, owner, due_date, status}
    notes text,
    recording_url text,
    exec_pack_url text, -- Link to generated exec pack PDF
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CLIENT DELIVERABLES (Exported artifacts)
CREATE TABLE IF NOT EXISTS client_deliverables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('pilot_plan', 'kpi_dictionary', 'weekly_pack', 'exec_pack', 'custom')),
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    file_size bigint,
    mime_type text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid
);

-- UPDATE OS_INSTANCES TO LINK TO CLIENT PROJECTS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'os_instances' AND column_name = 'client_project_id') THEN
        ALTER TABLE os_instances ADD COLUMN client_project_id uuid REFERENCES client_projects(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'os_instances' AND column_name = 'is_preview') THEN
        ALTER TABLE os_instances ADD COLUMN is_preview boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- UPDATE PREVIEW_WORKSPACES TO LINK TO OPPORTUNITIES AND ACCOUNTS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preview_workspaces' AND column_name = 'account_id') THEN
        ALTER TABLE preview_workspaces ADD COLUMN account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preview_workspaces' AND column_name = 'opportunity_id') THEN
        ALTER TABLE preview_workspaces ADD COLUMN opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preview_workspaces' AND column_name = 'preview_url') THEN
        ALTER TABLE preview_workspaces ADD COLUMN preview_url text;
    END IF;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_client_projects_org ON client_projects(org_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_account ON client_projects(account_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_opportunity ON client_projects(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_client_projects_next_review ON client_projects(next_review_date) WHERE next_review_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_client_intake_packs_org ON client_intake_packs(org_id);
CREATE INDEX IF NOT EXISTS idx_client_intake_packs_account ON client_intake_packs(account_id);
CREATE INDEX IF NOT EXISTS idx_client_intake_packs_opportunity ON client_intake_packs(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_client_intake_packs_preview ON client_intake_packs(preview_workspace_id);

CREATE INDEX IF NOT EXISTS idx_client_data_sources_project ON client_data_sources(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_data_sources_status ON client_data_sources(status);

CREATE INDEX IF NOT EXISTS idx_client_data_mappings_project ON client_data_mappings(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_data_mappings_data_source ON client_data_mappings(data_source_id);
CREATE INDEX IF NOT EXISTS idx_client_data_mappings_target_kpi ON client_data_mappings(target_kpi_key);

CREATE INDEX IF NOT EXISTS idx_client_kpi_catalog_project ON client_kpi_catalog(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_kpi_catalog_metric_key ON client_kpi_catalog(metric_key);

CREATE INDEX IF NOT EXISTS idx_client_alert_rules_project ON client_alert_rules(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_alert_rules_kpi ON client_alert_rules(kpi_key);
CREATE INDEX IF NOT EXISTS idx_client_alert_rules_active ON client_alert_rules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_client_cadence_project ON client_cadence(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_cadence_active ON client_cadence(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_client_meeting_history_project ON client_meeting_history(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_meeting_history_date ON client_meeting_history(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_meeting_history_cadence ON client_meeting_history(cadence_id);

CREATE INDEX IF NOT EXISTS idx_client_deliverables_project ON client_deliverables(client_project_id);
CREATE INDEX IF NOT EXISTS idx_client_deliverables_type ON client_deliverables(type);
CREATE INDEX IF NOT EXISTS idx_client_deliverables_created ON client_deliverables(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_os_instances_client_project ON os_instances(client_project_id);
CREATE INDEX IF NOT EXISTS idx_os_instances_is_preview ON os_instances(is_preview);

CREATE INDEX IF NOT EXISTS idx_preview_workspaces_account ON preview_workspaces(account_id);
CREATE INDEX IF NOT EXISTS idx_preview_workspaces_opportunity ON preview_workspaces(opportunity_id);

-- UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS update_client_projects_updated_at ON client_projects;
CREATE TRIGGER update_client_projects_updated_at
    BEFORE UPDATE ON client_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_intake_packs_updated_at ON client_intake_packs;
CREATE TRIGGER update_client_intake_packs_updated_at
    BEFORE UPDATE ON client_intake_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_data_sources_updated_at ON client_data_sources;
CREATE TRIGGER update_client_data_sources_updated_at
    BEFORE UPDATE ON client_data_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_data_mappings_updated_at ON client_data_mappings;
CREATE TRIGGER update_client_data_mappings_updated_at
    BEFORE UPDATE ON client_data_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_kpi_catalog_updated_at ON client_kpi_catalog;
CREATE TRIGGER update_client_kpi_catalog_updated_at
    BEFORE UPDATE ON client_kpi_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_alert_rules_updated_at ON client_alert_rules;
CREATE TRIGGER update_client_alert_rules_updated_at
    BEFORE UPDATE ON client_alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_cadence_updated_at ON client_cadence;
CREATE TRIGGER update_client_cadence_updated_at
    BEFORE UPDATE ON client_cadence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_meeting_history_updated_at ON client_meeting_history;
CREATE TRIGGER update_client_meeting_history_updated_at
    BEFORE UPDATE ON client_meeting_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_intake_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_data_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_kpi_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_cadence ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_meeting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_deliverables ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR CLIENT_PROJECTS
CREATE POLICY "client_projects_select" ON client_projects
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_projects_insert" ON client_projects
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'SALES'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_projects_update" ON client_projects
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'SALES'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_projects_delete" ON client_projects
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_INTAKE_PACKS
CREATE POLICY "client_intake_packs_select" ON client_intake_packs
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_intake_packs_insert" ON client_intake_packs
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'SALES'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_intake_packs_update" ON client_intake_packs
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'SALES'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_intake_packs_delete" ON client_intake_packs
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_DATA_SOURCES
CREATE POLICY "client_data_sources_select" ON client_data_sources
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_data_sources_insert" ON client_data_sources
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_data_sources_update" ON client_data_sources
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_data_sources_delete" ON client_data_sources
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_DATA_MAPPINGS
CREATE POLICY "client_data_mappings_select" ON client_data_mappings
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_data_mappings_insert" ON client_data_mappings
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_data_mappings_update" ON client_data_mappings
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_data_mappings_delete" ON client_data_mappings
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_KPI_CATALOG
CREATE POLICY "client_kpi_catalog_select" ON client_kpi_catalog
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_kpi_catalog_insert" ON client_kpi_catalog
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_kpi_catalog_update" ON client_kpi_catalog
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_kpi_catalog_delete" ON client_kpi_catalog
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_ALERT_RULES
CREATE POLICY "client_alert_rules_select" ON client_alert_rules
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_alert_rules_insert" ON client_alert_rules
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_alert_rules_update" ON client_alert_rules
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_alert_rules_delete" ON client_alert_rules
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_CADENCE
CREATE POLICY "client_cadence_select" ON client_cadence
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_cadence_insert" ON client_cadence
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_cadence_update" ON client_cadence
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_cadence_delete" ON client_cadence
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_MEETING_HISTORY
CREATE POLICY "client_meeting_history_select" ON client_meeting_history
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_meeting_history_insert" ON client_meeting_history
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_meeting_history_update" ON client_meeting_history
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_meeting_history_delete" ON client_meeting_history
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CLIENT_DELIVERABLES
CREATE POLICY "client_deliverables_select" ON client_deliverables
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "client_deliverables_insert" ON client_deliverables
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "client_deliverables_delete" ON client_deliverables
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );


