/*
  # Complete Functional Admin System

  1. New Tables
    - `real_products` - Actual products with full details
    - `real_blog_posts` - Actual blog content with SEO scores
    - `frontend_containers` - Homepage sections/containers for visual editing
    - `frontend_elements` - Individual elements within containers
    - `product_images` - Multiple images per product
    - `product_variants` - Size, color, plan variations
    - `promotions` - Active discounts and coupons
    - `customer_orders` - Real order data
    - `email_campaigns` - Marketing emails
    - `form_submissions` - Form responses
    - `popup_campaigns` - Active popups
    - `site_settings` - Global site configuration
    
  2. All tables include full CRUD capability
  3. RLS enabled for security
  4. Real data structure matching frontend
*/

-- Real Products Table (Actual products from site)
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
  stock_quantity integer DEFAULT 0,
  stock_status text DEFAULT 'instock', -- 'instock', 'outofstock', 'onbackorder'
  featured boolean DEFAULT false,
  status text DEFAULT 'publish', -- 'publish', 'draft', 'private'
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product Variants (for different options)
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES real_products(id) ON DELETE CASCADE,
  variant_name text NOT NULL, -- e.g., "3 Month", "6 Month", "Premium"
  price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  attributes jsonb DEFAULT '{}', -- e.g., {"duration": "3 months", "quality": "HD"}
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Blog Posts (Actual blog content)
CREATE TABLE IF NOT EXISTS real_blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  author text DEFAULT 'Admin',
  category text,
  tags text[],
  status text DEFAULT 'publish', -- 'publish', 'draft', 'private'
  meta_title text,
  meta_description text,
  focus_keyword text,
  seo_score integer DEFAULT 0,
  readability_score integer DEFAULT 0,
  word_count integer DEFAULT 0,
  internal_links integer DEFAULT 0,
  external_links integer DEFAULT 0,
  view_count integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Frontend Containers (Homepage sections)
CREATE TABLE IF NOT EXISTS frontend_containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_name text NOT NULL,
  container_type text NOT NULL, -- 'hero', 'features', 'pricing', 'testimonials', 'cta'
  position_order integer NOT NULL,
  is_visible boolean DEFAULT true,
  background_color text DEFAULT '#ffffff',
  background_image text,
  padding text DEFAULT '20px',
  margin text DEFAULT '0px',
  custom_css text,
  custom_classes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Frontend Elements (Individual elements in containers)
CREATE TABLE IF NOT EXISTS frontend_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id uuid REFERENCES frontend_containers(id) ON DELETE CASCADE,
  element_type text NOT NULL, -- 'text', 'heading', 'button', 'image', 'video', 'form'
  element_name text,
  content jsonb DEFAULT '{}',
  styles jsonb DEFAULT '{}',
  attributes jsonb DEFAULT '{}',
  position_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Orders (Real order data)
CREATE TABLE IF NOT EXISTS customer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  billing_address jsonb DEFAULT '{}',
  shipping_address jsonb DEFAULT '{}',
  order_items jsonb NOT NULL, -- Array of products with quantities
  subtotal decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  shipping_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  payment_method text,
  payment_status text DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  order_status text DEFAULT 'processing', -- 'pending', 'processing', 'completed', 'cancelled'
  notes text,
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promotions & Coupons
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL, -- 'percentage', 'fixed', 'bogo', 'free_shipping'
  value decimal(10,2) NOT NULL,
  description text,
  min_purchase decimal(10,2),
  max_uses integer,
  uses_count integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  applicable_products uuid[], -- Array of product IDs
  created_at timestamptz DEFAULT now()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
  recipients_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name text NOT NULL,
  form_data jsonb NOT NULL,
  submitter_email text,
  submitter_ip text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Popup Campaigns
CREATE TABLE IF NOT EXISTS popup_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_name text NOT NULL,
  popup_type text NOT NULL, -- 'exit-intent', 'time-delay', 'scroll-trigger'
  content jsonb NOT NULL,
  trigger_settings jsonb DEFAULT '{}',
  targeting_rules jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  conversions_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Site Settings (Global configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL, -- 'general', 'seo', 'payment', 'email', 'theme'
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE real_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE frontend_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE frontend_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - adjust as needed)
CREATE POLICY "Allow public read products" ON real_products FOR SELECT TO anon, authenticated USING (status = 'publish');
CREATE POLICY "Allow admin full access products" ON real_products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read variants" ON product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow admin full access variants" ON product_variants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read published posts" ON real_blog_posts FOR SELECT TO anon, authenticated USING (status = 'publish');
CREATE POLICY "Allow admin full access posts" ON real_blog_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read containers" ON frontend_containers FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "Allow admin full access containers" ON frontend_containers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read elements" ON frontend_elements FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "Allow admin full access elements" ON frontend_elements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access orders" ON customer_orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access promotions" ON promotions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access campaigns" ON email_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access submissions" ON form_submissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read popups" ON popup_campaigns FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Allow admin full access popups" ON popup_campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow admin full access settings" ON site_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_real_products_slug ON real_products(slug);
CREATE INDEX IF NOT EXISTS idx_real_products_status ON real_products(status);
CREATE INDEX IF NOT EXISTS idx_real_products_category ON real_products(category);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_real_blog_posts_slug ON real_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_real_blog_posts_status ON real_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_frontend_containers_position ON frontend_containers(position_order);
CREATE INDEX IF NOT EXISTS idx_frontend_elements_container ON frontend_elements(container_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_email ON customer_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(order_status);

-- Insert actual products from your site
INSERT INTO real_products (name, slug, description, price, sale_price, sku, stock_quantity, category, main_image, status, featured) VALUES
('3 Month IPTV Subscription', '3-month-iptv', 'Stream unlimited channels with our 3-month IPTV subscription. 10,000+ live channels, 4K quality, no buffering.', 29.99, 24.99, 'IPTV-3M', 999, 'subscriptions', '/OIP (11) websit pic.jpg', 'publish', true),
('6 Month IPTV Subscription', '6-month-iptv', 'Save more with our 6-month IPTV plan. Best value for serious cord-cutters.', 54.99, 44.99, 'IPTV-6M', 999, 'subscriptions', '/OIP (11) websit pic.jpg', 'publish', true),
('12 Month IPTV Subscription', '12-month-iptv', 'Our most popular plan! Full year of unlimited streaming at the best price.', 99.99, 79.99, 'IPTV-12M', 999, 'subscriptions', '/OIP (11) websit pic.jpg', 'publish', true),
('Fire Stick 4K with IPTV Pre-loaded', 'firestick-4k-preloaded', 'Get started instantly! Fire Stick 4K with IPTV pre-installed and configured.', 89.99, 79.99, 'FS-4K-IPTV', 50, 'devices', '/71+Pvh7WB6L._AC_SL1500_.jpg', 'publish', true),
('Premium Fire TV Cube', 'fire-tv-cube-premium', 'Ultimate streaming device with hands-free Alexa. IPTV ready.', 149.99, 129.99, 'FTC-PREM', 25, 'devices', '/71E1te69hZL._AC_SL1500_.jpg', 'publish', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert default homepage containers
INSERT INTO frontend_containers (container_name, container_type, position_order, background_color) VALUES
('Hero Section', 'hero', 1, '#1a1a1a'),
('Features Section', 'features', 2, '#ffffff'),
('Pricing Section', 'pricing', 3, '#f5f5f5'),
('Why Choose Us', 'benefits', 4, '#ffffff'),
('Testimonials', 'testimonials', 5, '#1a1a1a'),
('Call to Action', 'cta', 6, '#ff6600')
ON CONFLICT DO NOTHING;

-- Insert sample blog post
INSERT INTO real_blog_posts (title, slug, content, excerpt, category, meta_title, meta_description, focus_keyword, seo_score, status) VALUES
('How to Cut the Cord and Save Money with IPTV', 'cut-cord-save-money-iptv', 
'Tired of expensive cable bills? Learn how IPTV can save you hundreds of dollars per year while giving you access to more content...', 
'Discover how to save money by switching from cable to IPTV streaming.', 
'guides',
'Cut the Cord: Save Money with IPTV Streaming | Complete Guide',
'Learn how to cancel cable and switch to IPTV. Save $100+/month with our complete guide to cord-cutting and IPTV subscriptions.',
'cut the cord iptv',
85,
'publish')
ON CONFLICT (slug) DO NOTHING;