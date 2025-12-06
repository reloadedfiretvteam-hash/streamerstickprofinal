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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for orders table
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_idx ON orders (stripe_payment_intent_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_session_idx ON orders (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);

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
