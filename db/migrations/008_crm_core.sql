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

-- ACCOUNTS (note: accounts table already exists in 001_init.sql, but we'll ensure it has the fields we need)
-- The existing accounts table has: id, org_id, name, segment, industry, status, renewal_date, health_override, created_at, created_by, updated_at, updated_by
-- We'll add website and notes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'website') THEN
        ALTER TABLE accounts ADD COLUMN website text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'notes') THEN
        ALTER TABLE accounts ADD COLUMN notes text;
    END IF;
END $$;

-- CONTACTS (note: contacts table already exists in 001_init.sql)
-- The existing contacts table has: id, org_id, account_id, name, email, phone, title, created_at, created_by, updated_at, updated_by
-- It already has the fields we need, so we don't need to modify it

-- OPPORTUNITIES (note: opportunities table already exists in 001_init.sql)
-- The existing opportunities table has: id, org_id, account_id, name, stage, amount, close_date, source, owner_user_id, created_at, created_by, updated_at, updated_by
-- We need to add owner_id alias and ensure stage can be 'discovery' (it uses opportunity_stage_enum)
-- Let's check if we need to add a new stage or use existing ones
-- Existing stages: 'LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'
-- We'll use 'LEAD' as equivalent to 'discovery' for now, or we can add a new enum value
-- For simplicity, we'll map 'discovery' to 'LEAD' in the application layer

-- Add owner_id column if it doesn't exist (as alias to owner_user_id for consistency)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'owner_id') THEN
        ALTER TABLE opportunities ADD COLUMN owner_id uuid;
        -- Copy data from owner_user_id if it exists
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
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
-- SELECT: org members
CREATE POLICY "leads_select" ON leads
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN only, not demo org
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
-- SELECT: org members
CREATE POLICY "quotes_select" ON quotes
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN only, not demo org
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
-- SELECT: org members
CREATE POLICY "quote_line_items_select" ON quote_line_items
    FOR SELECT USING (is_member(org_id));

-- INSERT/UPDATE/DELETE: OWNER/ADMIN only, not demo org
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

