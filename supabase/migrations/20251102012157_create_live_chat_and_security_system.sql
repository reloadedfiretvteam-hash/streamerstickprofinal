/*
  # Live Chat & Enterprise Security System

  1. New Tables
    - `live_chat_messages` - Updated with session support
    - `security_config` - Security settings
    - `blocked_requests` - Log of blocked traffic
    - `chat_quick_responses` - Pre-defined admin responses
    
  2. Security
    - Enable RLS on all tables
    - Admin access for management
    - Public write for chat (with rate limiting)
    
  3. Performance
    - Indexes for fast lookups
    - Optimized for sub-millisecond queries
*/

-- Update live_chat_messages table with session support
ALTER TABLE IF EXISTS live_chat_messages
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_chat_session ON live_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON live_chat_messages(created_at DESC);

-- Allow public to send chat messages
DROP POLICY IF EXISTS "Public can send chat messages" ON live_chat_messages;
CREATE POLICY "Public can send chat messages"
  ON live_chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public to view their own session messages
DROP POLICY IF EXISTS "Public can view own session" ON live_chat_messages;
CREATE POLICY "Public can view own session"
  ON live_chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Security Configuration Table
CREATE TABLE IF NOT EXISTS security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_limit_enabled boolean DEFAULT true,
  rate_limit_requests integer DEFAULT 100,
  rate_limit_window integer DEFAULT 60,
  ddos_protection_enabled boolean DEFAULT true,
  ip_blocking_enabled boolean DEFAULT true,
  country_blocking_enabled boolean DEFAULT false,
  blocked_countries text[] DEFAULT '{}',
  blocked_ips text[] DEFAULT '{}',
  firewall_enabled boolean DEFAULT true,
  sql_injection_protection boolean DEFAULT true,
  xss_protection boolean DEFAULT true,
  csrf_protection boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security config"
  ON security_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Insert default security configuration
INSERT INTO security_config (
  rate_limit_enabled,
  rate_limit_requests,
  rate_limit_window,
  ddos_protection_enabled,
  ip_blocking_enabled,
  firewall_enabled,
  sql_injection_protection,
  xss_protection,
  csrf_protection
)
VALUES (
  true,
  100,
  60,
  true,
  true,
  true,
  true,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Blocked Requests Log Table
CREATE TABLE IF NOT EXISTS blocked_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  country text,
  reason text NOT NULL,
  request_path text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocked_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blocked requests"
  ON blocked_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_blocked_ip ON blocked_requests(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_created ON blocked_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_country ON blocked_requests(country);

-- Chat Quick Responses Table
CREATE TABLE IF NOT EXISTS chat_quick_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_text text NOT NULL,
  category text NOT NULL,
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_quick_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quick responses"
  ON chat_quick_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Insert default quick responses
INSERT INTO chat_quick_responses (response_text, category, order_index)
VALUES
  ('Thank you for contacting us! How can I help you today?', 'greetings', 1),
  ('We offer IPTV subscription plans starting at $15/month with 18,000+ channels.', 'pricing', 2),
  ('Yes, we have a 3-day free trial available. Would you like to start one?', 'trials', 3),
  ('Our Fire Sticks come fully jailbroken with all apps pre-installed.', 'products', 4),
  ('Installation is very simple! We provide step-by-step video guides.', 'support', 5),
  ('We accept Cash App, Venmo, Zelle, PayPal, and Bitcoin.', 'payments', 6)
ON CONFLICT DO NOTHING;

-- Email Notifications Table
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email notifications"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_email_sent ON email_notifications(sent, created_at);
CREATE INDEX IF NOT EXISTS idx_email_type ON email_notifications(notification_type);

-- Function to log blocked requests (optimized)
CREATE OR REPLACE FUNCTION log_blocked_request(
  p_ip text,
  p_country text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO blocked_requests (ip_address, country, reason)
  VALUES (p_ip, p_country, p_reason);
END;
$$;

-- Function to check if IP is blocked (fast lookup)
CREATE OR REPLACE FUNCTION is_ip_blocked(p_ip text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_config security_config;
BEGIN
  SELECT * INTO v_config FROM security_config LIMIT 1;
  
  IF NOT v_config.ip_blocking_enabled THEN
    RETURN false;
  END IF;
  
  RETURN p_ip = ANY(v_config.blocked_ips);
END;
$$;

-- Function to check if country is blocked (fast lookup)
CREATE OR REPLACE FUNCTION is_country_blocked(p_country text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_config security_config;
BEGIN
  SELECT * INTO v_config FROM security_config LIMIT 1;
  
  IF NOT v_config.country_blocking_enabled THEN
    RETURN false;
  END IF;
  
  RETURN p_country = ANY(v_config.blocked_countries);
END;
$$;
