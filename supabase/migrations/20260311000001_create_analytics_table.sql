-- Elite SEO / Step 4: analytics table for StreamStickPro
-- Run: supabase db push (or apply via Dashboard SQL editor)

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  page text NOT NULL,
  event_type text DEFAULT 'page_view',
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics(page);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (frontend) and full access for service role
CREATE POLICY "Allow insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Service role full access analytics"
  ON analytics FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE analytics IS 'Elite SEO: page/event analytics for StreamStickPro';
