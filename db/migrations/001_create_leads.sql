-- CompassIQ Leads Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  size TEXT,
  location TEXT,
  pain_points TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'research' CHECK (status IN ('research', 'outreach', 'call-scheduled', 'proposal', 'won', 'lost')),
  estimated_value INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  last_contact TIMESTAMPTZ,
  next_action TEXT,
  notes TEXT,
  emails_sent INTEGER DEFAULT 0,
  responses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security (optional - add policies as needed)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (restrict later with auth)
CREATE POLICY "Allow all operations on leads" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
