/*
  # Update Admin Credentials
  
  This migration updates the admin_credentials table to set the correct credentials
  as specified in the user requirements:
  - Username: starevan11
  - Password: starevan11
  
  It also removes any old 'admin' user that may have been created previously.
  
  ⚠️  SECURITY NOTE: This stores the password in plain text in the password_hash field.
      This is for development/demo purposes. In production, use proper password hashing.
*/

-- First, delete any old 'admin' user if it exists
DELETE FROM admin_credentials WHERE username = 'admin';

-- Delete any existing 'Starevan11$' user (old incorrect credentials)
DELETE FROM admin_credentials WHERE username = 'Starevan11$';

-- Upsert the correct admin credentials
INSERT INTO admin_credentials (username, email, password_hash)
VALUES ('starevan11', 'reloadedfiretvteam@gmail.com', 'starevan11')
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = 'starevan11',
  updated_at = now();
