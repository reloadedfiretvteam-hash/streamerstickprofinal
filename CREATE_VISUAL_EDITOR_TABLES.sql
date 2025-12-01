-- ============================================================
-- VISUAL WEBSITE EDITOR - Database Tables
-- Run this to enable visual click-to-edit functionality
-- ============================================================

-- Table for storing editable website sections/content
CREATE TABLE IF NOT EXISTS editable_sections (
  id text PRIMARY KEY,
  section_type text NOT NULL, -- 'hero', 'text', 'button', 'image', etc.
  content text NOT NULL,
  styles jsonb DEFAULT '{}',
  position text DEFAULT 'auto',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE editable_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read editable sections" ON editable_sections;
CREATE POLICY "Public can read editable sections"
  ON editable_sections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage editable sections" ON editable_sections;
CREATE POLICY "Authenticated users can manage editable sections"
  ON editable_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update trigger
DROP TRIGGER IF EXISTS update_editable_sections_timestamp ON editable_sections;
CREATE TRIGGER update_editable_sections_timestamp 
  BEFORE UPDATE ON editable_sections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMPLETE!
-- ============================================================




