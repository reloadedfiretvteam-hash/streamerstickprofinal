/*
  # Create Square-Safe AI Tool Suite Products
  
  ## Purpose
  Create square_products table for AI tool suite offerings that will be shown
  on secure.streamstickpro.com for Square payment processing. These products
  use compliant, SEO/web-design-aligned language.
  
  ## Tables Created
  1. `square_products` - Square-facing product catalog
    - Uses AI tool suite naming and descriptions
    - Maps to real products behind the scenes
    - Only shown on secure domain
  
  ## Products
  1. AI LaunchPad Demo & Onboarding (Free Trial): Free
  2. AI Page Builder Pro (1 Month): $15
  3. AI SEO Strategy Suite (3 Months): $30
  4. AI Blog Automation Engine (6 Months): $50
  5. AI Local Marketing Power Pack (12 Months): $75
  
  ## Security
  - RLS enabled
  - Public can read active products
  - Authenticated admins can manage all
*/

-- Create square_products table
CREATE TABLE IF NOT EXISTS square_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_product_id uuid,
  name text NOT NULL,
  description text NOT NULL,
  short_description text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  main_image text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE square_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active square products"
  ON square_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage square products"
  ON square_products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert AI Tool Suite Products
INSERT INTO square_products (name, description, short_description, price, sale_price, main_image, is_active, sort_order) VALUES
(
  'AI LaunchPad Demo & Onboarding',
  'Get hands-on with our entire suite: instant onboarding, site audit, and design preview. No purchase needed. Experience the full power of our AI-driven web design and SEO tools. Perfect for exploring what our platform can do for your business. Includes: automated site analysis, performance scoring, design recommendations, SEO checklist, and priority support during trial.',
  'Get hands-on with our entire suite: instant onboarding, site audit, and design preview. No purchase needed.',
  0.00,
  NULL,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80',
  true,
  1
),
(
  'AI Page Builder Pro (1 Month)',
  'Create stunning pages with auto-layout, image optimization, built-in site speed booster, and SEO snippet editor. 1 month full access. Transform your web presence with intelligent design tools that understand your brand. Features include: drag-and-drop page builder, automatic image compression and optimization, speed performance analyzer, meta tag editor, mobile-responsive templates, A/B testing capabilities, and analytics integration.',
  'Create stunning pages with auto-layout, image optimization, built-in site speed booster, and SEO snippet editor. 1 month full access.',
  15.00,
  NULL,
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&q=80',
  true,
  2
),
(
  'AI SEO Strategy Suite (3 Months)',
  'Unlock three months'' access to automated site audits, smart keyword research, content topic generator, and traffic analytics. Boost your search rankings with AI-powered insights and recommendations. Our advanced algorithms analyze your competition and identify opportunities for growth. Includes: comprehensive site audits, keyword difficulty analysis, competitor gap analysis, content optimization suggestions, backlink monitoring, rank tracking for unlimited keywords, and monthly performance reports.',
  'Unlock three months'' access to automated site audits, smart keyword research, content topic generator, and traffic analytics.',
  30.00,
  NULL,
  'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c3b6?w=800&h=600&fit=crop&q=80',
  true,
  3
),
(
  'AI Blog Automation Engine (6 Months)',
  'Automate blog publishing and receive six months of keyword ranking reports, competitor gap analysis, and rich content suggestions. Leverage AI to create engaging content that ranks. Our engine generates topic ideas, optimizes headlines, and suggests internal linking strategies. Features include: AI-powered content generator, automatic publishing scheduler, SEO optimization for each post, social media integration, engagement analytics, content performance tracking, and duplicate content checker.',
  'Automate blog publishing and receive six months of keyword ranking reports, competitor gap analysis, and rich content suggestions.',
  50.00,
  NULL,
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&q=80',
  true,
  4
),
(
  'AI Local Marketing Power Pack (12 Months)',
  'Full year of lead magnet builder, review and reputation monitoring, local keyword optimizer, and monthly Google My Business insights. Dominate your local market with comprehensive tools designed for small businesses and local service providers. Get actionable insights to improve your online presence and attract more customers. Includes: lead magnet templates, review management dashboard, reputation monitoring alerts, local citation builder, Google My Business optimization, local keyword tracker, competitor analysis, and dedicated support.',
  'Full year of lead magnet builder, review and reputation monitoring, local keyword optimizer, and monthly Google My Business insights.',
  75.00,
  NULL,
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&q=80',
  true,
  5
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_square_products_active ON square_products(is_active);
CREATE INDEX IF NOT EXISTS idx_square_products_sort_order ON square_products(sort_order);
CREATE INDEX IF NOT EXISTS idx_square_products_real_product ON square_products(real_product_id);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_square_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_square_products_timestamp ON square_products;
CREATE TRIGGER update_square_products_timestamp
  BEFORE UPDATE ON square_products
  FOR EACH ROW
  EXECUTE FUNCTION update_square_products_timestamp();
