/*
  # Fix Visitor Tracking Errors

  1. Changes to visitor_analytics
    - Rename visitor_analytics references to use existing 'visitors' table
    
  2. Fix RLS Policies on visitors table
    - Add WITH CHECK policy for INSERT operations
    - Allow anonymous users to insert visitor records
    - Allow authenticated users to view visitor data
    
  3. Create missing visitor_analytics table (if code references it)
    - Add proper columns for analytics tracking
    - Enable RLS with appropriate policies
*/

-- ============================================
-- PART 1: Fix visitors table RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert visitors" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can view all visitors" ON visitors;

-- Recreate with proper WITH CHECK clause
CREATE POLICY "Allow anonymous insert visitors"
  ON visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated view visitors"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- PART 2: Create visitor_analytics table if missing
-- ============================================

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page_view text NOT NULL,
  referrer text,
  device_type text DEFAULT 'desktop',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on visitor_analytics
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visitor_id ON visitor_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_created_at ON visitor_analytics(created_at);

-- Add RLS policies for visitor_analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'visitor_analytics' AND policyname = 'Allow anonymous insert analytics'
  ) THEN
    CREATE POLICY "Allow anonymous insert analytics"
      ON visitor_analytics
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'visitor_analytics' AND policyname = 'Allow authenticated view analytics'
  ) THEN
    CREATE POLICY "Allow authenticated view analytics"
      ON visitor_analytics
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================
-- PART 3: Add comments
-- ============================================

COMMENT ON TABLE visitors IS 'Tracks visitor sessions and page visits';
COMMENT ON TABLE visitor_analytics IS 'Detailed analytics for visitor behavior tracking';
COMMENT ON POLICY "Allow anonymous insert visitors" ON visitors IS 'Allows anonymous users to insert visitor tracking data';
COMMENT ON POLICY "Allow anonymous insert analytics" ON visitor_analytics IS 'Allows anonymous users to insert analytics data';
