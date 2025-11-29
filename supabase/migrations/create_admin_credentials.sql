-- Create admin credentials table for admin panel login
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read for login verification
DROP POLICY IF EXISTS "Anyone can read admin credentials for login" ON admin_credentials;
CREATE POLICY "Anyone can read admin credentials for login"
  ON admin_credentials FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can modify credentials" ON admin_credentials;
CREATE POLICY "Only authenticated admins can modify credentials"
  ON admin_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin account
-- Username: admin
-- Password: admin
INSERT INTO admin_credentials (username, password_hash, email, role)
VALUES ('admin', 'admin', 'reloadedfirestvteam@gmail.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_admin_credentials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_admin_credentials_timestamp ON admin_credentials;
CREATE TRIGGER update_admin_credentials_timestamp
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_credentials_timestamp();

