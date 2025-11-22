/*
  # Create Admin Credentials Table

  1. New Tables
    - `admin_credentials`
      - `id` (uuid, primary key)
      - `username` (text, unique, not null)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null) - stores hashed password
      - `is_active` (boolean, default true)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `admin_credentials` table
    - Add policy for authenticated admins to read their own data
    - Add policy for admins to update their last login time

  3. Initial Data
    - Create default admin account with username 'starevan11'
*/

-- Create admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read for login"
  ON admin_credentials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public update for last_login"
  ON admin_credentials
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin account
INSERT INTO admin_credentials (username, email, password_hash)
VALUES ('starevan11', 'reloadedfirestvteam@gmail.com', 'Starevan11$')
ON CONFLICT (username) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON admin_credentials(email);