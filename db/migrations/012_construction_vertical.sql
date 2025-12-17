-- ============================================================
-- 012_construction_vertical.sql
-- Add vertical setting to org_settings for construction verticalization
-- ============================================================

-- Add vertical column to org_settings (default 'general')
ALTER TABLE org_settings
ADD COLUMN IF NOT EXISTS vertical text NOT NULL DEFAULT 'general';

-- Add construction_defaults JSONB for construction-specific thresholds
ALTER TABLE org_settings
ADD COLUMN IF NOT EXISTS construction_defaults jsonb NOT NULL DEFAULT '{}';

-- Add index for vertical filtering
CREATE INDEX IF NOT EXISTS idx_org_settings_vertical ON org_settings(vertical);

-- Update existing org_settings to have vertical='general' if NULL (shouldn't happen due to DEFAULT, but safe)
UPDATE org_settings SET vertical = 'general' WHERE vertical IS NULL;


