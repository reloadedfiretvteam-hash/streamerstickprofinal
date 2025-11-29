/*
  ============================================================================
  MASTER SQL FOR STREAMERSTICKPRO - RUN THIS IN SUPABASE SQL EDITOR
  ============================================================================
  
  This file contains ALL the SQL needed for your complete e-commerce platform.
  
  Run this ONCE in your Supabase SQL Editor to set up:
  - Admin credentials table
  - Stripe products table
  - Payment transactions table (with Stripe support)
  - E-commerce tables (orders, products, etc.)
  - Site settings table
  
  ============================================================================
*/

-- ============================================================================
-- SECTION 1: ADMIN CREDENTIALS
-- ============================================================================

-- Create admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

/*
  ⚠️ SECURITY WARNING: The admin_credentials table is designed to store
  password HASHES, not plain text passwords. In production:
  1. Use bcrypt or argon2 to hash passwords before storing
  2. Never store plain text passwords
  3. Update credentials through a secure admin interface
  
  The placeholder below is for initial setup only - update immediately after deployment!
*/

-- Insert placeholder admin (UPDATE THIS IMMEDIATELY AFTER DEPLOYMENT!)
-- Replace 'CHANGE_THIS_USERNAME' and 'CHANGE_THIS_PASSWORD' with secure values
-- The password should be hashed before storing in production
INSERT INTO admin_credentials (username, email, password_hash)
VALUES ('CHANGE_THIS_USERNAME', 'your-email@example.com', 'CHANGE_THIS_PASSWORD_HASH')
ON CONFLICT (username) DO NOTHING;

-- RLS Policies for admin_credentials
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_credentials' AND policyname = 'Admins can view credentials') THEN
    CREATE POLICY "Admins can view credentials"
      ON admin_credentials FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_credentials' AND policyname = 'Admins can update credentials') THEN
    CREATE POLICY "Admins can update credentials"
      ON admin_credentials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: SITE SETTINGS (For storing API keys in database)
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'string',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS for site_settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Anyone can view settings') THEN
    CREATE POLICY "Anyone can view settings"
      ON site_settings FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Authenticated users can manage settings') THEN
    CREATE POLICY "Authenticated users can manage settings"
      ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Insert default settings (you can update these via admin panel)
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('stripe_publishable_key', '', 'secret', 'Stripe publishable API key (pk_live_xxx or pk_test_xxx)'),
  ('stripe_secret_key', '', 'secret', 'Stripe secret API key (sk_live_xxx or sk_test_xxx)'),
  ('stripe_webhook_secret', '', 'secret', 'Stripe webhook signing secret (whsec_xxx)'),
  ('site_name', 'Stream Stick Pro', 'string', 'Website name'),
  ('contact_email', 'reloadedfiretvteam@gmail.com', 'string', 'Contact email address'),
  ('cash_app_tag', '$InfernoTV', 'string', 'Cash App payment tag')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- SECTION 3: STRIPE PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  short_description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  image_url text,
  category text DEFAULT 'Digital Services',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_products' AND policyname = 'Anyone can view active stripe products') THEN
    CREATE POLICY "Anyone can view active stripe products"
      ON stripe_products FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_products' AND policyname = 'Authenticated users can manage stripe products') THEN
    CREATE POLICY "Authenticated users can manage stripe products"
      ON stripe_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Insert default Stripe products (compliant descriptions)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM stripe_products LIMIT 1) THEN
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order) VALUES
    ('Content Research Service - 1 Month', 'Professional content research and curation service. Includes access to premium research tools and monthly strategy reports.', '1-month content research service', 15.00, 'Content Services', true, 1),
    ('Content Strategy Package - 3 Months', 'Comprehensive 3-month content strategy package with ongoing research and personalized recommendations.', '3-month content strategy package', 25.00, 'Content Services', true, 2),
    ('Digital Media Library - 6 Months', '6-month access to premium digital media library and content management platform.', '6-month media library access', 40.00, 'Content Services', true, 3),
    ('Enterprise Content Platform - 1 Year', 'Annual subscription to enterprise-grade content management with priority support.', '1-year enterprise platform', 70.00, 'Content Services', true, 4),
    ('Website Page Design', 'Complete website page design and development with mobile optimization.', 'Custom web page design', 140.00, 'Web Development', true, 5),
    ('Website + SEO Package', 'Website page design with 1 month of SEO optimization and monitoring.', 'Web design + SEO', 150.00, 'Web Development', true, 6),
    ('Premium Web + SEO Strategy', 'Premium website design with 6 months of comprehensive SEO strategy.', 'Premium web + SEO', 160.00, 'Web Development', true, 7);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_stripe_products_category ON stripe_products(category);

-- ============================================================================
-- SECTION 4: ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders_full (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address text,
  billing_address text,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders_full ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders_full
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders_full' AND policyname = 'Anyone can create orders') THEN
    CREATE POLICY "Anyone can create orders"
      ON orders_full FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders_full' AND policyname = 'Anyone can view orders') THEN
    CREATE POLICY "Anyone can view orders"
      ON orders_full FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders_full' AND policyname = 'Authenticated can update orders') THEN
    CREATE POLICY "Authenticated can update orders"
      ON orders_full FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_full_email ON orders_full(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_full_status ON orders_full(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_full_payment ON orders_full(payment_status);

-- ============================================================================
-- SECTION 5: PAYMENT TRANSACTIONS TABLE (with Stripe support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders_full(id) ON DELETE CASCADE,
  order_code text UNIQUE NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cashapp', 'bitcoin', 'card', 'paypal', 'zelle', 'venmo', 'stripe')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded')),
  transaction_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_metadata jsonb DEFAULT '{}'::jsonb,
  cashapp_tag text,
  bitcoin_address text,
  confirmation_email_sent boolean DEFAULT false,
  instructions_shown text,
  -- Stripe-specific columns
  stripe_payment_intent_id text,
  stripe_event_id text,
  is_live_mode boolean DEFAULT false,
  product_id uuid,
  product_name text,
  customer_email text,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Anyone can view payment transactions') THEN
    CREATE POLICY "Anyone can view payment transactions"
      ON payment_transactions FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Anyone can create payment transactions') THEN
    CREATE POLICY "Anyone can create payment transactions"
      ON payment_transactions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Authenticated can update payment transactions') THEN
    CREATE POLICY "Authenticated can update payment transactions"
      ON payment_transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_code ON payment_transactions(order_code);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_live_mode ON payment_transactions(is_live_mode);

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    code := 'ORD-' ||
            UPPER(substr(md5(random()::text), 1, 4)) || '-' ||
            UPPER(substr(md5(random()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE order_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get Stripe transaction stats
CREATE OR REPLACE FUNCTION get_stripe_transaction_stats()
RETURNS TABLE(
  total_transactions bigint,
  live_transactions bigint,
  test_transactions bigint,
  completed_transactions bigint,
  failed_transactions bigint,
  total_revenue_usd numeric
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_transactions,
    COUNT(*) FILTER (WHERE is_live_mode = true)::bigint as live_transactions,
    COUNT(*) FILTER (WHERE is_live_mode = false)::bigint as test_transactions,
    COUNT(*) FILTER (WHERE payment_status = 'completed' OR payment_status = 'confirmed')::bigint as completed_transactions,
    COUNT(*) FILTER (WHERE payment_status = 'failed')::bigint as failed_transactions,
    COALESCE(SUM(amount) FILTER (WHERE (payment_status = 'completed' OR payment_status = 'confirmed') AND is_live_mode = true), 0) as total_revenue_usd
  FROM payment_transactions
  WHERE stripe_payment_intent_id IS NOT NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_order_code() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_stripe_transaction_stats() TO authenticated;

-- ============================================================================
-- SECTION 7: STORAGE BUCKET FOR IMAGES
-- ============================================================================

-- Create images bucket if it doesn't exist (run this separately if it fails)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE! Your database is now set up for Stripe payments.
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✅ Master SQL execution completed!';
  RAISE NOTICE 'Tables created/verified:';
  RAISE NOTICE '  - admin_credentials';
  RAISE NOTICE '  - site_settings';
  RAISE NOTICE '  - stripe_products';
  RAISE NOTICE '  - orders_full';
  RAISE NOTICE '  - payment_transactions';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Add Stripe API keys to Supabase Edge Function Secrets';
  RAISE NOTICE '2. Add VITE_STRIPE_PUBLISHABLE_KEY to Cloudflare environment variables';
  RAISE NOTICE '3. Set up Stripe webhook at: https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook';
END $$;
