/*
  # Fix Search Path Security Warning
  
  1. Security Fix
    - Drop and recreate `generate_order_code` function with secure search_path
    - This prevents search_path hijacking attacks
    - Sets explicit schema qualification to 'pg_catalog' and 'public'
  
  2. Changes
    - Function `generate_order_code` now has immutable search_path
    - Prevents privilege escalation vulnerabilities
    - Follows PostgreSQL security best practices
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.generate_order_code();

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := 'BTC-' || upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.bitcoin_orders WHERE order_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_order_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_code() TO anon;

-- Add comment
COMMENT ON FUNCTION public.generate_order_code() IS 'Generates unique Bitcoin order codes with secure search_path';
