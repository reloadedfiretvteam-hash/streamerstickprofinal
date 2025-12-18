-- StreamStickPro Supabase Schema Update
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Step 1: Drop dependent tables first (they can be recreated if needed)
DROP TABLE IF EXISTS square_products CASCADE;
DROP TABLE IF EXISTS stripe_products CASCADE;

-- Step 2: Drop the old real_products table
DROP TABLE IF EXISTS real_products CASCADE;

-- Step 3: Create new real_products table with TEXT IDs
CREATE TABLE real_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  shadow_product_id TEXT,
  shadow_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_real_products_category ON real_products(category);
CREATE INDEX idx_real_products_shadow_product ON real_products(shadow_product_id);
CREATE INDEX idx_real_products_shadow_price ON real_products(shadow_price_id);

-- Step 5: Insert all products with Stripe mappings
INSERT INTO real_products (id, name, description, price, image_url, category, shadow_product_id, shadow_price_id, is_active) VALUES
('firestick-hd', 'Fire Stick HD', 'Real product mapped to Web Design Basic', 11900, 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg', 'firestick', 'prod_TYEEobMjXf5B3d', 'price_1SbmlQHBw27Y92CikC7hKknE', true),
('firestick-4k', 'Fire Stick 4K', 'Real product mapped to Web Design Pro', 12750, 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg', 'firestick', 'prod_TYEEFruD8obUE7', 'price_1SbmlRHBw27Y92CiuZhoRKCY', true),
('firestick-4k-max', 'Fire Stick 4K Max', 'Real product mapped to Web Design Enterprise', 13600, 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg', 'firestick', 'prod_TYEEeLmZMqrUxh', 'price_1SbmlRHBw27Y92CiZhKx5NHU', true),
('iptv-1mo', 'IPTV Monthly', 'Real product mapped to SEO Monthly', 1500, NULL, 'iptv', 'prod_TYuaysNq0ySpUc', 'price_1SbmlSHBw27Y92CiIDBuBYdX', true),
('iptv-1mo-1d', 'IPTV 1 Month - 1 Device', 'Real product mapped to SEO Starter Monthly', 1500, NULL, 'iptv', 'prod_TYuaWpHy3Smh0I', 'price_1SbmlSHBw27Y92CiB3LdWOTa', true),
('iptv-1mo-2d', 'IPTV 1 Month - 2 Devices', 'Real product mapped to SEO Duo Monthly', 2500, NULL, 'iptv', 'prod_TYuaa21PNETx9W', 'price_1SbmlTHBw27Y92CioPrTd70O', true),
('iptv-1mo-3d', 'IPTV 1 Month - 3 Devices', 'Real product mapped to SEO Team Monthly', 3500, NULL, 'iptv', 'prod_TYuasBt8kmq8JB', 'price_1SbmlTHBw27Y92CiUaSQ4DUe', true),
('iptv-1mo-4d', 'IPTV 1 Month - 4 Devices', 'Real product mapped to SEO Business Monthly', 4000, NULL, 'iptv', 'prod_TYua25JPl7v9on', 'price_1SbmlUHBw27Y92CiqLSakBYQ', true),
('iptv-1mo-5d', 'IPTV 1 Month - 5 Devices', 'Real product mapped to SEO Enterprise Monthly', 4500, NULL, 'iptv', 'prod_TYua5NHSyyVifo', 'price_1SbmlUHBw27Y92Ciu2ioIO8m', true),
('iptv-3mo', 'IPTV Quarterly', 'Real product mapped to SEO Quarterly', 2500, NULL, 'iptv', 'prod_TYua8AOX5F8ick', 'price_1SbmlVHBw27Y92CiTfnst2n6', true),
('iptv-3mo-1d', 'IPTV 3 Month - 1 Device', 'Real product mapped to SEO Starter Quarterly', 2500, NULL, 'iptv', 'prod_TYuaZ7ySDhq3JB', 'price_1SbmlWHBw27Y92CixWXndjWA', true),
('iptv-3mo-2d', 'IPTV 3 Month - 2 Devices', 'Real product mapped to SEO Duo Quarterly', 4000, NULL, 'iptv', 'prod_TYuaMsEbLCEMwB', 'price_1SbmlWHBw27Y92Cilr8PUZa0', true),
('iptv-3mo-3d', 'IPTV 3 Month - 3 Devices', 'Real product mapped to SEO Team Quarterly', 5500, NULL, 'iptv', 'prod_TYuaAE09STa5Rv', 'price_1SbmlXHBw27Y92CiBtcUxVw6', true),
('iptv-3mo-4d', 'IPTV 3 Month - 4 Devices', 'Real product mapped to SEO Business Quarterly', 6500, NULL, 'iptv', 'prod_TYuaeQfGsDLQ6h', 'price_1SbmlXHBw27Y92CiPFAunxd0', true),
('iptv-3mo-5d', 'IPTV 3 Month - 5 Devices', 'Real product mapped to SEO Enterprise Quarterly', 7500, NULL, 'iptv', 'prod_TYuaqQl59AgP8w', 'price_1SbmlYHBw27Y92CicILuClqr', true),
('iptv-6mo', '6 Month IPTV Subscription', 'Premium 6-month IPTV subscription', 5000, NULL, 'iptv', 'prod_TYuaHv9fUWPhX4', 'price_1SbmlYHBw27Y92Cig9wKfsYC', true),
('iptv-6mo-1d', 'IPTV 6 Month - 1 Device', 'Real product mapped to Content Marketing Semi-Annual', 4000, NULL, 'iptv', 'prod_TYuaPtKkp5vnTv', 'price_1SbmlZHBw27Y92CiJqAwgziy', true),
('iptv-6mo-2d', 'IPTV 6 Month - 2 Devices', 'Real product mapped to Content Marketing Duo Semi-Annual', 6500, NULL, 'iptv', 'prod_TYuaivCe1pQdgI', 'price_1SbmlaHBw27Y92CiPYPrIGa9', true),
('iptv-6mo-3d', 'IPTV 6 Month - 3 Devices', 'Real product mapped to Content Marketing Team Semi-Annual', 8500, NULL, 'iptv', 'prod_TYuaH29hPrerUZ', 'price_1SbmlaHBw27Y92Cih3mZcDZx', true),
('iptv-6mo-4d', 'IPTV 6 Month - 4 Devices', 'Real product mapped to Content Marketing Business Semi-Annual', 10000, NULL, 'iptv', 'prod_TYua2bcCDybLpF', 'price_1SbmlbHBw27Y92Ci9kGAilIz', true),
('iptv-6mo-5d', 'IPTV 6 Month - 5 Devices', 'Real product mapped to Content Marketing Enterprise Semi-Annual', 12500, NULL, 'iptv', 'prod_TYua5RwHFhIzPS', 'price_1SbmlbHBw27Y92Cics46lUBT', true),
('iptv-1yr', 'IPTV Annual', 'Real product mapped to SEO Annual', 7500, NULL, 'iptv', 'prod_TYuaVCaJDNlWlC', 'price_1SbmlcHBw27Y92Cies3NQNwH', true),
('iptv-1yr-1d', 'IPTV 1 Year - 1 Device', 'Real product mapped to Digital Marketing Annual', 6500, NULL, 'iptv', 'prod_TYuaVuwHRccbeH', 'price_1SbmlcHBw27Y92Ci3iazZ0AN', true),
('iptv-1yr-2d', 'IPTV 1 Year - 2 Devices', 'Real product mapped to Digital Marketing Duo Annual', 10000, NULL, 'iptv', 'prod_TYuaA7Ctu6QzEA', 'price_1SbmldHBw27Y92CiV83j4QzU', true),
('iptv-1yr-3d', 'IPTV 1 Year - 3 Devices', 'Real product mapped to Digital Marketing Team Annual', 14000, NULL, 'iptv', 'prod_TYuaXyIp7sEbF0', 'price_1SbmleHBw27Y92Ci1asKdkPq', true),
('iptv-1yr-4d', 'IPTV 1 Year - 4 Devices', 'Real product mapped to Digital Marketing Business Annual', 19000, NULL, 'iptv', 'prod_TYua1nl7rkDUFc', 'price_1SbmleHBw27Y92CiB8gWsIOn', true),
('iptv-1yr-5d', 'IPTV 1 Year - 5 Devices', 'Real product mapped to Digital Marketing Enterprise Annual', 22000, NULL, 'iptv', 'prod_TYuaZVC0JtfIk0', 'price_1SbmlfHBw27Y92CiTlrzgkoI', true);

-- Step 6: Verify the update
SELECT id, name, price, shadow_product_id, shadow_price_id FROM real_products ORDER BY category, id;
