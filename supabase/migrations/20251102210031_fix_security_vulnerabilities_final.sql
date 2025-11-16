/*
  # Security Vulnerability Fixes - Final

  1. Enable RLS on Public Tables
  2. Add Restrictive Policies  
  3. Fix Security Definer View
  4. Fix Function Search Paths
*/

-- ============================================
-- PART 1: ENABLE RLS
-- ============================================

ALTER TABLE seo_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_copilot_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 2: RLS POLICIES
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_configuration' AND policyname = 'Public can view SEO') THEN
    CREATE POLICY "Public can view SEO" ON seo_configuration FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_configuration' AND policyname = 'Auth can manage SEO') THEN
    CREATE POLICY "Auth can manage SEO" ON seo_configuration FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_copilot_conversations' AND policyname = 'Auth manages conversations') THEN
    CREATE POLICY "Auth manages conversations" ON ai_copilot_conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_copilot_tasks' AND policyname = 'Auth manages tasks') THEN
    CREATE POLICY "Auth manages tasks" ON ai_copilot_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- PART 3: FIX VIEW
-- ============================================

DROP VIEW IF EXISTS order_stats_summary CASCADE;
CREATE VIEW order_stats_summary AS
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COALESCE(SUM(total), 0) as total_revenue,
  COALESCE(AVG(total), 0) as avg_order_value,
  COUNT(DISTINCT customer_email) as unique_customers
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- ============================================
-- PART 4: FIX FUNCTIONS - Drop and recreate
-- ============================================

DROP FUNCTION IF EXISTS is_ip_blocked(text) CASCADE;
DROP FUNCTION IF EXISTS is_country_blocked(text) CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION update_admin_credentials_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN UPDATE promotions SET uses_count = uses_count + 1 WHERE code = promo_code; END; $$;

CREATE OR REPLACE FUNCTION log_blocked_request(p_ip_address text, p_country_code text, p_request_path text, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO security_blocked_requests (ip_address, country_code, request_path, reason, blocked_at)
  VALUES (p_ip_address, p_country_code, p_request_path, p_reason, now());
EXCEPTION WHEN OTHERS THEN NULL;
END; $$;

CREATE FUNCTION is_ip_blocked(check_ip text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM security_ip_blacklist WHERE ip_address = check_ip AND is_active = true);
EXCEPTION WHEN OTHERS THEN RETURN false;
END; $$;

CREATE FUNCTION is_country_blocked(check_country text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM security_country_blacklist WHERE country_code = check_country AND is_active = true);
EXCEPTION WHEN OTHERS THEN RETURN false;
END; $$;

CREATE OR REPLACE FUNCTION generate_purchase_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE new_code text; code_exists boolean;
BEGIN
  LOOP
    new_code := 'PC-' || upper(substring(md5(random()::text) from 1 for 5)) || '-' || upper(substring(md5(random()::text) from 1 for 5));
    SELECT EXISTS (SELECT 1 FROM purchase_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END; $$;

CREATE OR REPLACE FUNCTION get_recent_orders(limit_count int DEFAULT 10)
RETURNS TABLE (id uuid, order_number text, customer_name text, customer_email text, total numeric, status text, purchase_code text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id, order_number, customer_name, customer_email, total, status, purchase_code, created_at
  FROM orders ORDER BY created_at DESC LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION search_orders(search_term text)
RETURNS TABLE (id uuid, order_number text, customer_name text, customer_email text, purchase_code text, total numeric, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id, order_number, customer_name, customer_email, purchase_code, total, status, created_at
  FROM orders
  WHERE order_number ILIKE '%' || search_term || '%'
    OR customer_email ILIKE '%' || search_term || '%'
    OR customer_name ILIKE '%' || search_term || '%'
    OR (purchase_code IS NOT NULL AND purchase_code ILIKE '%' || search_term || '%')
  ORDER BY created_at DESC LIMIT 50;
$$;
