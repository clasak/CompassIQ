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

