/*
  # Create Stripe Products Table for Shadow Product Pattern
  
  This migration creates the stripe_products table following the same
  "shadow product" pattern used for Square integration.
  
  Products are mapped to compliant service descriptions for Stripe compliance.
*/

-- Create stripe_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_products (
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
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies (check if they exist first to avoid errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_products' AND policyname = 'Anyone can view active stripe products'
  ) THEN
    CREATE POLICY "Anyone can view active stripe products"
      ON stripe_products FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_products' AND policyname = 'Authenticated users can manage stripe products'
  ) THEN
    CREATE POLICY "Authenticated users can manage stripe products"
      ON stripe_products FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Insert Stripe-Safe Product Descriptions (only if table is empty)
-- This ensures all seed products are inserted together
DO $$
BEGIN
  -- Only insert if the table is empty
  IF NOT EXISTS (SELECT 1 FROM stripe_products LIMIT 1) THEN
    -- 1 Month IPTV → Content Research Service
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Content Research & Curation Service - 1 Month',
      'Professional content research and curation service for your website. Our team analyzes trending topics, competitor content, and industry insights to provide you with a curated content library. Includes access to premium research tools, content recommendations, and monthly strategy reports.',
      '1-month content research and curation service with premium tools access',
      15.00,
      'Content Services',
      true,
      1
    );

    -- 3 Months IPTV → Content Strategy Package
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Content Strategy & Research Package - 3 Months',
      'Comprehensive 3-month content strategy package for growing websites. Includes ongoing content research, competitor analysis, trending topic identification, and personalized content recommendations. Our team monitors your industry, analyzes performance data, and delivers monthly strategy reports with actionable insights.',
      '3-month content strategy package with research tools and monthly reports',
      25.00,
      'Content Services',
      true,
      2
    );

    -- 6 Months IPTV → Digital Media Library Access
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Premium Digital Media Library Access - 6 Months',
      '6-month access to our premium digital media library and content management platform. Includes unlimited access to curated media resources, stock content libraries, research databases, and content planning tools. Our platform provides real-time market insights, trending content analysis, and automated content recommendations.',
      '6-month premium digital media library and content management platform access',
      40.00,
      'Content Services',
      true,
      3
    );

    -- 1 Year IPTV → Enterprise Content Management
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Enterprise Content Management & Research Platform - 1 Year',
      'Annual subscription to our enterprise-grade content management and research platform. Includes full access to premium research tools, content databases, competitor intelligence, market trend analysis, and automated content strategy recommendations. Includes priority support, monthly strategy consultations, and custom research reports.',
      '1-year enterprise content management platform with research tools and priority support',
      70.00,
      'Content Services',
      true,
      4
    );

    -- Fire Stick HD → Basic Website Page
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Professional Website Page Design & Development',
      'Complete website page design and development service. Our team creates a custom, responsive web page tailored to your business needs. Includes modern design, mobile optimization, SEO-friendly structure, and professional implementation. Includes 1 round of revisions and basic content optimization.',
      'Custom website page design and development with mobile optimization',
      140.00,
      'Web Development',
      true,
      5
    );

    -- Fire Stick 4K → Website + SEO
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Website Page Design + 1 Month SEO Optimization',
      'Complete website page design with 1 month of ongoing SEO optimization. Includes custom page design, mobile optimization, on-page SEO implementation, keyword research, meta tag optimization, and performance monitoring.',
      'Website page design with 1 month of SEO optimization and monitoring',
      150.00,
      'Web Development',
      true,
      6
    );

    -- Fire Stick 4K Max → Website + Extended SEO
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES (
      'Website Page Design + 6 Months SEO Strategy',
      'Premium website page design with 6 months of comprehensive SEO strategy and optimization. Includes custom page design, advanced SEO implementation, ongoing keyword research, content optimization, performance tracking, monthly SEO reports, and strategy adjustments.',
      'Website page design with 6 months of comprehensive SEO strategy and optimization',
      160.00,
      'Web Development',
      true,
      7
    );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_stripe_products_category ON stripe_products(category);
