-- Email open tracking events for admin marketing campaigns
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_hash TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS email_events_unique_contact_event
  ON email_events (campaign_id, contact_id, event_type);

CREATE INDEX IF NOT EXISTS email_events_campaign_idx
  ON email_events (campaign_id, created_at DESC);

CREATE INDEX IF NOT EXISTS email_events_contact_idx
  ON email_events (contact_id, created_at DESC);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_events'
      AND policyname = 'Service role full access email_events'
  ) THEN
    CREATE POLICY "Service role full access email_events"
      ON email_events
      FOR ALL
      USING (true);
  END IF;
END $$;
