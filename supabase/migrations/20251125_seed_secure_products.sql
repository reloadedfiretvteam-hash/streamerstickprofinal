/*
  # Seed Secure Products for Square Checkout
  
  This migration seeds approved product data for the secure checkout subdomain:
  - Fire Stick devices (streaming devices with various features)
  - IPTV subscription plans (1-month, 3-month, 6-month, 12-month)
  - Website Design packages (matching Fire Stick device prices for Square compliance)
  
  All products are mapped to square_products with SKUs and main_image filenames.
  Prices are set to match real_products authoritative values.
  
  IMPORTANT: Run this AFTER 20251125_sync_prices.sql
*/

-- =============================================================================
-- FIRE STICK DEVICES
-- =============================================================================

-- Fire Stick HD (Entry Level)
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  'Fire Stick HD',
  'fire-stick-hd',
  'Stream in 1080p Full HD with Alexa Voice Remote. Perfect entry-level streaming device with access to all major apps and our premium IPTV service pre-installed.',
  89.99,
  119.99,
  'fire-sticks',
  'device',
  'firestick-hd.jpg',
  'FST-HD-001',
  '["1080p Full HD streaming", "Alexa Voice Remote included", "Pre-loaded with premium apps", "Easy setup - plug and play", "Free technical support", "30-day money-back guarantee"]'::jsonb,
  'Great Value',
  false,
  true,
  1
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- Fire Stick 4K (Most Popular)
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  'Fire Stick 4K',
  'fire-stick-4k',
  'Experience stunning 4K Ultra HD with HDR support. Our most popular streaming device with enhanced remote and all premium features pre-configured.',
  119.99,
  159.99,
  'fire-sticks',
  'device',
  'firestick-4k.jpg',
  'FST-4K-001',
  '["4K Ultra HD with HDR10+", "Dolby Vision & Atmos audio", "Alexa Voice Remote Pro", "All premium apps pre-loaded", "Priority customer support", "60-day money-back guarantee"]'::jsonb,
  'Most Popular',
  true,
  true,
  2
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- Fire Stick 4K Max (Premium)
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  'Fire Stick 4K Max',
  'fire-stick-4k-max',
  'The ultimate streaming experience with WiFi 6E support, fastest processor, and 16GB storage. Fully loaded with premium apps and lifetime support included.',
  149.99,
  199.99,
  'fire-sticks',
  'device',
  'firestick-4k-max.jpg',
  'FST-4KM-001',
  '["4K Ultra HD with HDR10+ & Dolby Vision", "WiFi 6E for fastest streaming", "16GB storage with expandable options", "Enhanced Alexa Voice Remote Pro", "All premium apps + exclusive content", "Lifetime VIP support", "90-day money-back guarantee"]'::jsonb,
  'Best Value',
  false,
  true,
  3
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- =============================================================================
-- IPTV SUBSCRIPTION PLANS
-- =============================================================================

-- 1-Month IPTV Plan
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  '1-Month IPTV Subscription',
  'iptv-1-month',
  'Full access to 18,000+ live channels, 60,000+ movies & shows. Perfect for trying our service with no long-term commitment.',
  19.99,
  29.99,
  'iptv-subscriptions',
  'subscription',
  'iptv-1month.jpg',
  'IPTV-1M-001',
  '["18,000+ Live TV Channels", "60,000+ Movies & Shows", "All sports including NFL, NBA, MLB", "24/7 customer support", "Works on all devices", "Cancel anytime"]'::jsonb,
  'Starter',
  false,
  true,
  10
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- 3-Month IPTV Plan
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  '3-Month IPTV Subscription',
  'iptv-3-month',
  'Save 25% with our quarterly plan. Full access to all channels, movies, and sports with priority support.',
  44.99,
  89.97,
  'iptv-subscriptions',
  'subscription',
  'iptv-3month.jpg',
  'IPTV-3M-001',
  '["18,000+ Live TV Channels", "60,000+ Movies & Shows", "All sports including PPV events", "Priority customer support", "Multi-device streaming", "Save 25% vs monthly"]'::jsonb,
  'Save 25%',
  false,
  true,
  11
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- 6-Month IPTV Plan
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  '6-Month IPTV Subscription',
  'iptv-6-month',
  'Our best value for serious streamers. Save 40% with half-year access to everything.',
  69.99,
  119.94,
  'iptv-subscriptions',
  'subscription',
  'iptv-6month.jpg',
  'IPTV-6M-001',
  '["18,000+ Live TV Channels", "60,000+ Movies & Shows", "All sports + PPV events included", "VIP customer support", "Up to 3 simultaneous streams", "Save 40% vs monthly"]'::jsonb,
  'Best Value',
  true,
  true,
  12
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- 12-Month IPTV Plan
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  '12-Month IPTV Subscription',
  'iptv-12-month',
  'Maximum savings with annual access. Get everything for a full year at our lowest per-month price.',
  99.99,
  239.88,
  'iptv-subscriptions',
  'subscription',
  'iptv-12month.jpg',
  'IPTV-12M-001',
  '["18,000+ Live TV Channels", "60,000+ Movies & Shows", "All sports + ALL PPV events included", "VIP Priority Support 24/7", "Up to 5 simultaneous streams", "Exclusive bonus content", "Save 58% vs monthly"]'::jsonb,
  'Save 58%',
  false,
  true,
  13
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- =============================================================================
-- WEBSITE DESIGN PACKAGES (Square-Compliant Services matching device prices)
-- =============================================================================

-- Basic Website Design (matches Fire Stick HD price)
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  'Basic Website Design',
  'website-basic',
  'Professional single-page website design with responsive layout. Perfect for small businesses and personal portfolios.',
  89.99,
  149.99,
  'website-design',
  'service',
  'website-basic.jpg',
  'WEB-BASIC-001',
  '["Single responsive page", "Mobile-optimized design", "Contact form integration", "Basic SEO setup", "Social media links", "1 revision round"]'::jsonb,
  'Starter',
  false,
  true,
  20
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- Standard Website Design (matches Fire Stick 4K price)
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  'Standard Website Design',
  'website-standard',
  'Multi-page professional website with modern design, SEO optimization, and content management system.',
  119.99,
  199.99,
  'website-design',
  'service',
  'website-standard.jpg',
  'WEB-STD-001',
  '["Up to 5 pages", "Responsive modern design", "CMS integration", "Advanced SEO optimization", "Analytics setup", "2 revision rounds", "30-day support"]'::jsonb,
  'Most Popular',
  true,
  true,
  21
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- Premium Website Design (matches Fire Stick 4K Max price)
INSERT INTO real_products (name, slug, description, price, original_price, category, type, image_filename, sku, features, badge, popular, active, sort_order)
VALUES (
  'Premium Website Design',
  'website-premium',
  'Full custom website with e-commerce functionality, advanced features, and premium support.',
  149.99,
  299.99,
  'website-design',
  'service',
  'website-premium.jpg',
  'WEB-PREM-001',
  '["Unlimited pages", "Custom responsive design", "E-commerce integration", "Payment gateway setup", "Advanced SEO + Analytics", "Unlimited revisions", "60-day priority support"]'::jsonb,
  'Best Value',
  false,
  true,
  22
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- =============================================================================
-- CREATE SQUARE_PRODUCTS MAPPINGS
-- =============================================================================

-- Insert square_products entries for all real_products
INSERT INTO square_products (real_product_id, sku, name, description, price, main_image, approved_for_square)
SELECT 
  id,
  sku,
  name,
  description,
  price,
  image_filename,
  -- Only approve Fire Sticks and Website Design for Square initially
  CASE WHEN category IN ('fire-sticks', 'website-design') THEN true ELSE false END
FROM real_products
WHERE sku IS NOT NULL
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  main_image = EXCLUDED.main_image,
  updated_at = now();

-- =============================================================================
-- SEED PRICING_PLANS TABLE (for IPTV plans display)
-- =============================================================================

INSERT INTO pricing_plans (name, display_name, description, price, original_price, period, features, badge, popular, active, sort_order)
VALUES 
  ('iptv-1-month', '1 Month', 'Perfect for trying our service', 19.99, 29.99, 'monthly', 
   '["18,000+ Live Channels", "60,000+ Movies & Shows", "All Sports", "24/7 Support"]'::jsonb, 
   'Starter', false, true, 1),
  ('iptv-3-month', '3 Months', 'Save 25% with quarterly billing', 44.99, 89.97, 'quarterly', 
   '["18,000+ Live Channels", "60,000+ Movies & Shows", "All Sports + PPV", "Priority Support"]'::jsonb, 
   'Save 25%', false, true, 2),
  ('iptv-6-month', '6 Months', 'Best value for serious streamers', 69.99, 119.94, 'biannual', 
   '["18,000+ Live Channels", "60,000+ Movies & Shows", "All Sports + PPV", "VIP Support", "3 Streams"]'::jsonb, 
   'Best Value', true, true, 3),
  ('iptv-12-month', '12 Months', 'Maximum savings with annual plan', 99.99, 239.88, 'annual', 
   '["18,000+ Live Channels", "60,000+ Movies & Shows", "All Sports + ALL PPV", "VIP 24/7 Support", "5 Streams", "Exclusive Content"]'::jsonb, 
   'Save 58%', false, true, 4)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  features = EXCLUDED.features,
  badge = EXCLUDED.badge,
  popular = EXCLUDED.popular,
  updated_at = now();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Run this query to verify seeded data:
-- SELECT 
--   rp.name, 
--   rp.category, 
--   rp.price as real_price, 
--   sp.price as square_price,
--   sp.approved_for_square,
--   CASE WHEN rp.price = sp.price THEN 'OK' ELSE 'MISMATCH' END as price_status
-- FROM real_products rp
-- LEFT JOIN square_products sp ON sp.sku = rp.sku
-- ORDER BY rp.sort_order;
