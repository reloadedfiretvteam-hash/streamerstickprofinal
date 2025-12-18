-- StreamStickPro Customer Auth Migration
-- Run this in Supabase SQL Editor to add customer authentication tables

-- =====================================================
-- CUSTOMERS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers (email);
CREATE INDEX IF NOT EXISTS customers_status_idx ON public.customers (status);
CREATE INDEX IF NOT EXISTS customers_username_idx ON public.customers (username);

-- Enable RLS but allow service key access
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.customers;
CREATE POLICY "Allow authenticated access" ON public.customers FOR ALL USING (true);

-- =====================================================
-- PASSWORD RESET TOKENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_customer_idx ON public.password_reset_tokens (customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS password_reset_token_idx ON public.password_reset_tokens (token);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.password_reset_tokens;
CREATE POLICY "Allow authenticated access" ON public.password_reset_tokens FOR ALL USING (true);

-- =====================================================
-- ABANDONED CARTS TABLE (for recovery emails)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  customer_name TEXT,
  cart_items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  recovery_email_sent BOOLEAN DEFAULT false,
  recovery_email_sent_at TIMESTAMPTZ,
  converted BOOLEAN DEFAULT false,
  converted_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS abandoned_carts_email_idx ON public.abandoned_carts (email);
CREATE INDEX IF NOT EXISTS abandoned_carts_recovery_idx ON public.abandoned_carts (recovery_email_sent, converted);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.abandoned_carts;
CREATE POLICY "Allow authenticated access" ON public.abandoned_carts FOR ALL USING (true);

-- =====================================================
-- ORDERS TABLE - Add customer_id column if missing
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
    ALTER TABLE public.orders ADD COLUMN customer_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_message') THEN
    ALTER TABLE public.orders ADD COLUMN customer_message TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders (customer_id);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Customers table' as table_name, count(*) as rows FROM public.customers;
SELECT 'Password Reset Tokens table' as table_name, count(*) as rows FROM public.password_reset_tokens;
SELECT 'Abandoned Carts table' as table_name, count(*) as rows FROM public.abandoned_carts;
SELECT 'Orders table' as table_name, count(*) as rows FROM public.orders;
