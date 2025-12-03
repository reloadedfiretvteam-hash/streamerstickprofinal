/*
  # Create real_products Table with Cloaking Support
  
  Creates the real_products table that stores:
  - Real product names (what customers see: "IPTV Subscription", "Fire Stick")
  - Cloaked names (what Stripe sees: "Digital Entertainment Service")
  - Prices, descriptions, and all product details
  
  This enables Stripe compliance while showing customers actual products.
*/

-- Create real_products table
CREATE TABLE IF NOT EXISTS real_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  cost decimal(10,2),
  sku text UNIQUE,
  stock_quantity integer DEFAULT 999,
  stock_status text DEFAULT 'instock',
  featured boolean DEFAULT false,
  status text DEFAULT 'published',
  category text,
  tags text[],
  main_image text,
  gallery_images text[],
  weight decimal(10,2),
  dimensions jsonb DEFAULT '{}',
  attributes jsonb DEFAULT '{}',
  meta_title text,
  meta_description text,
  seo_score integer DEFAULT 0,
  view_count integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  cloaked_name text NOT NULL DEFAULT 'Digital Entertainment Service',
  service_url text DEFAULT 'http://ky-tv.cc',
  setup_video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE real_products ENABLE ROW LEVEL SECURITY;

-- Allow public to read published products
CREATE POLICY "Public can view published products"
  ON real_products
  FOR SELECT
  USING (status = 'published');

-- Allow authenticated users to manage products
CREATE POLICY "Authenticated users can manage products"
  ON real_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_real_products_status ON real_products(status);
CREATE INDEX IF NOT EXISTS idx_real_products_category ON real_products(category);
CREATE INDEX IF NOT EXISTS idx_real_products_cloaked_name ON real_products(cloaked_name);
CREATE INDEX IF NOT EXISTS idx_real_products_slug ON real_products(slug);

-- Comments
COMMENT ON TABLE real_products IS 'Real products with cloaking: customers see real names, Stripe sees cloaked names';
COMMENT ON COLUMN real_products.name IS 'Real product name shown to customers (e.g., "IPTV Subscription 1 Month")';
COMMENT ON COLUMN real_products.cloaked_name IS 'Stripe-compliant name shown to Stripe (e.g., "Digital Entertainment Service")';
COMMENT ON COLUMN real_products.service_url IS 'IPTV service URL for customer login';
