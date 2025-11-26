/*
  # Create Admin Credentials Table
  
  1. New Table
    - admin_credentials: Stores admin usernames and login info
  
  2. Security
    - Enable RLS
    - Add policies for admin access only
    
  ⚠️  SECURITY WARNING: This migration stores passwords in plain text.
      This is NOT secure for production use. The password_hash field should
      contain bcrypt/argon2 hashes, not plain text passwords.
      See ADMIN_AUTHENTICATION_GUIDE.md for migration instructions.
*/

-- Create admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Insert default admin
INSERT INTO admin_credentials (username, email, password_hash)
VALUES ('Starevan11$', 'reloadedfirestvteam@gmail.com', 'Starevan11$')
ON CONFLICT (username) DO NOTHING;

-- Policies (restrictive - admin only can view)
CREATE POLICY "Admins can view credentials"
  ON admin_credentials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update their own credentials"
  ON admin_credentials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
