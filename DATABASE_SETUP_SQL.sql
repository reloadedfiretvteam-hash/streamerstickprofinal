-- ============================================================
-- COMPLETE STRIPE PAYMENT SETUP - DATABASE CONFIGURATION
-- ============================================================
-- Run this SQL in Supabase SQL Editor
-- Location: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new

-- ============================================================
-- STEP 1: Add cloaked_name column to real_products
-- ============================================================
-- This column stores compliant/cloaked product names for Stripe
-- Customers see real names, Stripe sees cloaked names
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'cloaked_name') THEN
      ALTER TABLE real_products ADD COLUMN cloaked_name text;
      RAISE NOTICE 'Added cloaked_name column to real_products';
    ELSE
      RAISE NOTICE 'cloaked_name column already exists in real_products';
    END IF;
  ELSE
    RAISE NOTICE 'real_products table does not exist';
  END IF;
END $$;

-- ============================================================
-- STEP 2: Set default cloaked names for existing products
-- ============================================================
-- Automatically generates compliant cloaked names based on category
UPDATE real_products 
SET cloaked_name = CASE 
  WHEN LOWER(category) LIKE '%fire%' OR LOWER(category) LIKE '%stick%' 
    THEN 'Digital Entertainment Service - Hardware Bundle'
  WHEN LOWER(category) LIKE '%iptv%' OR LOWER(category) LIKE '%subscription%'
    THEN 'Digital Entertainment Service - Subscription'
  ELSE 'Digital Entertainment Service'
END
WHERE cloaked_name IS NULL OR cloaked_name = '';

-- ============================================================
-- STEP 3: Create payment_transactions table (for webhook)
-- ============================================================
-- This table stores payment records from Stripe webhooks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
    CREATE TABLE payment_transactions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      stripe_payment_intent_id text UNIQUE NOT NULL,
      amount numeric(10, 2) NOT NULL,
      currency text DEFAULT 'usd',
      payment_method text DEFAULT 'stripe',
      payment_status text NOT NULL,
      customer_email text,
      product_id text,
      product_name text,
      is_live_mode boolean DEFAULT false,
      created_at timestamp with time zone DEFAULT now(),
      stripe_event_id text,
      order_code text
    );
    
    -- Create indexes for faster lookups
    CREATE INDEX idx_payment_transactions_stripe_id ON payment_transactions(stripe_payment_intent_id);
    CREATE INDEX idx_payment_transactions_email ON payment_transactions(customer_email);
    CREATE INDEX idx_payment_transactions_created ON payment_transactions(created_at);
    CREATE INDEX idx_payment_transactions_status ON payment_transactions(payment_status);
    
    RAISE NOTICE 'Created payment_transactions table';
  ELSE
    RAISE NOTICE 'payment_transactions table already exists';
  END IF;
END $$;

-- ============================================================
-- STEP 4: Ensure orders table has required columns
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    -- Add payment_intent_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'payment_intent_id') THEN
      ALTER TABLE orders ADD COLUMN payment_intent_id text;
      RAISE NOTICE 'Added payment_intent_id column to orders';
    END IF;
    
    -- Add product_name_cloaked if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'product_name_cloaked') THEN
      ALTER TABLE orders ADD COLUMN product_name_cloaked text;
      RAISE NOTICE 'Added product_name_cloaked column to orders';
    END IF;
  ELSE
    RAISE NOTICE 'orders table does not exist';
  END IF;
END $$;

-- ============================================================
-- VERIFICATION: Check setup
-- ============================================================
-- Run this to verify all setup is correct
SELECT 
  'real_products.cloaked_name' as check_item,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'cloaked_name'
  ) as exists,
  'Column for cloaked product names' as description
UNION ALL
SELECT 
  'payment_transactions table',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'payment_transactions'
  ),
  'Table for storing payment records from webhooks'
UNION ALL
SELECT 
  'orders.payment_intent_id',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_intent_id'
  ),
  'Column for linking orders to Stripe payment intents'
UNION ALL
SELECT 
  'orders.product_name_cloaked',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'product_name_cloaked'
  ),
  'Column for storing cloaked product names in orders';

-- ============================================================
-- CHECK: Verify products have cloaked names
-- ============================================================
SELECT 
  COUNT(*) as total_products,
  COUNT(cloaked_name) as products_with_cloaked_name,
  COUNT(*) - COUNT(cloaked_name) as products_missing_cloaked_name
FROM real_products;

-- ============================================================
-- COMPLETE
-- ============================================================
-- All database setup is complete!
-- Next steps:
-- 1. Set up Cloudflare environment variables
-- 2. Set up Supabase Edge Functions secrets
-- 3. Create Stripe webhook
-- 4. Deploy Edge Functions






