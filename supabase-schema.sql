-- StreamStickPro Database Schema for Supabase
-- Generated from Drizzle ORM schema (shared/schema.ts)
-- Run this in Supabase SQL Editor to create/update tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores admin user credentials for the admin panel
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- =====================================================
-- CUSTOMERS TABLE
-- Stores IPTV customer accounts with credentials
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  last_order_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for customers table
CREATE UNIQUE INDEX IF NOT EXISTS customers_username_idx ON customers (username);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email);
CREATE INDEX IF NOT EXISTS customers_status_idx ON customers (status);

-- =====================================================
-- ORDERS TABLE
-- Stores all customer orders with Stripe and product mapping
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_customer_id TEXT,
  shadow_product_id TEXT,
  shadow_price_id TEXT,
  real_product_id TEXT,
  real_product_name TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  credentials_sent BOOLEAN DEFAULT FALSE,
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_street TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT,
  fulfillment_status TEXT DEFAULT 'pending',
  amazon_order_id TEXT,
  customer_id TEXT,
  is_renewal BOOLEAN DEFAULT FALSE,
  existing_username TEXT,
  generated_username TEXT,
  generated_password TEXT,
  country_preference TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for orders table
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_idx ON orders (stripe_payment_intent_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_session_idx ON orders (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_fulfillment_status_idx ON orders (fulfillment_status);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);

-- =====================================================
-- REAL_PRODUCTS TABLE
-- Stores the actual products customers see (Fire Sticks, IPTV)
-- Maps to shadow products for payment processor compliance
-- =====================================================
CREATE TABLE IF NOT EXISTS real_products (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  shadow_product_id TEXT,
  shadow_price_id TEXT
);

-- Indexes for real_products table
CREATE UNIQUE INDEX IF NOT EXISTS real_products_shadow_product_idx ON real_products (shadow_product_id);
CREATE UNIQUE INDEX IF NOT EXISTS real_products_shadow_price_idx ON real_products (shadow_price_id);
CREATE INDEX IF NOT EXISTS real_products_category_idx ON real_products (category);

-- =====================================================
-- VISITORS TABLE
-- Tracks website visitors with geolocation data
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  country_code TEXT,
  region TEXT,
  region_code TEXT,
  city TEXT,
  latitude TEXT,
  longitude TEXT,
  timezone TEXT,
  isp TEXT,
  is_proxy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for visitors table
CREATE INDEX IF NOT EXISTS visitors_session_idx ON visitors (session_id);
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors (created_at);
CREATE INDEX IF NOT EXISTS visitors_country_idx ON visitors (country);
CREATE INDEX IF NOT EXISTS visitors_region_idx ON visitors (region);

-- =====================================================
-- PAGE_EDITS TABLE
-- Stores admin-editable content for page customization
-- =====================================================
CREATE TABLE IF NOT EXISTS page_edits (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  element_id TEXT NOT NULL,
  element_type TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for page_edits table
CREATE INDEX IF NOT EXISTS page_edits_page_idx ON page_edits (page_id);
CREATE UNIQUE INDEX IF NOT EXISTS page_edits_element_unique_idx ON page_edits (page_id, section_id, element_id);

-- =====================================================
-- SEED DATA: Default Products
-- Run this to populate initial products
-- =====================================================

-- Fire Stick Products
INSERT INTO real_products (id, name, description, price, category, shadow_product_id, shadow_price_id) VALUES
  ('firestick-hd', 'Fire Stick HD', 'Jailbroken Fire Stick with 1080p HD streaming. Includes free IPTV setup.', 14000, 'firestick', 'prod_TXKpNqMjIiYJWS', 'price_1STvmJIb3DoE9QtaVYEnUZlj'),
  ('firestick-4k', 'Fire Stick 4K', 'Jailbroken Fire Stick with 4K Ultra HD streaming. Includes free IPTV setup.', 15000, 'firestick', 'prod_TXKpPYcKrR1Wev', 'price_1STvn8Ib3DoE9QtaS5fG2GJk'),
  ('firestick-4k-max', 'Fire Stick 4K Max', 'Premium jailbroken Fire Stick with 4K Max performance. Includes free IPTV setup.', 16000, 'firestick', 'prod_TXKq9XvYYlxQFD', 'price_1STvnjIb3DoE9QtaSEz5d9Gq')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  shadow_product_id = EXCLUDED.shadow_product_id,
  shadow_price_id = EXCLUDED.shadow_price_id;

-- IPTV Subscription Products
INSERT INTO real_products (id, name, description, price, category, shadow_product_id, shadow_price_id) VALUES
  ('iptv-1mo', 'IPTV 1 Month', '1 month IPTV subscription with 10,000+ live channels and VOD.', 1500, 'iptv', 'prod_TXKqv5u1L5qoWH', 'price_1STvoNIb3DoE9QtaYrWKJDjy'),
  ('iptv-3mo', 'IPTV 3 Months', '3 month IPTV subscription with 10,000+ live channels and VOD.', 2500, 'iptv', 'prod_TXKrNcOjmN27EJ', 'price_1STvomIb3DoE9QtaYYkeDWrK'),
  ('iptv-6mo', 'IPTV 6 Months', '6 month IPTV subscription with 10,000+ live channels and VOD.', 5000, 'iptv', 'prod_TYHYB4xfYwSOmH', 'price_1SbAz5Ib3DoE9QtaJiD7deTc'),
  ('iptv-1yr', 'IPTV 1 Year', '1 year IPTV subscription with 10,000+ live channels and VOD.', 7500, 'iptv', 'prod_TXKroAnfvxiS2V', 'price_1STvpCIb3DoE9QtawAdCjhT2')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  shadow_product_id = EXCLUDED.shadow_product_id,
  shadow_price_id = EXCLUDED.shadow_price_id;

-- =====================================================
-- MIGRATION: Add new columns to existing orders table
-- Run these ALTER statements if upgrading an existing database
-- =====================================================
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_street TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zip TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS amazon_order_id TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS existing_username TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS generated_username TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS generated_password TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_preference TEXT;

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- View all products
-- SELECT * FROM real_products ORDER BY category, price;

-- View recent orders
-- SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;

-- View orders pending credentials
-- SELECT * FROM orders WHERE status = 'paid' AND credentials_sent = FALSE;

-- Count orders by status
-- SELECT status, COUNT(*) FROM orders GROUP BY status;

-- View visitors by country (last 24 hours)
-- SELECT country, COUNT(*) as visits FROM visitors 
-- WHERE created_at > NOW() - INTERVAL '24 hours' 
-- GROUP BY country ORDER BY visits DESC;

-- View customers by status
-- SELECT status, COUNT(*) FROM customers GROUP BY status;
