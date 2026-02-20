-- ============================================
-- EMAIL MARKETING SYSTEM
-- contacts + campaigns + sends
-- ============================================

-- Rename legacy email tables to avoid conflicts (keep data just in case)
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_sends' AND table_schema = 'public') THEN
    ALTER TABLE email_sends RENAME TO email_sends_legacy;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public') THEN
    ALTER TABLE email_campaigns RENAME TO email_campaigns_legacy;
  END IF;
END $$;

-- 1. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  source TEXT NOT NULL CHECK (source IN ('free_trial', 'subscription', 'firestick')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  is_subscribed BOOLEAN DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
CREATE INDEX IF NOT EXISTS contacts_source_idx ON contacts(source);
CREATE INDEX IF NOT EXISTS contacts_subscribed_idx ON contacts(is_subscribed);
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts(created_at);

-- 2. EMAIL CAMPAIGNS TABLE (marketing campaigns)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  segment JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS email_campaigns_status_idx ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS email_campaigns_created_at_idx ON email_campaigns(created_at);

-- 3. EMAIL SENDS TABLE (per-contact send tracking)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS email_sends_campaign_idx ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS email_sends_contact_idx ON email_sends(contact_id);
CREATE INDEX IF NOT EXISTS email_sends_status_idx ON email_sends(status);

-- RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access contacts"
  ON contacts FOR ALL USING (true);

CREATE POLICY "Service role full access email_campaigns"
  ON email_campaigns FOR ALL USING (true);

CREATE POLICY "Service role full access email_sends"
  ON email_sends FOR ALL USING (true);

-- Backfill contacts from existing orders (subscription/firestick customers)
INSERT INTO contacts (email, first_name, source, last_activity_at, is_subscribed)
SELECT DISTINCT ON (customer_email)
  customer_email,
  customer_name,
  CASE
    WHEN LOWER(COALESCE(real_product_id, '')) LIKE '%firestick%' THEN 'firestick'
    ELSE 'subscription'
  END,
  created_at,
  true
FROM orders
WHERE customer_email IS NOT NULL AND customer_email != ''
ORDER BY customer_email, created_at DESC
ON CONFLICT (email) DO NOTHING;
