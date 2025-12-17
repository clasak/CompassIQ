-- ============================================================
-- 014_construction_rls.sql
-- RLS policies for construction tables
-- ============================================================

-- CONSTRUCTION PROJECTS
-- SELECT: org members can view
CREATE POLICY "construction_projects_select" ON construction_projects
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "construction_projects_insert" ON construction_projects
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_projects_update" ON construction_projects
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_projects_delete" ON construction_projects
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- COST CODES
CREATE POLICY "construction_cost_codes_select" ON construction_cost_codes
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_cost_codes_insert" ON construction_cost_codes
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_cost_codes_update" ON construction_cost_codes
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_cost_codes_delete" ON construction_cost_codes
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- JOB COST SNAPSHOTS
CREATE POLICY "construction_job_cost_snapshots_select" ON construction_job_cost_snapshots
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_job_cost_snapshots_insert" ON construction_job_cost_snapshots
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_job_cost_snapshots_update" ON construction_job_cost_snapshots
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_job_cost_snapshots_delete" ON construction_job_cost_snapshots
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- SCHEDULE MILESTONES
CREATE POLICY "construction_schedule_milestones_select" ON construction_schedule_milestones
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_schedule_milestones_insert" ON construction_schedule_milestones
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_schedule_milestones_update" ON construction_schedule_milestones
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_schedule_milestones_delete" ON construction_schedule_milestones
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- CHANGE ORDERS
CREATE POLICY "construction_change_orders_select" ON construction_change_orders
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_change_orders_insert" ON construction_change_orders
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_change_orders_update" ON construction_change_orders
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_change_orders_delete" ON construction_change_orders
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- LABOR ENTRIES
CREATE POLICY "construction_labor_entries_select" ON construction_labor_entries
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_labor_entries_insert" ON construction_labor_entries
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_labor_entries_update" ON construction_labor_entries
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_labor_entries_delete" ON construction_labor_entries
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- EQUIPMENT LOGS
CREATE POLICY "construction_equipment_logs_select" ON construction_equipment_logs
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_equipment_logs_insert" ON construction_equipment_logs
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_equipment_logs_update" ON construction_equipment_logs
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_equipment_logs_delete" ON construction_equipment_logs
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

-- INVOICES
CREATE POLICY "construction_invoices_select" ON construction_invoices
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "construction_invoices_insert" ON construction_invoices
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_invoices_update" ON construction_invoices
    FOR UPDATE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "construction_invoices_delete" ON construction_invoices
    FOR DELETE USING (
        is_member(org_id) AND
        get_user_role(org_id) = ANY (ARRAY['OWNER'::role_enum, 'ADMIN'::role_enum]) AND
        NOT is_demo_org(org_id)
    );


