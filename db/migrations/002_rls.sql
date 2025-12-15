-- ============================================================
-- 002_rls.sql
-- RLS helper functions and policies
-- ============================================================

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_member(org uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.org_id = org AND m.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_role(org uuid)
RETURNS role_enum AS $$
BEGIN
    RETURN (
        SELECT role FROM memberships
        WHERE org_id = org AND user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_demo_org(org uuid)
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT is_demo FROM organizations WHERE id = org
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- BOOTSTRAP: CREATE ORG + OWNER MEMBERSHIP (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION create_organization_with_owner(p_name text, p_slug text)
RETURNS uuid AS $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    INSERT INTO organizations (name, slug, is_demo)
    VALUES (p_name, p_slug, false)
    RETURNING id INTO v_org_id;

    INSERT INTO memberships (org_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'OWNER');

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ENABLE RLS ON ALL ORG-SCOPED TABLES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS POLICIES
-- Members can view their org(s)
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = organizations.id AND m.user_id = auth.uid()
        )
    );

-- Org creation is done through the SECURITY DEFINER function `create_organization_with_owner`
-- Block direct inserts from clients to reduce risk.
CREATE POLICY "organizations_insert_block" ON organizations
    FOR INSERT WITH CHECK (false);

-- Only OWNER/ADMIN members can update/delete org metadata (never demo)
CREATE POLICY "organizations_update" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = organizations.id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER','ADMIN')
        )
        AND NOT organizations.is_demo
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = organizations.id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER','ADMIN')
        )
        AND NOT organizations.is_demo
    );

CREATE POLICY "organizations_delete" ON organizations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = organizations.id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER','ADMIN')
        )
        AND NOT organizations.is_demo
    );

-- MEMBERSHIPS POLICIES
CREATE POLICY "memberships_select" ON memberships
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "memberships_insert" ON memberships
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "memberships_update" ON memberships
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

CREATE POLICY "memberships_delete" ON memberships
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- ACCOUNTS POLICIES
CREATE POLICY "accounts_select" ON accounts
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "accounts_insert" ON accounts
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "accounts_update" ON accounts
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "accounts_delete" ON accounts
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- LOCATIONS POLICIES
CREATE POLICY "locations_select" ON locations
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "locations_insert" ON locations
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "locations_update" ON locations
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "locations_delete" ON locations
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- CONTACTS POLICIES
CREATE POLICY "contacts_select" ON contacts
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "contacts_insert" ON contacts
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "contacts_update" ON contacts
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "contacts_delete" ON contacts
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- OPPORTUNITIES POLICIES
CREATE POLICY "opportunities_select" ON opportunities
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "opportunities_insert" ON opportunities
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "opportunities_update" ON opportunities
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "opportunities_delete" ON opportunities
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES') AND
        NOT is_demo_org(org_id)
    );

-- ACTIVITIES POLICIES
CREATE POLICY "activities_select" ON activities
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "activities_insert" ON activities
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "activities_update" ON activities
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "activities_delete" ON activities
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS') AND
        NOT is_demo_org(org_id)
    );

-- WORK ORDERS POLICIES
CREATE POLICY "work_orders_select" ON work_orders
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "work_orders_insert" ON work_orders
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "work_orders_update" ON work_orders
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "work_orders_delete" ON work_orders
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS') AND
        NOT is_demo_org(org_id)
    );

-- TASKS POLICIES
CREATE POLICY "tasks_select" ON tasks
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "tasks_insert" ON tasks
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "tasks_update" ON tasks
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "tasks_delete" ON tasks
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

-- INVOICES POLICIES
CREATE POLICY "invoices_select" ON invoices
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "invoices_insert" ON invoices
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "invoices_update" ON invoices
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "invoices_delete" ON invoices
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

-- PAYMENTS POLICIES
CREATE POLICY "payments_select" ON payments
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "payments_insert" ON payments
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "payments_update" ON payments
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "payments_delete" ON payments
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'FINANCE') AND
        NOT is_demo_org(org_id)
    );

-- TICKETS POLICIES
CREATE POLICY "tickets_select" ON tickets
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "tickets_insert" ON tickets
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "tickets_update" ON tickets
    FOR UPDATE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES') AND
        NOT is_demo_org(org_id)
    )
    WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN', 'OPS', 'SALES') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "tickets_delete" ON tickets
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- METRIC CATALOG POLICIES
CREATE POLICY "metric_catalog_select" ON metric_catalog
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "metric_catalog_insert" ON metric_catalog
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "metric_catalog_update" ON metric_catalog
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

CREATE POLICY "metric_catalog_delete" ON metric_catalog
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- DATA SOURCES POLICIES
CREATE POLICY "data_sources_select" ON data_sources
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "data_sources_insert" ON data_sources
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

CREATE POLICY "data_sources_update" ON data_sources
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

CREATE POLICY "data_sources_delete" ON data_sources
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );
