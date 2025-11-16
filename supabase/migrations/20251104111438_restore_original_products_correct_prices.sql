/*
  # Restore Original Products with Correct Prices
  
  1. Products to Remove
    - All current incorrect products
    
  2. Original Products to Add
    
    **Fire Stick Devices (3):**
    - Fire Stick 4K - $69.99
    - Fire Stick 4K Max - $89.99
    - Fire Stick 4K Max Pro - $109.99
    
    **IPTV Subscriptions (4):**
    - 1 Month IPTV - $15.00
    - 3 Month IPTV - $25.00
    - 6 Month IPTV - $40.00
    - 1 Year IPTV - $70.00
    
  3. Total Products: 7 (3 devices + 4 subscriptions)
*/

-- Delete all existing incorrect products
DELETE FROM real_products;

-- Insert ORIGINAL Fire Stick Devices with CORRECT prices
INSERT INTO real_products (
  name,
  slug,
  description,
  price,
  sale_price,
  category,
  main_image,
  stock_quantity,
  status,
  featured,
  sku
) VALUES
-- Fire Stick 4K
(
  'Fire Stick 4K',
  'fire-stick-4k',
  'Original Amazon Fire Stick 4K. Stream in stunning 4K Ultra HD with support for Dolby Vision, HDR, and HDR10+. Includes Alexa Voice Remote. Perfect for IPTV streaming.',
  '69.99',
  NULL,
  'devices',
  '/71+Pvh7WB6L._AC_SL1500_.jpg',
  50,
  'publish',
  false,
  'FS4K-001'
),

-- Fire Stick 4K Max
(
  'Fire Stick 4K Max',
  'fire-stick-4k-max',
  'Amazon Fire Stick 4K Max. 40% more powerful than Fire Stick 4K. Stream in stunning 4K Ultra HD. Wi-Fi 6 support for faster streaming. Includes Alexa Voice Remote.',
  '89.99',
  NULL,
  'devices',
  '/71+Pvh7WB6L._AC_SL1500_.jpg',
  50,
  'publish',
  true,
  'FS4KMAX-001'
),

-- Fire Stick 4K Max Pro
(
  'Fire Stick 4K Max Pro',
  'fire-stick-4k-max-pro',
  'Amazon Fire Stick 4K Max Pro. Most powerful Fire Stick ever. Stream in 4K Ultra HD. Wi-Fi 6E support. Includes Alexa Voice Remote Pro with backlit buttons and remote finder.',
  '109.99',
  NULL,
  'devices',
  '/71+Pvh7WB6L._AC_SL1500_.jpg',
  30,
  'publish',
  false,
  'FS4KMAXPRO-001'
),

-- 1 Month IPTV Subscription
(
  '1 Month IPTV Subscription',
  '1-month-iptv-subscription',
  'Try our premium IPTV service for 1 month. Access 20,000+ live channels, 60,000+ movies and TV shows, all sports including NFL, NBA, UFC. 4K quality. Works on any device.',
  '15.00',
  NULL,
  'subscriptions',
  '/OIP (11) websit pic.jpg',
  999,
  'publish',
  false,
  'IPTV-1M'
),

-- 3 Month IPTV Subscription
(
  '3 Month IPTV Subscription',
  '3-month-iptv-subscription',
  'Save with our 3-month IPTV plan. Access 20,000+ live channels, 60,000+ movies and TV shows, all sports including NFL, NBA, UFC. 4K quality. Works on any device. Best value for trying IPTV!',
  '25.00',
  NULL,
  'subscriptions',
  '/OIP (11) websit pic.jpg',
  999,
  'publish',
  true,
  'IPTV-3M'
),

-- 6 Month IPTV Subscription
(
  '6 Month IPTV Subscription',
  '6-month-iptv-subscription',
  'Great savings with our 6-month IPTV plan. Access 20,000+ live channels, 60,000+ movies and TV shows, all sports including NFL, NBA, UFC. 4K quality. Works on any device.',
  '40.00',
  NULL,
  'subscriptions',
  '/OIP (11) websit pic.jpg',
  999,
  'publish',
  false,
  'IPTV-6M'
),

-- 1 Year IPTV Subscription
(
  '1 Year IPTV Subscription',
  '1-year-iptv-subscription',
  'Best deal! Full year of premium IPTV service. Access 20,000+ live channels, 60,000+ movies and TV shows, all sports including NFL, NBA, UFC. 4K quality. Works on any device. Maximum savings - only $5.83/month!',
  '70.00',
  NULL,
  'subscriptions',
  '/OIP (11) websit pic.jpg',
  999,
  'publish',
  true,
  'IPTV-12M'
);

-- Verify all 7 products were inserted
SELECT 
  name,
  price,
  category,
  status,
  featured
FROM real_products
ORDER BY 
  CASE category 
    WHEN 'devices' THEN 1 
    WHEN 'subscriptions' THEN 2 
  END,
  price::numeric ASC;
