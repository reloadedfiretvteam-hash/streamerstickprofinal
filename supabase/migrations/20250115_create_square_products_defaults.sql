/*
  # Create Default Square-Safe Products
  
  This migration creates Square-safe product descriptions for IPTV subscriptions
  that make sense for a website/SEO business context.
  
  Products are mapped as:
  - IPTV Subscriptions → Content Management & Research Services
  - Fire Sticks → Website Development & SEO Services
*/

-- Create square_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS square_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_product_id uuid REFERENCES real_products(id),
  name text NOT NULL,
  description text NOT NULL,
  short_description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  image_url text,
  category text DEFAULT 'Digital Services',
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

-- Insert Square-Safe Product Descriptions
-- These will be linked to real products via the admin panel

-- 1 Month IPTV → Content Research Service
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Content Research & Curation Service - 1 Month',
  'Professional content research and curation service for your website. Our team analyzes trending topics, competitor content, and industry insights to provide you with a curated content library. Includes access to premium research tools, content recommendations, and monthly strategy reports. Perfect for bloggers, content creators, and digital marketers who need fresh content ideas and market intelligence.',
  '1-month content research and curation service with premium tools access',
  15.00,
  'Content Services',
  true,
  1
) ON CONFLICT DO NOTHING;

-- 3 Months IPTV → Content Strategy Package
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Content Strategy & Research Package - 3 Months',
  'Comprehensive 3-month content strategy package for growing websites. Includes ongoing content research, competitor analysis, trending topic identification, and personalized content recommendations. Our team monitors your industry, analyzes performance data, and delivers monthly strategy reports with actionable insights. Includes access to premium research databases and content planning tools. Ideal for businesses building their content marketing presence.',
  '3-month content strategy package with research tools and monthly reports',
  25.00,
  'Content Services',
  true,
  2
) ON CONFLICT DO NOTHING;

-- 6 Months IPTV → Digital Media Library Access
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Premium Digital Media Library Access - 6 Months',
  '6-month access to our premium digital media library and content management platform. Includes unlimited access to curated media resources, stock content libraries, research databases, and content planning tools. Our platform provides real-time market insights, trending content analysis, and automated content recommendations based on your niche. Perfect for agencies, content teams, and serious content creators who need comprehensive media resources.',
  '6-month premium digital media library and content management platform access',
  40.00,
  'Content Services',
  true,
  3
) ON CONFLICT DO NOTHING;

-- 1 Year IPTV → Enterprise Content Management
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Enterprise Content Management & Research Platform - 1 Year',
  'Annual subscription to our enterprise-grade content management and research platform. Includes full access to premium research tools, content databases, competitor intelligence, market trend analysis, and automated content strategy recommendations. Our platform provides real-time industry insights, content performance analytics, and personalized content roadmaps. Includes priority support, monthly strategy consultations, and custom research reports. Best value for agencies, content teams, and businesses serious about content marketing success.',
  '1-year enterprise content management platform with research tools and priority support',
  70.00,
  'Content Services',
  true,
  4
) ON CONFLICT DO NOTHING;

-- Fire Stick HD → Basic Website Page
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Professional Website Page Design & Development',
  'Complete website page design and development service. Our team creates a custom, responsive web page tailored to your business needs. Includes modern design, mobile optimization, SEO-friendly structure, and professional implementation. Perfect for adding new pages to existing sites or creating standalone landing pages. Includes 1 round of revisions and basic content optimization.',
  'Custom website page design and development with mobile optimization',
  140.00,
  'Web Development',
  true,
  5
) ON CONFLICT DO NOTHING;

-- Fire Stick 4K → Website + SEO
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Website Page Design + 1 Month SEO Optimization',
  'Complete website page design with 1 month of ongoing SEO optimization. Includes custom page design, mobile optimization, on-page SEO implementation, keyword research, meta tag optimization, and performance monitoring. Our team designs your page with SEO best practices built-in, then provides a month of optimization and monitoring to ensure maximum search visibility.',
  'Website page design with 1 month of SEO optimization and monitoring',
  150.00,
  'Web Development',
  true,
  6
) ON CONFLICT DO NOTHING;

-- Fire Stick 4K Max → Website + Extended SEO
INSERT INTO square_products (
  name,
  description,
  short_description,
  price,
  category,
  is_active,
  sort_order
) VALUES (
  'Website Page Design + 6 Months SEO Strategy',
  'Premium website page design with 6 months of comprehensive SEO strategy and optimization. Includes custom page design, advanced SEO implementation, ongoing keyword research, content optimization, performance tracking, monthly SEO reports, and strategy adjustments. Our team provides long-term SEO support to help your page rank higher and drive organic traffic. Best value for businesses serious about search visibility.',
  'Website page design with 6 months of comprehensive SEO strategy and optimization',
  160.00,
  'Web Development',
  true,
  7
) ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_square_products_active ON square_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_square_products_category ON square_products(category);





