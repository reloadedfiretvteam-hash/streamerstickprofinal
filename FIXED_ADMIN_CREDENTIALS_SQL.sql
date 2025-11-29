-- ============================================================
-- FIXED ADMIN CREDENTIALS SQL - NO ERRORS VERSION
-- ============================================================
-- This version handles all conflicts and won't cause errors
-- ============================================================

-- Step 1: Create table if it doesn't exist
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

-- Step 2: Enable RLS (Row Level Security)
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (prevents errors)
DROP POLICY IF EXISTS "Anyone can read admin credentials for login" ON admin_credentials;
DROP POLICY IF EXISTS "Only authenticated admins can modify credentials" ON admin_credentials;
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_credentials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON admin_credentials;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON admin_credentials;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON admin_credentials;

-- Step 4: Create policies
CREATE POLICY "Anyone can read admin credentials for login"
  ON admin_credentials FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated admins can modify credentials"
  ON admin_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Create timestamp update function (drop first to avoid errors)
DROP FUNCTION IF EXISTS update_admin_credentials_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION update_admin_credentials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger (drop first to avoid errors)
DROP TRIGGER IF EXISTS update_admin_credentials_timestamp ON admin_credentials;

CREATE TRIGGER update_admin_credentials_timestamp
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_credentials_timestamp();

-- Step 7: Insert admin user (fixed email typo: firestvteam → firetvteam)
-- Password is plain 'admin' for now (you should hash it properly later)
INSERT INTO admin_credentials (username, password_hash, email, role)
VALUES ('admin', 'admin', 'reloadedfiretvteam@gmail.com', 'superadmin')
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = true;

-- Step 8: Verify it worked
SELECT 
  username, 
  email, 
  role, 
  is_active,
  created_at
FROM admin_credentials
WHERE username = 'admin';

-- ============================================================
-- EXPECTED RESULT:
-- username | email                           | role       | is_active | created_at
-- admin    | reloadedfiretvteam@gmail.com   | superadmin | true      | [timestamp]
-- ============================================================

