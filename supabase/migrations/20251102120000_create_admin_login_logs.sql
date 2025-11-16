/*
  # Admin Login Logs Table
  
  1. New Table
    - admin_login_logs: Track all admin login attempts
  
  2. Security
    - Enable RLS
    - Only admins can view logs
*/

CREATE TABLE IF NOT EXISTS admin_login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_credentials(id),
  username text NOT NULL,
  login_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  success boolean DEFAULT true
);

ALTER TABLE admin_login_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view logs
CREATE POLICY "Admins can view login logs"
  ON admin_login_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- System can insert logs
CREATE POLICY "System can insert login logs"
  ON admin_login_logs
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_admin_login_logs_admin ON admin_login_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_date ON admin_login_logs(login_at DESC);
