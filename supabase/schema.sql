-- CLM Territory Tracker — Supabase Schema
-- Run this in your Supabase project SQL Editor

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  contact_name TEXT,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Visited', 'Interested', 'Not Interested', 'Follow Up', 'Closed')),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  estimated_deal_value DECIMAL(12, 2),
  pipeline_stage TEXT,
  service_interests TEXT[] DEFAULT '{}',
  notes TEXT,
  follow_up_date DATE,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time TIME,
  outcome TEXT NOT NULL CHECK (outcome IN ('No Answer', 'Not Interested', 'Interested', 'Left Info', 'Callback Scheduled', 'Closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_follow_up_date ON businesses(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_visits_business_id ON visits(business_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Policies: users only see their own data
CREATE POLICY "businesses_own" ON businesses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visits_own" ON visits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
