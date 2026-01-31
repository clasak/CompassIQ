-- ============================================================
-- 013_construction_data_model.sql
-- Construction-specific data model: projects, cost, schedule, change orders, labor, equipment, AR
-- ============================================================

-- ENUMS
DO $$ BEGIN
    CREATE TYPE construction_project_status_enum AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE change_order_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BILLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM ('DRAFT', 'SENT', 'OVERDUE', 'PAID', 'VOID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CONSTRUCTION PROJECTS/JOBS
CREATE TABLE construction_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    preview_workspace_id uuid REFERENCES preview_workspaces(id) ON DELETE SET NULL,
    name text NOT NULL,
    job_number text,
    customer_name text,
    status construction_project_status_enum NOT NULL DEFAULT 'PLANNING',
    start_date date,
    end_date date,
    pm_name text,
    superintendent text,
    region text,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- COST CODES (master data)
CREATE TABLE construction_cost_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(org_id, code)
);

-- JOB COST SNAPSHOTS (budget vs actual by cost code)
CREATE TABLE construction_job_cost_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    snapshot_date date NOT NULL,
    cost_code_id uuid REFERENCES construction_cost_codes(id) ON DELETE SET NULL,
    budget numeric NOT NULL DEFAULT 0,
    committed numeric NOT NULL DEFAULT 0,
    actual_cost numeric NOT NULL DEFAULT 0,
    percent_complete numeric,
    earned_value numeric,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- SCHEDULE MILESTONES
CREATE TABLE construction_schedule_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    baseline_date date,
    forecast_date date,
    actual_date date,
    status text NOT NULL DEFAULT 'PENDING',
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- CHANGE ORDERS
CREATE TABLE construction_change_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    number text NOT NULL,
    title text NOT NULL,
    status change_order_status_enum NOT NULL DEFAULT 'PENDING',
    amount numeric NOT NULL DEFAULT 0,
    submitted_date date,
    approved_date date,
    billed_date date,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- LABOR ENTRIES
CREATE TABLE construction_labor_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    work_date date NOT NULL,
    crew text,
    trade text,
    hours numeric NOT NULL DEFAULT 0,
    cost numeric NOT NULL DEFAULT 0,
    units_completed numeric,
    cost_code_id uuid REFERENCES construction_cost_codes(id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- EQUIPMENT LOGS
CREATE TABLE construction_equipment_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    equipment_name text NOT NULL,
    date date NOT NULL,
    hours_used numeric NOT NULL DEFAULT 0,
    idle_hours numeric NOT NULL DEFAULT 0,
    location text,
    cost numeric NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- AR INVOICES
CREATE TABLE construction_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES construction_projects(id) ON DELETE SET NULL,
    invoice_number text NOT NULL,
    customer text NOT NULL,
    invoice_date date NOT NULL,
    due_date date NOT NULL,
    amount numeric NOT NULL DEFAULT 0,
    balance numeric NOT NULL DEFAULT 0,
    status invoice_status_enum NOT NULL DEFAULT 'DRAFT',
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- INDEXES
CREATE INDEX idx_construction_projects_org_id ON construction_projects(org_id);
CREATE INDEX idx_construction_projects_status ON construction_projects(org_id, status);
CREATE INDEX idx_construction_projects_preview_workspace ON construction_projects(preview_workspace_id);
CREATE INDEX idx_construction_cost_codes_org_id ON construction_cost_codes(org_id);
CREATE INDEX idx_construction_job_cost_snapshots_org_project ON construction_job_cost_snapshots(org_id, project_id);
CREATE INDEX idx_construction_job_cost_snapshots_date ON construction_job_cost_snapshots(org_id, snapshot_date);
CREATE INDEX idx_construction_schedule_milestones_org_project ON construction_schedule_milestones(org_id, project_id);
CREATE INDEX idx_construction_change_orders_org_project ON construction_change_orders(org_id, project_id);
CREATE INDEX idx_construction_change_orders_status ON construction_change_orders(org_id, status);
CREATE INDEX idx_construction_labor_entries_org_project ON construction_labor_entries(org_id, project_id);
CREATE INDEX idx_construction_labor_entries_date ON construction_labor_entries(org_id, work_date);
CREATE INDEX idx_construction_equipment_logs_org_project ON construction_equipment_logs(org_id, project_id);
CREATE INDEX idx_construction_equipment_logs_date ON construction_equipment_logs(org_id, date);
CREATE INDEX idx_construction_invoices_org_project ON construction_invoices(org_id, project_id);
CREATE INDEX idx_construction_invoices_status ON construction_invoices(org_id, status);
CREATE INDEX idx_construction_invoices_due_date ON construction_invoices(org_id, due_date);

-- UPDATED_AT TRIGGERS
CREATE TRIGGER update_construction_projects_updated_at BEFORE UPDATE ON construction_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_cost_codes_updated_at BEFORE UPDATE ON construction_cost_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_job_cost_snapshots_updated_at BEFORE UPDATE ON construction_job_cost_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_schedule_milestones_updated_at BEFORE UPDATE ON construction_schedule_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_change_orders_updated_at BEFORE UPDATE ON construction_change_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_labor_entries_updated_at BEFORE UPDATE ON construction_labor_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_equipment_logs_updated_at BEFORE UPDATE ON construction_equipment_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_invoices_updated_at BEFORE UPDATE ON construction_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE construction_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_job_cost_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_schedule_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_equipment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_invoices ENABLE ROW LEVEL SECURITY;
