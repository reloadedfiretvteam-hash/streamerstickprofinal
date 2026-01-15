-- Email Campaign Tracking Table
-- Tracks customers who purchased or took free trial for automated email campaigns

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('purchase', 'free_trial')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  trial_id TEXT, -- For free trial tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'unsubscribed')),
  
  -- Email schedule tracking
  first_email_sent_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ,
  next_email_scheduled_at TIMESTAMPTZ,
  emails_sent_count INTEGER DEFAULT 0,
  
  -- Campaign phases
  phase TEXT NOT NULL DEFAULT 'weekly' CHECK (phase IN ('weekly', 'monthly')),
  week_emails_sent INTEGER DEFAULT 0, -- Track emails sent in first week (max 2)
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active campaign per email
  UNIQUE(customer_email, campaign_type, status) WHERE status = 'active'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_email ON email_campaigns(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_next_scheduled ON email_campaigns(next_email_scheduled_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_email_campaigns_phase ON email_campaigns(phase) WHERE status = 'active';

-- Email send history table
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('weekly_reminder', 'monthly_reminder')),
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  provider TEXT, -- 'resend', 'mailchannels', etc.
  provider_id TEXT, -- Provider's email ID
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_email ON email_sends(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_email_campaigns_updated_at();

-- RLS Policies
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage campaigns
CREATE POLICY "Service role can manage email campaigns"
  ON email_campaigns
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email sends"
  ON email_sends
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users (admin) to view campaigns
CREATE POLICY "Authenticated users can view email campaigns"
  ON email_campaigns
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view email sends"
  ON email_sends
  FOR SELECT
  USING (auth.role() = 'authenticated');
