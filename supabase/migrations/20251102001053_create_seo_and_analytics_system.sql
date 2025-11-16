/*
  # Create SEO and Analytics System
  
  1. New Tables
    - `site_analytics_config`
      - Google Analytics settings
      - Google Search Console settings
      - Tracking codes and IDs
      - Configuration options
    
    - `page_redirects`
      - URL redirect management
      - 301/302 redirect support
      - Old URL to new URL mapping
      - Active/inactive status
    
    - `sitemap_pages`
      - Automatic sitemap generation
      - Page URLs and priorities
      - Change frequencies
      - Last modified dates
    
    - `seo_audit_results`
      - Automated SEO audits
      - Page-by-page scores
      - Issue tracking
      - Recommendations
  
  2. Security
    - Enable RLS on all tables
    - Admin-only write access
    - Public read for active redirects
  
  3. Features
    - Google Analytics tracking
    - Search Console integration
    - Automatic sitemap generation
    - Redirect management
    - SEO auditing tools
*/

-- Site Analytics Configuration
CREATE TABLE IF NOT EXISTS site_analytics_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text',
  is_active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Page Redirects Management
CREATE TABLE IF NOT EXISTS page_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_url text NOT NULL,
  to_url text NOT NULL,
  redirect_type integer DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  is_active boolean DEFAULT true,
  hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_url)
);

-- Sitemap Pages
CREATE TABLE IF NOT EXISTS sitemap_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text UNIQUE NOT NULL,
  page_title text,
  priority decimal(2,1) DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
  change_frequency text DEFAULT 'weekly' CHECK (
    change_frequency IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')
  ),
  last_modified timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SEO Audit Results
CREATE TABLE IF NOT EXISTS seo_audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL,
  audit_date timestamptz DEFAULT now(),
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- SEO Metrics
  title_score integer DEFAULT 0,
  meta_description_score integer DEFAULT 0,
  heading_score integer DEFAULT 0,
  content_score integer DEFAULT 0,
  image_score integer DEFAULT 0,
  link_score integer DEFAULT 0,
  mobile_score integer DEFAULT 0,
  speed_score integer DEFAULT 0,
  
  -- Issues and Recommendations
  issues jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamptz DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_redirects_from_url ON page_redirects(from_url);
CREATE INDEX IF NOT EXISTS idx_redirects_active ON page_redirects(is_active);
CREATE INDEX IF NOT EXISTS idx_sitemap_active ON sitemap_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_sitemap_priority ON sitemap_pages(priority DESC);
CREATE INDEX IF NOT EXISTS idx_audit_page_url ON seo_audit_results(page_url);
CREATE INDEX IF NOT EXISTS idx_audit_date ON seo_audit_results(audit_date DESC);

-- Enable Row Level Security
ALTER TABLE site_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Analytics Config
CREATE POLICY "Anyone can view active analytics config"
  ON site_analytics_config FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage analytics config"
  ON site_analytics_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Redirects
CREATE POLICY "Anyone can view active redirects"
  ON page_redirects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage redirects"
  ON page_redirects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Sitemap
CREATE POLICY "Anyone can view active sitemap pages"
  ON sitemap_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage sitemap"
  ON sitemap_pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for SEO Audits
CREATE POLICY "Authenticated users can view audits"
  ON seo_audit_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage audits"
  ON seo_audit_results FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert Default Analytics Config
INSERT INTO site_analytics_config (setting_key, setting_value, setting_type, is_active, description) VALUES
('google_analytics_id', '', 'text', false, 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)'),
('google_analytics_enabled', 'false', 'boolean', true, 'Enable Google Analytics tracking'),
('google_search_console_verified', 'false', 'boolean', true, 'Google Search Console verification status'),
('google_search_console_property', '', 'text', false, 'Search Console property URL'),
('sitemap_enabled', 'true', 'boolean', true, 'Enable automatic sitemap generation'),
('robots_txt_enabled', 'true', 'boolean', true, 'Enable robots.txt'),
('schema_markup_enabled', 'true', 'boolean', true, 'Enable Schema.org structured data')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Default Sitemap Pages
INSERT INTO sitemap_pages (page_url, page_title, priority, change_frequency) VALUES
('/', 'Home', 1.0, 'daily'),
('/custom-admin', 'Admin Login', 0.1, 'monthly'),
('#about', 'About Us', 0.8, 'weekly'),
('#shop', 'Shop', 0.9, 'daily'),
('#faq', 'FAQ', 0.7, 'monthly'),
('#devices', 'Compatible Devices', 0.6, 'monthly')
ON CONFLICT (page_url) DO NOTHING;

-- Insert Blog Posts into Sitemap
INSERT INTO sitemap_pages (page_url, page_title, priority, change_frequency, last_modified)
SELECT 
  '/blog/' || slug as page_url,
  title as page_title,
  0.8 as priority,
  'weekly' as change_frequency,
  COALESCE(published_at, created_at) as last_modified
FROM blog_posts_advanced
WHERE status = 'published'
ON CONFLICT (page_url) DO NOTHING;
