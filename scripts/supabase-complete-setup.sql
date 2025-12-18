-- StreamStickPro Complete Supabase Setup
-- Run this entire script in Supabase SQL Editor to set up full independence from Replit

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. PRODUCTS TABLE (real_products)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.real_products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  image_url text,
  category text,
  shadow_product_id text UNIQUE,
  shadow_price_id text UNIQUE
);

CREATE INDEX IF NOT EXISTS real_products_category_idx ON public.real_products (category);

-- Enable RLS and allow public read
ALTER TABLE public.real_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.real_products;
CREATE POLICY "Allow public read access" ON public.real_products FOR SELECT USING (true);

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL,
  full_name text,
  phone text,
  status text DEFAULT 'active',
  notes text,
  total_orders integer DEFAULT 0,
  last_order_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers (email);
CREATE INDEX IF NOT EXISTS customers_status_idx ON public.customers (status);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_customer_id text,
  shadow_product_id text,
  shadow_price_id text,
  real_product_id text REFERENCES public.real_products(id),
  real_product_name text,
  amount integer NOT NULL,
  status text DEFAULT 'pending',
  credentials_sent boolean DEFAULT false,
  shipping_name text,
  shipping_phone text,
  shipping_street text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text,
  fulfillment_status text DEFAULT 'pending',
  amazon_order_id text,
  customer_id uuid,
  is_renewal boolean DEFAULT false,
  existing_username text,
  generated_username text,
  generated_password text,
  country_preference text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_idx ON public.orders (stripe_payment_intent_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_session_idx ON public.orders (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_fulfillment_status_idx ON public.orders (fulfillment_status);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders (customer_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. VISITORS/ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_url text NOT NULL,
  referrer text,
  user_agent text,
  ip_address text,
  country text,
  country_code text,
  region text,
  region_code text,
  city text,
  latitude text,
  longitude text,
  timezone text,
  isp text,
  is_proxy boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitors_session_idx ON public.visitors (session_id);
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON public.visitors (created_at);
CREATE INDEX IF NOT EXISTS visitors_country_idx ON public.visitors (country);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. PAGE EDITS TABLE (for admin page editing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.page_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL,
  section_id text NOT NULL,
  element_id text NOT NULL,
  element_type text NOT NULL,
  content text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS page_edits_element_unique_idx ON public.page_edits (page_id, section_id, element_id);
CREATE INDEX IF NOT EXISTS page_edits_page_idx ON public.page_edits (page_id);

ALTER TABLE public.page_edits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. BLOG_POSTS TABLE (if not already created)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  category text DEFAULT 'Guides',
  featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  keywords text[],
  meta_description text
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts (is_published);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.blog_posts;
CREATE POLICY "Allow public read access" ON public.blog_posts FOR SELECT USING (is_published = true);

-- =====================================================
-- 8. INSERT PRODUCT DATA
-- =====================================================
INSERT INTO public.real_products (id, name, description, price, category, image_url, shadow_product_id, shadow_price_id) VALUES
('iptv-1mo', 'IPTV Monthly', 'Real product mapped to SEO Monthly', 1500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaysNq0ySpUc', 'price_1SbmlSHBw27Y92CiIDBuBYdX'),
('iptv-1mo-1d', 'IPTV 1 Month - 1 Device', 'Real product mapped to SEO Starter Monthly', 1500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaWpHy3Smh0I', 'price_1SbmlSHBw27Y92CiB3LdWOTa'),
('iptv-1mo-2d', 'IPTV 1 Month - 2 Devices', 'Real product mapped to SEO Duo Monthly', 2500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaa21PNETx9W', 'price_1SbmlTHBw27Y92CioPrTd70O'),
('iptv-1mo-3d', 'IPTV 1 Month - 3 Devices', 'Real product mapped to SEO Team Monthly', 3500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuasBt8kmq8JB', 'price_1SbmlTHBw27Y92CiUaSQ4DUe'),
('iptv-1mo-4d', 'IPTV 1 Month - 4 Devices', 'Real product mapped to SEO Business Monthly', 4000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYua25JPl7v9on', 'price_1SbmlUHBw27Y92CiqLSakBYQ'),
('iptv-1mo-5d', 'IPTV 1 Month - 5 Devices', 'Real product mapped to SEO Enterprise Monthly', 4500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYua5NHSyyVifo', 'price_1SbmlUHBw27Y92Ciu2ioIO8m'),
('firestick-hd', 'Fire Stick HD', 'Real product mapped to Web Design Basic', 11900, 'firestick', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg', 'prod_TYEEobMjXf5B3d', 'price_1SbmlQHBw27Y92CikC7hKknE'),
('firestick-4k', 'Fire Stick 4K', 'Real product mapped to Web Design Pro', 12750, 'firestick', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg', 'prod_TYEEFruD8obUE7', 'price_1SbmlRHBw27Y92CiuZhoRKCY'),
('firestick-4k-max', 'Fire Stick 4K Max', 'Real product mapped to Web Design Enterprise', 13600, 'firestick', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg', 'prod_TYEEeLmZMqrUxh', 'price_1SbmlRHBw27Y92CiZhKx5NHU'),
('iptv-3mo', 'IPTV Quarterly', 'Real product mapped to SEO Quarterly', 2500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYua8AOX5F8ick', 'price_1SbmlVHBw27Y92CiTfnst2n6'),
('iptv-3mo-1d', 'IPTV 3 Month - 1 Device', 'Real product mapped to SEO Starter Quarterly', 2500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaZ7ySDhq3JB', 'price_1SbmlWHBw27Y92CixWXndjWA'),
('iptv-3mo-2d', 'IPTV 3 Month - 2 Devices', 'Real product mapped to SEO Duo Quarterly', 4000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaMsEbLCEMwB', 'price_1SbmlWHBw27Y92Cilr8PUZa0'),
('iptv-3mo-3d', 'IPTV 3 Month - 3 Devices', 'Real product mapped to SEO Team Quarterly', 5500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaAE09STa5Rv', 'price_1SbmlXHBw27Y92CiBtcUxVw6'),
('iptv-3mo-4d', 'IPTV 3 Month - 4 Devices', 'Real product mapped to SEO Business Quarterly', 6500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaeQfGsDLQ6h', 'price_1SbmlXHBw27Y92CiPFAunxd0'),
('iptv-3mo-5d', 'IPTV 3 Month - 5 Devices', 'Real product mapped to SEO Enterprise Quarterly', 7500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaqQl59AgP8w', 'price_1SbmlYHBw27Y92CicILuClqr'),
('iptv-6mo', '6 Month IPTV Subscription', 'Premium 6-month IPTV subscription with 18,000+ channels', 5000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaHv9fUWPhX4', 'price_1SbmlYHBw27Y92Cig9wKfsYC'),
('iptv-6mo-1d', 'IPTV 6 Month - 1 Device', 'Real product mapped to Content Marketing Semi-Annual', 4000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaPtKkp5vnTv', 'price_1SbmlZHBw27Y92CiJqAwgziy'),
('iptv-6mo-2d', 'IPTV 6 Month - 2 Devices', 'Real product mapped to Content Marketing Duo Semi-Annual', 6500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaivCe1pQdgI', 'price_1SbmlaHBw27Y92CiPYPrIGa9'),
('iptv-6mo-3d', 'IPTV 6 Month - 3 Devices', 'Real product mapped to Content Marketing Team Semi-Annual', 8500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaH29hPrerUZ', 'price_1SbmlaHBw27Y92Cih3mZcDZx'),
('iptv-6mo-4d', 'IPTV 6 Month - 4 Devices', 'Real product mapped to Content Marketing Business Semi-Annual', 10000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYua2bcCDybLpF', 'price_1SbmlbHBw27Y92Ci9kGAilIz'),
('iptv-6mo-5d', 'IPTV 6 Month - 5 Devices', 'Real product mapped to Content Marketing Enterprise Semi-Annual', 12500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYua5RwHFhIzPS', 'price_1SbmlbHBw27Y92Cics46lUBT'),
('iptv-1yr', 'IPTV Annual', 'Real product mapped to SEO Annual', 7500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaVCaJDNlWlC', 'price_1SbmlcHBw27Y92Cies3NQNwH'),
('iptv-1yr-1d', 'IPTV 1 Year - 1 Device', 'Real product mapped to Digital Marketing Annual', 6500, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaVuwHRccbeH', 'price_1SbmlcHBw27Y92Ci3iazZ0AN'),
('iptv-1yr-2d', 'IPTV 1 Year - 2 Devices', 'Real product mapped to Digital Marketing Duo Annual', 10000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaA7Ctu6QzEA', 'price_1SbmldHBw27Y92CiV83j4QzU'),
('iptv-1yr-3d', 'IPTV 1 Year - 3 Devices', 'Real product mapped to Digital Marketing Team Annual', 14000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaXyIp7sEbF0', 'price_1SbmleHBw27Y92Ci1asKdkPq'),
('iptv-1yr-4d', 'IPTV 1 Year - 4 Devices', 'Real product mapped to Digital Marketing Business Annual', 19000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYua1nl7rkDUFc', 'price_1SbmleHBw27Y92CiB8gWsIOn'),
('iptv-1yr-5d', 'IPTV 1 Year - 5 Devices', 'Real product mapped to Digital Marketing Enterprise Annual', 22000, 'iptv', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'prod_TYuaZVC0JtfIk0', 'price_1SbmlfHBw27Y92CiTlrzgkoI')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  shadow_product_id = EXCLUDED.shadow_product_id,
  shadow_price_id = EXCLUDED.shadow_price_id;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Products count:' as status, count(*) as count FROM public.real_products;
SELECT 'Blog posts count:' as status, count(*) as count FROM public.blog_posts WHERE is_published = true;
