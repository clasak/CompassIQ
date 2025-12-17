-- ============================================================
-- 010_os_generator.sql
-- OS Template Library, Workspace OS Generation, Alerts, Tasks, Cadence, Exec Packets
-- ============================================================

-- OS TEMPLATES
CREATE TABLE IF NOT EXISTS os_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    version int NOT NULL DEFAULT 1,
    template_json jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- OS INSTANCES (workspace-level published OS)
CREATE TABLE IF NOT EXISTS os_instances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id uuid NOT NULL REFERENCES os_templates(id) ON DELETE RESTRICT,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at timestamptz,
    created_by text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ALERTS (OS execution alerts)
CREATE TABLE IF NOT EXISTS alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    os_instance_id uuid NOT NULL REFERENCES os_instances(id) ON DELETE CASCADE,
    kpi_key text,
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    type text NOT NULL CHECK (type IN ('threshold', 'trend', 'anomaly', 'forecast')),
    title text NOT NULL,
    description text,
    state text NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
    disposition text,
    owner text,
    due_at timestamptz,
    resolved_at timestamptz,
    source_ref jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- OS TASKS (OS execution tasks - note: separate from existing tasks table)
CREATE TABLE IF NOT EXISTS os_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    alert_id uuid REFERENCES alerts(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    owner text NOT NULL,
    state text NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'in_progress', 'done', 'canceled')),
    due_at timestamptz,
    completed_at timestamptz,
    proof jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- CADENCE ITEMS
CREATE TABLE IF NOT EXISTS cadence_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    os_instance_id uuid NOT NULL REFERENCES os_instances(id) ON DELETE CASCADE,
    cadence text NOT NULL CHECK (cadence IN ('daily', 'weekly', 'monthly')),
    title text NOT NULL,
    rules_json jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- EXEC PACKETS
CREATE TABLE IF NOT EXISTS exec_packets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    os_instance_id uuid NOT NULL REFERENCES os_instances(id) ON DELETE CASCADE,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    packet_json jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_os_instances_org ON os_instances(org_id);
CREATE INDEX IF NOT EXISTS idx_os_instances_template ON os_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_os_instances_status ON os_instances(status);

CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(org_id);
CREATE INDEX IF NOT EXISTS idx_alerts_os_instance ON alerts(os_instance_id);
CREATE INDEX IF NOT EXISTS idx_alerts_state ON alerts(state);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_kpi_key ON alerts(kpi_key);

CREATE INDEX IF NOT EXISTS idx_os_tasks_org ON os_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_os_tasks_alert ON os_tasks(alert_id);
CREATE INDEX IF NOT EXISTS idx_os_tasks_state ON os_tasks(state);

CREATE INDEX IF NOT EXISTS idx_cadence_items_org ON cadence_items(org_id);
CREATE INDEX IF NOT EXISTS idx_cadence_items_os_instance ON cadence_items(os_instance_id);
CREATE INDEX IF NOT EXISTS idx_cadence_items_cadence ON cadence_items(cadence);

CREATE INDEX IF NOT EXISTS idx_exec_packets_org ON exec_packets(org_id);
CREATE INDEX IF NOT EXISTS idx_exec_packets_os_instance ON exec_packets(os_instance_id);
CREATE INDEX IF NOT EXISTS idx_exec_packets_period ON exec_packets(period_start, period_end);

-- UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS update_os_templates_updated_at ON os_templates;
CREATE TRIGGER update_os_templates_updated_at
    BEFORE UPDATE ON os_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_os_instances_updated_at ON os_instances;
CREATE TRIGGER update_os_instances_updated_at
    BEFORE UPDATE ON os_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_os_tasks_updated_at ON os_tasks;
CREATE TRIGGER update_os_tasks_updated_at
    BEFORE UPDATE ON os_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cadence_items_updated_at ON cadence_items;
CREATE TRIGGER update_cadence_items_updated_at
    BEFORE UPDATE ON cadence_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE os_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_packets ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR OS_TEMPLATES
-- SELECT: all authenticated users (templates are public/read-only)
CREATE POLICY "os_templates_select" ON os_templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE/DELETE: Blocked (templates are system-level, managed via seed/migrations)
CREATE POLICY "os_templates_insert_block" ON os_templates
    FOR INSERT WITH CHECK (false);

CREATE POLICY "os_templates_update_block" ON os_templates
    FOR UPDATE USING (false);

CREATE POLICY "os_templates_delete_block" ON os_templates
    FOR DELETE USING (false);

-- RLS POLICIES FOR OS_INSTANCES
-- SELECT: org members
CREATE POLICY "os_instances_select" ON os_instances
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN only, not demo org
CREATE POLICY "os_instances_insert" ON os_instances
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "os_instances_update" ON os_instances
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "os_instances_delete" ON os_instances
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR ALERTS
-- SELECT: org members
CREATE POLICY "alerts_select" ON alerts
    FOR SELECT USING (is_member(org_id));

-- INSERT: OWNER/ADMIN only, not demo org (system creates alerts on publish)
CREATE POLICY "alerts_insert" ON alerts
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- UPDATE: OWNER/ADMIN/OPS/FINANCE can update (assign, resolve, etc), not demo org
CREATE POLICY "alerts_update" ON alerts
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- DELETE: OWNER/ADMIN only, not demo org
CREATE POLICY "alerts_delete" ON alerts
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR OS_TASKS
-- SELECT: org members
CREATE POLICY "os_tasks_select" ON os_tasks
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN/OPS/FINANCE, not demo org
CREATE POLICY "os_tasks_insert" ON os_tasks
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "os_tasks_update" ON os_tasks
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "os_tasks_delete" ON os_tasks
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR CADENCE_ITEMS
-- SELECT: org members
CREATE POLICY "cadence_items_select" ON cadence_items
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN only, not demo org (system creates on publish)
CREATE POLICY "cadence_items_insert" ON cadence_items
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "cadence_items_update" ON cadence_items
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "cadence_items_delete" ON cadence_items
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR EXEC_PACKETS
-- SELECT: org members
CREATE POLICY "exec_packets_select" ON exec_packets
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN/OPS/FINANCE, not demo org
CREATE POLICY "exec_packets_insert" ON exec_packets
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "exec_packets_update" ON exec_packets
    FOR UPDATE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum, 'OPS'::role_enum, 'FINANCE'::role_enum])
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "exec_packets_delete" ON exec_packets
    FOR DELETE USING (
        is_member(org_id) 
        AND get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum])
        AND NOT is_demo_org(org_id)
    );




