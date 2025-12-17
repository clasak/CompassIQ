-- ============================================================
-- 011_add_data_origin_metadata.sql
-- Add metadata columns to track data origin (seeded, imported, manual)
-- ============================================================

-- Add metadata column to leads if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'metadata') THEN
        ALTER TABLE leads ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add metadata column to accounts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'metadata') THEN
        ALTER TABLE accounts ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add metadata column to opportunities if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'metadata') THEN
        ALTER TABLE opportunities ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add metadata column to tasks if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'metadata') THEN
        ALTER TABLE tasks ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add metadata column to quotes if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'metadata') THEN
        ALTER TABLE quotes ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Create index on metadata->>'data_origin' for faster filtering (optional but helpful)
CREATE INDEX IF NOT EXISTS idx_leads_metadata_origin ON leads((metadata->>'data_origin'));
CREATE INDEX IF NOT EXISTS idx_accounts_metadata_origin ON accounts((metadata->>'data_origin'));
CREATE INDEX IF NOT EXISTS idx_opportunities_metadata_origin ON opportunities((metadata->>'data_origin'));
CREATE INDEX IF NOT EXISTS idx_tasks_metadata_origin ON tasks((metadata->>'data_origin'));
CREATE INDEX IF NOT EXISTS idx_quotes_metadata_origin ON quotes((metadata->>'data_origin'));


