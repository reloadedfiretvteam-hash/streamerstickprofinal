/*
  # Simple Admin Login System

  ## Purpose
  Create a simple admin credentials table for the custom admin dashboard login.

  ## New Tables
  1. `admin_credentials` - Store admin login credentials
    - username (unique)
    - password_hash (stores plain password for now)
    - email
    - role
    - last_login
    - is_active

  ## Default Admin Account
  - Username: admin
  - Password: admin (same as username)
  - Email: reloadedfirestvteam@gmail.com

  ## Security
  - RLS enabled
  - Public can read for login verification
  - Only authenticated users can modify
*/

-- Create admin credentials table
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

-- Insert default admin account
INSERT INTO admin_credentials (username, password_hash, email, role)
VALUES ('admin', 'admin', 'reloadedfirestvteam@gmail.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read for login verification
CREATE POLICY "Anyone can read admin credentials for login"
  ON admin_credentials FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated admins can modify credentials"
  ON admin_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

-- Create index for faster login lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON admin_credentials(email);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_active ON admin_credentials(is_active);
