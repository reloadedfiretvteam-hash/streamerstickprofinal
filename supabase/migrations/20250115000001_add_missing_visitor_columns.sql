/*
  # Add Missing Columns to Visitors Table
  
  The visitors table was created with minimal columns, but the tracking code
  needs additional geographic and technical fields. This migration adds them.
*/

-- Add missing columns to visitors table
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS region_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS latitude text,
ADD COLUMN IF NOT EXISTS longitude text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS isp text,
ADD COLUMN IF NOT EXISTS is_proxy boolean DEFAULT false;

-- Drop old policies to recreate them properly
DROP POLICY IF EXISTS "Allow anonymous insert visitors" ON visitors;
DROP POLICY IF EXISTS "Allow authenticated view visitors" ON visitors;
DROP POLICY IF EXISTS "Anyone can insert visitors" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can view all visitors" ON visitors;

-- Create comprehensive RLS policies
-- Allow anonymous and authenticated users to INSERT (for tracking)
CREATE POLICY "Allow insert visitors"
  ON visitors
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Allow service_role (for admin queries) and authenticated users to SELECT
CREATE POLICY "Allow read visitors"
  ON visitors
  FOR SELECT
  TO authenticated, service_role
  USING (true);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_page_url ON visitors(page_url);
