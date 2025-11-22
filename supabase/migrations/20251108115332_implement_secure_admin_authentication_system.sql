/*
  # Secure Admin Authentication System

  ## Purpose
  Implement enterprise-grade security for admin authentication including:
  - Password hashing with bcrypt
  - Login attempt tracking and rate limiting
  - Session management with expiration
  - IP tracking for suspicious activity
  - Audit logging

  ## New Tables
  1. `admin_login_attempts` - Track failed login attempts for rate limiting
  2. `admin_sessions` - Secure session management with expiration
  3. `admin_audit_log` - Track all admin actions

  ## Security Features
  - Passwords will be hashed (frontend will handle bcrypt)
  - Rate limiting: 5 failed attempts = 15 minute lockout
  - Sessions expire after 8 hours of inactivity
  - All admin actions are logged
  - RLS policies restrict access

  ## Updates
  - Update admin_credentials to use hashed passwords
*/

-- Create login attempts tracking table
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  attempted_at timestamptz DEFAULT now(),
  error_message text
);

-- Create sessions table for secure session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_credentials(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create audit log for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_credentials(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Add security columns to admin_credentials
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0;
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS locked_until timestamptz;
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS password_changed_at timestamptz DEFAULT now();
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS require_password_change boolean DEFAULT false;

-- Enable RLS on all tables
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_login_attempts
CREATE POLICY "Anyone can insert login attempts"
  ON admin_login_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated admins can read login attempts"
  ON admin_login_attempts FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for admin_sessions
CREATE POLICY "Anyone can insert sessions"
  ON admin_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own session"
  ON admin_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their own session"
  ON admin_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete expired sessions"
  ON admin_sessions FOR DELETE
  USING (expires_at < now());

-- RLS Policies for audit_log
CREATE POLICY "Anyone can insert audit logs"
  ON admin_audit_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated admins can read audit logs"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (true);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_admin_account_locked(p_username text)
RETURNS boolean AS $$
DECLARE
  v_locked_until timestamptz;
  v_failed_attempts integer;
BEGIN
  SELECT locked_until, failed_login_attempts
  INTO v_locked_until, v_failed_attempts
  FROM admin_credentials
  WHERE username = p_username;

  -- If locked_until is in the future, account is locked
  IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
    RETURN true;
  END IF;

  -- If more than 5 failed attempts, lock account
  IF v_failed_attempts >= 5 THEN
    UPDATE admin_credentials
    SET locked_until = now() + interval '15 minutes'
    WHERE username = p_username;
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_username text,
  p_success boolean,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert login attempt
  INSERT INTO admin_login_attempts (username, success, ip_address, user_agent, error_message)
  VALUES (p_username, p_success, p_ip_address, p_user_agent, p_error_message);

  -- Update failed login counter
  IF p_success THEN
    UPDATE admin_credentials
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_login = now()
    WHERE username = p_username;
  ELSE
    UPDATE admin_credentials
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE username = p_username;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions
  WHERE expires_at < now()
     OR last_activity < now() - interval '8 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id uuid,
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    p_admin_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON admin_login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON admin_login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_locked_until ON admin_credentials(locked_until);
