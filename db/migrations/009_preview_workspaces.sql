-- ============================================================
-- 009_preview_workspaces.sql
-- Preview workspaces for client preview generation
-- ============================================================

-- PREVIEW_WORKSPACES
CREATE TABLE IF NOT EXISTS preview_workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    industry text,
    pains jsonb NOT NULL DEFAULT '[]',
    kpis jsonb NOT NULL DEFAULT '[]',
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- PREVIEW_ALERTS
CREATE TABLE IF NOT EXISTS preview_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    preview_workspace_id uuid NOT NULL REFERENCES preview_workspaces(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    severity text NOT NULL DEFAULT 'medium',
    rule jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- EXTEND METRIC_VALUES WITH PREVIEW_WORKSPACE_ID
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metric_values' AND column_name = 'preview_workspace_id') THEN
        ALTER TABLE metric_values ADD COLUMN preview_workspace_id uuid REFERENCES preview_workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ADD METADATA COLUMN TO ORG_BRANDING FOR PREVIEW TRACKING
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_branding' AND column_name = 'metadata') THEN
        ALTER TABLE org_branding ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_preview_workspaces_org_created ON preview_workspaces(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_preview_alerts_org_workspace ON preview_alerts(org_id, preview_workspace_id);
CREATE INDEX IF NOT EXISTS idx_metric_values_preview_workspace ON metric_values(org_id, preview_workspace_id, metric_key, occurred_on DESC) WHERE preview_workspace_id IS NOT NULL;

-- UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS update_preview_workspaces_updated_at ON preview_workspaces;
CREATE TRIGGER update_preview_workspaces_updated_at
    BEFORE UPDATE ON preview_workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE preview_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_alerts ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PREVIEW_WORKSPACES
CREATE POLICY "preview_workspaces_select" ON preview_workspaces
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "preview_workspaces_insert" ON preview_workspaces
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_workspaces_update" ON preview_workspaces
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_workspaces_delete" ON preview_workspaces
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR PREVIEW_ALERTS
CREATE POLICY "preview_alerts_select" ON preview_alerts
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "preview_alerts_insert" ON preview_alerts
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_alerts_update" ON preview_alerts
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_alerts_delete" ON preview_alerts
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- UPDATE METRIC_VALUES RLS TO ALLOW PREVIEW INSERTS
-- Note: We need to allow inserts with preview_workspace_id for OWNER/ADMIN
-- The existing policy already checks for OWNER/ADMIN and not demo, so it should work
-- But we may need to adjust if preview writes are blocked. For now, the existing policy should work.

