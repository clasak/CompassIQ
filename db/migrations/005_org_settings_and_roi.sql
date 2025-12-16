-- ============================================================
-- 005_org_settings_and_roi.sql
-- Organization settings for ROI defaults and alert thresholds
-- ============================================================

-- ORG SETTINGS TABLE
CREATE TABLE org_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    roi_defaults jsonb NOT NULL DEFAULT '{}',
    alert_thresholds jsonb NOT NULL DEFAULT '{}',
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_org_settings_org_id ON org_settings(org_id);

-- UPDATED_AT TRIGGER
CREATE TRIGGER update_org_settings_updated_at BEFORE UPDATE ON org_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ORG_SETTINGS
-- SELECT: members can view settings
CREATE POLICY "org_settings_select" ON org_settings
    FOR SELECT USING (is_member(org_id));

-- INSERT: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_settings_insert" ON org_settings
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- UPDATE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_settings_update" ON org_settings
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- DELETE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_settings_delete" ON org_settings
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );


