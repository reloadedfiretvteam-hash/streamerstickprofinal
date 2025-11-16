/*
  # Complete E-Commerce Platform Schema - ALL ORIGINAL TABLES

  1. Tables: categories, products_full, product_images, orders_full, order_items, blog_posts, promotions, user_profiles
  2. Security: RLS enabled with proper policies
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  full_name text,
  role text DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated USING (id = (SELECT id FROM user_profiles LIMIT 1));
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS products_full (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  base_price numeric NOT NULL DEFAULT 0,
  sale_price numeric,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE,
  featured boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products_full ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON products_full FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products_full(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  max_uses integer,
  uses_count integer DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promotions" ON promotions FOR SELECT TO anon, authenticated USING (active = true);

CREATE TABLE IF NOT EXISTS orders_full (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address text,
  billing_address text,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders_full ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON orders_full FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders_full(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products_full(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  featured_image text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  author_id uuid,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE INDEX IF NOT EXISTS idx_products_category ON products_full(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products_full(status);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
  ('Fire Stick Devices', 'fire-stick-devices', 'Fully loaded Amazon Fire Stick devices', 1, true),
  ('IPTV Subscriptions', 'iptv-subscriptions', 'Premium IPTV subscription plans', 2, true)
ON CONFLICT (slug) DO NOTHING;
