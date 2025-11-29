-- ===========================================
-- SUPABASE SQL - NO CONFLICTS VERSION
-- Copy this ENTIRE file into Supabase SQL Editor
-- Safe to run multiple times - handles conflicts
-- ===========================================

-- Step 1: Create admin_credentials table (only if it doesn't exist)
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

-- Step 2: Enable Row Level Security
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read admin credentials for login" ON admin_credentials;
DROP POLICY IF EXISTS "Only authenticated admins can modify credentials" ON admin_credentials;

-- Step 4: Create policies
CREATE POLICY "Anyone can read admin credentials for login"
  ON admin_credentials FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated admins can modify credentials"
  ON admin_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Insert admin account (only if it doesn't exist)
INSERT INTO admin_credentials (username, password_hash, email, role)
VALUES ('admin', 'admin', 'reloadedfirestvteam@gmail.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- Step 6: Create or replace timestamp update function
CREATE OR REPLACE FUNCTION update_admin_credentials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Drop trigger if exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_admin_credentials_timestamp ON admin_credentials;

-- Step 8: Create trigger
CREATE TRIGGER update_admin_credentials_timestamp
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_credentials_timestamp();

-- ===========================================
-- VERIFICATION QUERY (Optional - run after)
-- ===========================================
-- Uncomment the line below to verify the admin account was created:
-- SELECT * FROM admin_credentials WHERE username = 'admin';

-- ===========================================
-- DONE! You should see "Success" message
-- ===========================================
-- Login credentials:
-- Username: admin
-- Password: admin

