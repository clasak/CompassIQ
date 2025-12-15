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


