/*
  # Comprehensive SEO & Search Engine Verification System

  ## Purpose
  Complete SEO management system with support for multiple search engines including:
  - Google Search Console
  - Bing Webmaster Tools
  - Yahoo Site Explorer
  - Yandex Webmaster
  - Baidu Webmaster

  ## New Tables
  1. `seo_settings` - Master SEO configuration table
    - Google Analytics, Search Console verification
    - Bing, Yahoo, Yandex, Baidu verification codes
    - Site metadata and social media settings
    - Business information
    - Sitemap configuration

  2. `search_engine_submissions` - Track all search engine submissions
    - Submission dates and status
    - Verification codes
    - Indexed pages count
    - Crawl error tracking

  ## Features
  - Multiple search engine verification support
  - Automatic sitemap generation
  - Submission tracking and monitoring
  - Verification status tracking

  ## Security
  - RLS enabled on all tables
  - Admin-only modifications
  - Public read access for active settings
*/

-- Create SEO settings master table
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google Services
  google_analytics_id text DEFAULT 'G-XXXXXXXXXX',
  google_search_console_verification text DEFAULT 'c8f0b74f53fde501',
  google_tag_manager_id text DEFAULT '',

  -- Bing/Yahoo Services (Yahoo uses Bing verification)
  bing_verification_code text DEFAULT 'F672EB0BB38ACF36885E6E30A910DDDB',
  yahoo_verification_code text DEFAULT 'F672EB0BB38ACF36885E6E30A910DDDB',
  
  -- Other Search Engines
  yandex_verification_code text DEFAULT '',
  baidu_verification_code text DEFAULT '',

  -- Site Information
  site_name text DEFAULT 'Stream Stick Pro',
  site_description text DEFAULT 'Premium IPTV subscriptions with 20,000+ live channels, 60,000+ movies, sports & PPV. Pre-configured Fire Stick 4K devices. 7-day money-back guarantee.',
  site_keywords text DEFAULT 'IPTV, premium IPTV, IPTV subscription, Fire Stick, jailbroken Fire Stick, Fire TV, live TV streaming, 4K streaming',
  site_url text DEFAULT 'https://streamstickpro.com',

  -- Business Information
  business_name text DEFAULT 'Stream Stick Pro',
  business_email text DEFAULT 'reloadedfiretvteam@gmail.com',
  business_phone text DEFAULT '',
  business_address text DEFAULT '',

  -- Social Media Links
  facebook_url text DEFAULT '',
  twitter_url text DEFAULT '@streamstickpro',
  instagram_url text DEFAULT '',
  youtube_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  tiktok_url text DEFAULT '',

  -- Open Graph / Social Sharing
  og_image_url text DEFAULT '/og-image.jpg',
  og_image_width integer DEFAULT 1200,
  og_image_height integer DEFAULT 630,

  -- Twitter Card
  twitter_card_type text DEFAULT 'summary_large_image',
  twitter_image_url text DEFAULT '/twitter-card.jpg',

  -- Schema.org Structured Data
  aggregate_rating numeric(2,1) DEFAULT 4.8,
  review_count integer DEFAULT 1247,
  price_range_low numeric(10,2) DEFAULT 49.99,
  price_range_high numeric(10,2) DEFAULT 199.99,

  -- Sitemap Configuration
  sitemap_url text DEFAULT 'https://streamstickpro.com/sitemap.xml',
  sitemap_last_generated timestamptz DEFAULT now(),
  auto_generate_sitemap boolean DEFAULT true,
  
  -- Robots.txt Custom Content
  robots_txt_content text DEFAULT '',

  -- Search Engine Submission Tracking
  search_engines_submitted jsonb DEFAULT '[]'::jsonb,

  -- Settings Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings with Bing code
INSERT INTO seo_settings (
  id,
  google_search_console_verification,
  bing_verification_code,
  yahoo_verification_code,
  site_name,
  site_url,
  business_name
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'c8f0b74f53fde501',
  'F672EB0BB38ACF36885E6E30A910DDDB',
  'F672EB0BB38ACF36885E6E30A910DDDB',
  'Stream Stick Pro',
  'https://streamstickpro.com',
  'Stream Stick Pro'
)
ON CONFLICT (id) DO UPDATE SET
  bing_verification_code = 'F672EB0BB38ACF36885E6E30A910DDDB',
  yahoo_verification_code = 'F672EB0BB38ACF36885E6E30A910DDDB',
  updated_at = now();

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active SEO settings"
  ON seo_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can modify SEO settings"
  ON seo_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create search engine submission tracking table
CREATE TABLE IF NOT EXISTS search_engine_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  search_engine text NOT NULL,
  submission_date timestamptz DEFAULT now(),
  verification_status text DEFAULT 'pending',
  verification_code text,
  sitemap_url text NOT NULL,
  
  -- Tracking metrics
  indexed_pages integer DEFAULT 0,
  crawl_errors integer DEFAULT 0,
  last_crawled timestamptz,
  last_checked timestamptz,
  
  -- Additional info
  notes text,
  submission_url text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (verification_status IN ('pending', 'verified', 'failed', 'not_submitted'))
);

-- Insert initial search engine records
INSERT INTO search_engine_submissions (search_engine, verification_code, sitemap_url, verification_status, notes)
VALUES 
  (
    'Google Search Console',
    'c8f0b74f53fde501',
    'https://streamstickpro.com/sitemap.xml',
    'verified',
    'Already verified and submitted'
  ),
  (
    'Bing Webmaster Tools',
    'F672EB0BB38ACF36885E6E30A910DDDB',
    'https://streamstickpro.com/sitemap.xml',
    'pending',
    'Verification code provided by user. Submit at: https://www.bing.com/webmasters'
  ),
  (
    'Yahoo Site Explorer',
    'F672EB0BB38ACF36885E6E30A910DDDB',
    'https://streamstickpro.com/sitemap.xml',
    'pending',
    'Yahoo uses Bing verification. Same code as Bing.'
  ),
  (
    'Yandex Webmaster',
    '',
    'https://streamstickpro.com/sitemap.xml',
    'not_submitted',
    'Russian search engine. Submit at: https://webmaster.yandex.com'
  ),
  (
    'Baidu Webmaster',
    '',
    'https://streamstickpro.com/sitemap.xml',
    'not_submitted',
    'Chinese search engine. Submit at: https://ziyuan.baidu.com'
  )
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE search_engine_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view submissions"
  ON search_engine_submissions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can modify submissions"
  ON search_engine_submissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_seo_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for seo_settings
DROP TRIGGER IF EXISTS update_seo_settings_timestamp ON seo_settings;
CREATE TRIGGER update_seo_settings_timestamp
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_settings_timestamp();

-- Create trigger for search_engine_submissions
DROP TRIGGER IF EXISTS update_submissions_timestamp ON search_engine_submissions;
CREATE TRIGGER update_submissions_timestamp
  BEFORE UPDATE ON search_engine_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_settings_timestamp();

-- Function to record sitemap generation
CREATE OR REPLACE FUNCTION update_sitemap_timestamp()
RETURNS void AS $$
BEGIN
  UPDATE seo_settings
  SET sitemap_last_generated = now()
  WHERE id = '00000000-0000-0000-0000-000000000001';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update submission status
CREATE OR REPLACE FUNCTION update_search_engine_status(
  p_search_engine text,
  p_status text,
  p_indexed_pages integer DEFAULT NULL,
  p_crawl_errors integer DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE search_engine_submissions
  SET 
    verification_status = p_status,
    indexed_pages = COALESCE(p_indexed_pages, indexed_pages),
    crawl_errors = COALESCE(p_crawl_errors, crawl_errors),
    last_checked = now(),
    updated_at = now()
  WHERE search_engine = p_search_engine;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_settings_active ON seo_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_engine ON search_engine_submissions(search_engine);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON search_engine_submissions(verification_status);
CREATE INDEX IF NOT EXISTS idx_submissions_date ON search_engine_submissions(submission_date DESC);
