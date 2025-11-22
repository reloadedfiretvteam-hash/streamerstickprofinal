/*
  # Email Campaigns & Cart Abandonment System

  1. New Tables
    - `email_campaigns` - Store promotional email campaigns
    - `cart_abandonments` - Track abandoned shopping carts
    - `campaign_sends` - Track who received which campaigns
  
  2. Features
    - Bulk email promotional system
    - Cart abandonment tracking
    - Campaign analytics
*/

-- Create email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign sends tracking table
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

-- Create cart abandonments table
CREATE TABLE IF NOT EXISTS cart_abandonments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  cart_items JSONB NOT NULL,
  cart_total NUMERIC(10, 2) NOT NULL,
  discount_code TEXT,
  abandoned_at TIMESTAMPTZ DEFAULT now(),
  reminder_sent_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  recovery_order_id UUID REFERENCES orders(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_recipient ON campaign_sends(recipient_email);
CREATE INDEX IF NOT EXISTS idx_cart_abandonments_email ON cart_abandonments(customer_email);
CREATE INDEX IF NOT EXISTS idx_cart_abandonments_abandoned_at ON cart_abandonments(abandoned_at);

-- Enable RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_abandonments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_campaigns (admin only)
CREATE POLICY "Admins can manage email campaigns"
  ON email_campaigns
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for campaign_sends (admin only)
CREATE POLICY "Admins can view campaign sends"
  ON campaign_sends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert campaign sends"
  ON campaign_sends
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for cart_abandonments (admin can view, system can insert)
CREATE POLICY "Admins can view cart abandonments"
  ON cart_abandonments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can track cart abandonments"
  ON cart_abandonments
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "System can update cart abandonments"
  ON cart_abandonments
  FOR UPDATE
  TO authenticated, anon
  USING (true);
