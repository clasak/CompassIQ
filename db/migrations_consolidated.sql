
-- ============================================================
-- 001_init.sql
-- ============================================================

-- ============================================================
-- 001_init.sql
-- Create enums, tables, indexes, and updated_at triggers
-- ============================================================

-- Ensure required extensions are available (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMS
CREATE TYPE role_enum AS ENUM ('OWNER', 'ADMIN', 'SALES', 'OPS', 'FINANCE', 'VIEWER');
CREATE TYPE opportunity_stage_enum AS ENUM ('LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');
CREATE TYPE work_order_status_enum AS ENUM ('PLANNED', 'IN_PROGRESS', 'BLOCKED', 'DONE');
CREATE TYPE task_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE ticket_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE invoice_status_enum AS ENUM ('DRAFT', 'SENT', 'OVERDUE', 'PAID', 'VOID');
CREATE TYPE activity_type_enum AS ENUM ('CALL', 'EMAIL', 'MEETING', 'SITE_VISIT', 'NOTE');
CREATE TYPE payment_method_enum AS ENUM ('ACH', 'CARD', 'CHECK', 'CASH', 'WIRE', 'OTHER');

-- ORGANIZATIONS
CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    is_demo boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- MEMBERSHIPS
CREATE TABLE memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    role role_enum NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(org_id, user_id)
);

-- ACCOUNTS
CREATE TABLE accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    segment text,
    industry text,
    status text NOT NULL DEFAULT 'ACTIVE',
    renewal_date date,
    health_override numeric,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- LOCATIONS
CREATE TABLE locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name text NOT NULL,
    address1 text,
    address2 text,
    city text,
    state text,
    postal text,
    country text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CONTACTS
CREATE TABLE contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    title text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- OPPORTUNITIES
CREATE TABLE opportunities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name text NOT NULL,
    stage opportunity_stage_enum NOT NULL DEFAULT 'LEAD',
    amount numeric NOT NULL DEFAULT 0,
    close_date date,
    source text,
    owner_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- ACTIVITIES
CREATE TABLE activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
    opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
    type activity_type_enum NOT NULL,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    notes text,
    owner_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- WORK ORDERS
CREATE TABLE work_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title text NOT NULL,
    status work_order_status_enum NOT NULL DEFAULT 'PLANNED',
    priority priority_enum NOT NULL DEFAULT 'MEDIUM',
    due_date date,
    assigned_user_id uuid,
    blocker_reason text,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- TASKS
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    status task_status_enum NOT NULL DEFAULT 'OPEN',
    priority priority_enum NOT NULL DEFAULT 'MEDIUM',
    due_date date,
    assigned_user_id uuid,
    related_type text,
    related_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- INVOICES
CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_number text NOT NULL,
    issue_date date NOT NULL DEFAULT current_date,
    due_date date,
    subtotal numeric NOT NULL DEFAULT 0,
    tax numeric NOT NULL DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    status invoice_status_enum NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- PAYMENTS
CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount numeric NOT NULL DEFAULT 0,
    paid_at timestamptz NOT NULL DEFAULT now(),
    method payment_method_enum NOT NULL DEFAULT 'OTHER',
    reference text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- TICKETS
CREATE TABLE tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title text NOT NULL,
    status ticket_status_enum NOT NULL DEFAULT 'OPEN',
    priority priority_enum NOT NULL DEFAULT 'MEDIUM',
    opened_at timestamptz NOT NULL DEFAULT now(),
    first_response_at timestamptz,
    resolved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- METRIC CATALOG
CREATE TABLE metric_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    formula text,
    source text,
    cadence text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid,
    UNIQUE(org_id, key)
);

-- DATA SOURCES
CREATE TABLE data_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    last_sync_at timestamptz,
    status text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid,
    UNIQUE(org_id, name)
);

-- INDEXES
CREATE INDEX idx_memberships_org_user ON memberships(org_id, user_id);
CREATE INDEX idx_accounts_org_name ON accounts(org_id, name);
CREATE INDEX idx_opportunities_org_stage ON opportunities(org_id, stage);
CREATE INDEX idx_opportunities_org_close_date ON opportunities(org_id, close_date);
CREATE INDEX idx_invoices_org_status ON invoices(org_id, status);
CREATE INDEX idx_invoices_org_due_date ON invoices(org_id, due_date);
CREATE INDEX idx_work_orders_org_status ON work_orders(org_id, status);
CREATE INDEX idx_work_orders_org_due_date ON work_orders(org_id, due_date);
CREATE INDEX idx_tasks_org_assigned ON tasks(org_id, assigned_user_id);
CREATE INDEX idx_tasks_org_due_date ON tasks(org_id, due_date);
CREATE INDEX idx_tasks_org_status ON tasks(org_id, status);
CREATE INDEX idx_tickets_org_status ON tickets(org_id, status);
CREATE INDEX idx_payments_org_invoice ON payments(org_id, invoice_id);
CREATE INDEX idx_activities_org_account ON activities(org_id, account_id);
CREATE INDEX idx_activities_org_opportunity ON activities(org_id, opportunity_id);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- APPLY TRIGGER TO ALL TABLES WITH updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metric_catalog_updated_at BEFORE UPDATE ON metric_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





-- ============================================================
-- 002_rls.sql
-- ============================================================

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



-- ============================================================
-- 003_seed_metric_catalog.sql
-- ============================================================

-- ============================================================
-- 003_seed_metric_catalog.sql
-- Optional starter metrics (will be seeded per org in seed script)
-- ============================================================

-- This migration is optional. The seed script will create metrics per org.
-- You can add default metrics here if desired, but they need org_id context.
-- Leaving this as a placeholder for now.





-- ============================================================
-- 004_invites_and_org_admin.sql
-- ============================================================

-- ============================================================
-- 004_invites_and_org_admin.sql
-- Organization invitations and admin management
-- ============================================================

-- ORG INVITES TABLE
CREATE TABLE org_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    role role_enum NOT NULL DEFAULT 'VIEWER',
    token text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    accepted_at timestamptz,
    accepted_by uuid,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_org_invites_org_email ON org_invites(org_id, email);
CREATE INDEX idx_org_invites_token ON org_invites(token);
CREATE INDEX idx_org_invites_org_id ON org_invites(org_id);

-- UPDATED_AT TRIGGER
CREATE TRIGGER update_org_invites_updated_at BEFORE UPDATE ON org_invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ORG_INVITES
-- SELECT: members of org can view invites
CREATE POLICY "org_invites_select" ON org_invites
    FOR SELECT USING (is_member(org_id));

-- INSERT: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_invites_insert" ON org_invites
    FOR INSERT WITH CHECK (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- UPDATE: only OWNER/ADMIN and NOT demo org (but invite acceptance is handled via RPC)
CREATE POLICY "org_invites_update" ON org_invites
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
CREATE POLICY "org_invites_delete" ON org_invites
    FOR DELETE USING (
        is_member(org_id) AND
        current_role(org_id) IN ('OWNER', 'ADMIN') AND
        NOT is_demo_org(org_id)
    );

-- SECURITY DEFINER RPC: CREATE INVITE
CREATE OR REPLACE FUNCTION create_invite(
    p_org_id uuid,
    p_email text,
    p_role role_enum
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_user_role role_enum;
    v_is_demo boolean;
    v_invite_id uuid;
    v_token text;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- Verify user is member of org
    SELECT role INTO v_user_role
    FROM memberships
    WHERE org_id = p_org_id AND user_id = v_user_id
    LIMIT 1;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'not a member of this organization';
    END IF;

    -- Verify user is OWNER or ADMIN
    IF v_user_role NOT IN ('OWNER', 'ADMIN') THEN
        RAISE EXCEPTION 'insufficient privileges: OWNER or ADMIN required';
    END IF;

    -- Verify not demo org
    SELECT is_demo INTO v_is_demo
    FROM organizations
    WHERE id = p_org_id;

    IF v_is_demo THEN
        RAISE EXCEPTION 'cannot create invites for demo organization';
    END IF;

    -- Generate secure random token
    v_token := encode(gen_random_bytes(32), 'base64');

    -- Insert invite
    INSERT INTO org_invites (org_id, email, role, token, created_by, expires_at)
    VALUES (p_org_id, p_email, p_role, v_token, v_user_id, now() + interval '7 days')
    RETURNING id INTO v_invite_id;

    RETURN v_invite_id;
END;
$$;

-- SECURITY DEFINER RPC: ACCEPT INVITE
CREATE OR REPLACE FUNCTION accept_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_invite_record RECORD;
    v_org_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- Lookup invite by token
    SELECT id, org_id, email, role, accepted_at, expires_at
    INTO v_invite_record
    FROM org_invites
    WHERE token = p_token
    LIMIT 1;

    IF v_invite_record.id IS NULL THEN
        RAISE EXCEPTION 'invalid invite token';
    END IF;

    -- Check if already accepted
    IF v_invite_record.accepted_at IS NOT NULL THEN
        RAISE EXCEPTION 'invite has already been accepted';
    END IF;

    -- Check if expired
    IF v_invite_record.expires_at < now() THEN
        RAISE EXCEPTION 'invite has expired';
    END IF;

    v_org_id := v_invite_record.org_id;

    -- Create membership if not exists
    INSERT INTO memberships (org_id, user_id, role)
    VALUES (v_org_id, v_user_id, v_invite_record.role)
    ON CONFLICT (org_id, user_id) DO UPDATE
    SET role = v_invite_record.role, updated_at = now();

    -- Mark invite as accepted
    UPDATE org_invites
    SET accepted_at = now(),
        accepted_by = v_user_id
    WHERE id = v_invite_record.id;

    RETURN v_org_id;
END;
$$;

-- SECURITY DEFINER RPC: UPDATE MEMBER ROLE
CREATE OR REPLACE FUNCTION update_member_role(
    p_org_id uuid,
    p_user_id uuid,
    p_role role_enum
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_requester_id uuid;
    v_requester_role role_enum;
    v_is_demo boolean;
    v_current_owner_count integer;
BEGIN
    v_requester_id := auth.uid();
    IF v_requester_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- Verify requester is member of org
    SELECT role INTO v_requester_role
    FROM memberships
    WHERE org_id = p_org_id AND user_id = v_requester_id
    LIMIT 1;

    IF v_requester_role IS NULL THEN
        RAISE EXCEPTION 'not a member of this organization';
    END IF;

    -- Verify not demo org
    SELECT is_demo INTO v_is_demo
    FROM organizations
    WHERE id = p_org_id;

    IF v_is_demo THEN
        RAISE EXCEPTION 'cannot modify roles in demo organization';
    END IF;

    -- Only OWNER can assign OWNER role
    IF p_role = 'OWNER' AND v_requester_role != 'OWNER' THEN
        RAISE EXCEPTION 'only OWNER can assign OWNER role';
    END IF;

    -- Verify requester is OWNER or ADMIN
    IF v_requester_role NOT IN ('OWNER', 'ADMIN') THEN
        RAISE EXCEPTION 'insufficient privileges: OWNER or ADMIN required';
    END IF;

    -- Prevent removing last OWNER (if changing from OWNER to something else)
    IF EXISTS (
        SELECT 1 FROM memberships
        WHERE org_id = p_org_id AND user_id = p_user_id AND role = 'OWNER'
    ) AND p_role != 'OWNER' THEN
        SELECT COUNT(*) INTO v_current_owner_count
        FROM memberships
        WHERE org_id = p_org_id AND role = 'OWNER';

        IF v_current_owner_count <= 1 THEN
            RAISE EXCEPTION 'cannot remove the last OWNER from organization';
        END IF;
    END IF;

    -- Update role
    UPDATE memberships
    SET role = p_role, updated_at = now()
    WHERE org_id = p_org_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'membership not found';
    END IF;
END;
$$;




-- ============================================================
-- 005_org_settings_and_roi.sql
-- ============================================================

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




-- ============================================================
-- 006_branding.sql
-- ============================================================

-- ============================================================
-- 006_branding.sql
-- Per-organization branding (name, logos, colors) + Storage policies
-- ============================================================

-- ORG BRANDING TABLE
CREATE TABLE IF NOT EXISTS org_branding (
    org_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    brand_name text NOT NULL DEFAULT 'CompassIQ',
    tagline text,
    logo_light_url text,
    logo_dark_url text,
    mark_url text,
    primary_color text NOT NULL DEFAULT '#0A192F',
    accent_color text NOT NULL DEFAULT '#007BFF',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS update_org_branding_updated_at ON org_branding;
CREATE TRIGGER update_org_branding_updated_at BEFORE UPDATE ON org_branding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE org_branding ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ORG_BRANDING
DROP POLICY IF EXISTS "org_branding_select" ON org_branding;
DROP POLICY IF EXISTS "org_branding_insert" ON org_branding;
DROP POLICY IF EXISTS "org_branding_update" ON org_branding;
DROP POLICY IF EXISTS "org_branding_delete" ON org_branding;

-- SELECT: members can read branding
CREATE POLICY "org_branding_select" ON org_branding
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = org_branding.org_id AND m.user_id = auth.uid()
        )
    );

-- INSERT: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_branding_insert" ON org_branding
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- UPDATE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_branding_update" ON org_branding
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- DELETE: only OWNER/ADMIN and NOT demo org
CREATE POLICY "org_branding_delete" ON org_branding
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = org_branding.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- PUBLIC BRANDING LOOKUP (for login page display without auth)
-- Returns only non-sensitive branding fields and merges defaults when org_branding row is missing.
CREATE OR REPLACE FUNCTION get_public_branding(p_org_slug text)
RETURNS TABLE (
    brand_name text,
    tagline text,
    logo_light_url text,
    logo_dark_url text,
    mark_url text,
    primary_color text,
    accent_color text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id uuid;
BEGIN
    SELECT id INTO v_org_id
    FROM organizations
    WHERE slug = p_org_slug
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        COALESCE(ob.brand_name, 'CompassIQ') AS brand_name,
        ob.tagline,
        ob.logo_light_url,
        ob.logo_dark_url,
        ob.mark_url,
        COALESCE(ob.primary_color, '#0A192F') AS primary_color,
        COALESCE(ob.accent_color, '#007BFF') AS accent_color
    FROM org_branding ob
    WHERE ob.org_id = v_org_id;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            'CompassIQ'::text AS brand_name,
            NULL::text AS tagline,
            NULL::text AS logo_light_url,
            NULL::text AS logo_dark_url,
            NULL::text AS mark_url,
            '#0A192F'::text AS primary_color,
            '#007BFF'::text AS accent_color;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_branding(text) TO anon, authenticated;

-- ============================================================
-- SUPABASE STORAGE: brand-assets bucket + org-scoped policies
-- ============================================================

-- Create bucket (public for simple logo rendering; assets are org-scoped by path + policy)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Safe UUID parsing helper for Storage RLS expressions
CREATE OR REPLACE FUNCTION safe_uuid(p_text text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN p_text::uuid;
EXCEPTION WHEN others THEN
    RETURN NULL;
END;
$$;

-- Storage object policies for org-scoped brand assets
DROP POLICY IF EXISTS "brand_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "brand_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "brand_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "brand_assets_delete" ON storage.objects;

CREATE POLICY "brand_assets_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "brand_assets_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    );

CREATE POLICY "brand_assets_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    )
    WITH CHECK (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    );

CREATE POLICY "brand_assets_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'brand-assets' AND
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = public.safe_uuid(split_part(name, '/', 1))
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        ) AND
        split_part(name, '/', 2) ~ '^(logo-light|logo-dark|mark)\\.'
    );



-- ============================================================
-- 007_ingestion.sql
-- ============================================================

-- ============================================================
-- 007_ingestion.sql
-- Real ingestion: connections, runs, raw events, field mappings, and metric values
-- ============================================================

-- SOURCE CONNECTIONS
CREATE TABLE IF NOT EXISTS source_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('csv', 'webhook')),
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    config jsonb NOT NULL DEFAULT '{}'::jsonb, -- do NOT store plaintext secrets
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_source_connections_org_id ON source_connections(org_id);
CREATE INDEX IF NOT EXISTS idx_source_connections_org_type ON source_connections(org_id, type);

ALTER TABLE source_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "source_connections_select" ON source_connections;
DROP POLICY IF EXISTS "source_connections_insert" ON source_connections;
DROP POLICY IF EXISTS "source_connections_update" ON source_connections;
DROP POLICY IF EXISTS "source_connections_delete" ON source_connections;

CREATE POLICY "source_connections_select" ON source_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = source_connections.org_id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "source_connections_insert" ON source_connections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_connections.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "source_connections_update" ON source_connections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_connections.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_connections.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "source_connections_delete" ON source_connections
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_connections.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- SOURCE RUNS
CREATE TABLE IF NOT EXISTS source_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_connection_id uuid NOT NULL REFERENCES source_connections(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('queued', 'running', 'success', 'failed')),
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    rows_in int NOT NULL DEFAULT 0,
    rows_valid int NOT NULL DEFAULT 0,
    rows_invalid int NOT NULL DEFAULT 0,
    error text
);

CREATE INDEX IF NOT EXISTS idx_source_runs_org_id ON source_runs(org_id);
CREATE INDEX IF NOT EXISTS idx_source_runs_org_started_at ON source_runs(org_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_runs_org_connection_started_at ON source_runs(org_id, source_connection_id, started_at DESC);

ALTER TABLE source_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "source_runs_select" ON source_runs;
DROP POLICY IF EXISTS "source_runs_insert" ON source_runs;
DROP POLICY IF EXISTS "source_runs_update" ON source_runs;
DROP POLICY IF EXISTS "source_runs_delete" ON source_runs;

CREATE POLICY "source_runs_select" ON source_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = source_runs.org_id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "source_runs_insert" ON source_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_runs.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "source_runs_update" ON source_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_runs.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_runs.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "source_runs_delete" ON source_runs
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = source_runs.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- RAW EVENTS
CREATE TABLE IF NOT EXISTS raw_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_connection_id uuid REFERENCES source_connections(id) ON DELETE SET NULL,
    received_at timestamptz NOT NULL DEFAULT now(),
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    dedupe_hash text NOT NULL,
    UNIQUE(org_id, dedupe_hash)
);

CREATE INDEX IF NOT EXISTS idx_raw_events_org_received_at ON raw_events(org_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_events_org_connection_received_at ON raw_events(org_id, source_connection_id, received_at DESC);

ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "raw_events_select" ON raw_events;
DROP POLICY IF EXISTS "raw_events_insert" ON raw_events;
DROP POLICY IF EXISTS "raw_events_update" ON raw_events;
DROP POLICY IF EXISTS "raw_events_delete" ON raw_events;

CREATE POLICY "raw_events_select" ON raw_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = raw_events.org_id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "raw_events_insert" ON raw_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = raw_events.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "raw_events_update" ON raw_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = raw_events.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = raw_events.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "raw_events_delete" ON raw_events
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = raw_events.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- FIELD MAPPINGS
CREATE TABLE IF NOT EXISTS field_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_connection_id uuid NOT NULL REFERENCES source_connections(id) ON DELETE CASCADE,
    target text NOT NULL DEFAULT 'metric_values',
    mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
    transform jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_field_mappings_unique ON field_mappings(org_id, source_connection_id, target);
CREATE INDEX IF NOT EXISTS idx_field_mappings_org_id ON field_mappings(org_id);

DROP TRIGGER IF EXISTS update_field_mappings_updated_at ON field_mappings;
CREATE TRIGGER update_field_mappings_updated_at BEFORE UPDATE ON field_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "field_mappings_select" ON field_mappings;
DROP POLICY IF EXISTS "field_mappings_insert" ON field_mappings;
DROP POLICY IF EXISTS "field_mappings_update" ON field_mappings;
DROP POLICY IF EXISTS "field_mappings_delete" ON field_mappings;

CREATE POLICY "field_mappings_select" ON field_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = field_mappings.org_id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "field_mappings_insert" ON field_mappings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = field_mappings.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "field_mappings_update" ON field_mappings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = field_mappings.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = field_mappings.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "field_mappings_delete" ON field_mappings
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = field_mappings.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- METRIC VALUES (normalized)
CREATE TABLE IF NOT EXISTS metric_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_key text NOT NULL,
    value_num numeric,
    value_text text,
    occurred_on date NOT NULL,
    source text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metric_values_org_metric_date ON metric_values(org_id, metric_key, occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_metric_values_org_date ON metric_values(org_id, occurred_on DESC);

ALTER TABLE metric_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metric_values_select" ON metric_values;
DROP POLICY IF EXISTS "metric_values_insert" ON metric_values;
DROP POLICY IF EXISTS "metric_values_update" ON metric_values;
DROP POLICY IF EXISTS "metric_values_delete" ON metric_values;

CREATE POLICY "metric_values_select" ON metric_values
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.org_id = metric_values.org_id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "metric_values_insert" ON metric_values
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = metric_values.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "metric_values_update" ON metric_values
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = metric_values.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = metric_values.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

CREATE POLICY "metric_values_delete" ON metric_values
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM memberships m
            JOIN organizations o ON o.id = m.org_id
            WHERE m.org_id = metric_values.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('OWNER', 'ADMIN')
              AND NOT o.is_demo
        )
    );

-- Latest metric values view (for freshness/KPI overrides)
DROP VIEW IF EXISTS metric_values_latest;
CREATE VIEW metric_values_latest AS
SELECT DISTINCT ON (org_id, metric_key)
    org_id,
    metric_key,
    value_num,
    value_text,
    occurred_on,
    source,
    created_at
FROM metric_values
ORDER BY org_id, metric_key, occurred_on DESC, created_at DESC;


-- ============================================================
-- 008_crm_core.sql
-- CRM core tables: leads, accounts, contacts, opportunities, quotes, quote_line_items
-- ============================================================

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    company text,
    email text,
    phone text,
    source text,
    status text NOT NULL DEFAULT 'new',
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ACCOUNTS: Add website and notes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'website') THEN
        ALTER TABLE accounts ADD COLUMN website text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'notes') THEN
        ALTER TABLE accounts ADD COLUMN notes text;
    END IF;
END $$;

-- OPPORTUNITIES: Add owner_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'owner_id') THEN
        ALTER TABLE opportunities ADD COLUMN owner_id uuid;
        UPDATE opportunities SET owner_id = owner_user_id WHERE owner_user_id IS NOT NULL;
    END IF;
END $$;

-- QUOTES
CREATE TABLE IF NOT EXISTS quotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'draft',
    currency text NOT NULL DEFAULT 'USD',
    one_time_total numeric NOT NULL DEFAULT 0,
    recurring_total numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- QUOTE_LINE_ITEMS
CREATE TABLE IF NOT EXISTS quote_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('one_time', 'recurring')),
    title text NOT NULL,
    description text,
    qty numeric NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL DEFAULT 0,
    total numeric GENERATED ALWAYS AS (qty * unit_price) STORED,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_org_created ON leads(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_org_created ON quotes(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_org_account ON quotes(org_id, account_id);
CREATE INDEX IF NOT EXISTS idx_quotes_org_opportunity ON quotes(org_id, opportunity_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_org_quote ON quote_line_items(org_id, quote_id);

-- UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR LEADS
CREATE POLICY "leads_select" ON leads
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "leads_insert" ON leads
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "leads_update" ON leads
    FOR UPDATE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "leads_delete" ON leads
    FOR DELETE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR QUOTES
CREATE POLICY "quotes_select" ON quotes
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "quotes_insert" ON quotes
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "quotes_update" ON quotes
    FOR UPDATE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "quotes_delete" ON quotes
    FOR DELETE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR QUOTE_LINE_ITEMS
CREATE POLICY "quote_line_items_select" ON quote_line_items
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "quote_line_items_insert" ON quote_line_items
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "quote_line_items_update" ON quote_line_items
    FOR UPDATE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "quote_line_items_delete" ON quote_line_items
    FOR DELETE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

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
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_workspaces_update" ON preview_workspaces
    FOR UPDATE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_workspaces_delete" ON preview_workspaces
    FOR DELETE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

-- RLS POLICIES FOR PREVIEW_ALERTS
CREATE POLICY "preview_alerts_select" ON preview_alerts
    FOR SELECT USING (is_member(org_id));

CREATE POLICY "preview_alerts_insert" ON preview_alerts
    FOR INSERT WITH CHECK (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_alerts_update" ON preview_alerts
    FOR UPDATE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );

CREATE POLICY "preview_alerts_delete" ON preview_alerts
    FOR DELETE USING (
        is_member(org_id) 
        AND current_role(org_id) IN ('OWNER', 'ADMIN')
        AND NOT is_demo_org(org_id)
    );



