-- ============================================================
-- STRIPE CHECKOUT SETUP SQL
-- Run this to ensure all tables exist for the complete checkout system
-- ============================================================

-- 1. Ensure orders_full table exists
CREATE TABLE IF NOT EXISTS orders_full (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_state text,
  customer_zip text,
  total_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'processing',
  stripe_payment_intent_id text,
  order_code text UNIQUE NOT NULL,
  items jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders_full ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view orders" ON orders_full;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders_full;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders_full;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders_full;

-- Create policies
CREATE POLICY "Anyone can view orders" ON orders_full FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create orders" ON orders_full FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders_full FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage orders" ON orders_full FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create index for order_code lookups
CREATE INDEX IF NOT EXISTS idx_orders_full_order_code ON orders_full(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_full_customer_email ON orders_full(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_full_stripe_payment_intent_id ON orders_full(stripe_payment_intent_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_orders_full_timestamp ON orders_full;
CREATE TRIGGER update_orders_full_timestamp 
  BEFORE UPDATE ON orders_full 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Ensure payment_transactions table exists for Stripe webhooks
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id text,
  stripe_event_id text,
  amount numeric(10,2),
  currency text DEFAULT 'usd',
  payment_method text,
  payment_status text,
  customer_email text,
  product_id text,
  product_name text,
  is_live_mode boolean,
  order_code text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Authenticated users can manage payment transactions" ON payment_transactions;

CREATE POLICY "Public can read payment transactions" ON payment_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage payment transactions" ON payment_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_code ON payment_transactions(order_code);

-- 3. Ensure real_products table has main_image column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'main_image') THEN
      ALTER TABLE real_products ADD COLUMN main_image text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'stripe_payment_link') THEN
      ALTER TABLE real_products ADD COLUMN stripe_payment_link text;
    END IF;
  END IF;
END $$;

-- ============================================================
-- COMPLETE! All tables ready for Stripe checkout
-- ============================================================

