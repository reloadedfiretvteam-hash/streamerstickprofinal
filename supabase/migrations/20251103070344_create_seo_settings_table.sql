/*
  # SEO Settings Management System

  ## New Tables
  1. `seo_settings` - Store all SEO configuration
    - Google Analytics ID
    - Google Search Console verification
    - Social media links
    - Meta tags
    - Business information

  ## Security
  - Enable RLS
  - Only admins can modify
  - Public read for active settings
*/

-- Create SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google Services
  google_analytics_id text DEFAULT 'G-XXXXXXXXXX',
  google_search_console_verification text DEFAULT 'YOUR_GOOGLE_VERIFICATION_CODE',
  google_tag_manager_id text,

  -- Site Information
  site_name text DEFAULT 'Inferno TV',
  site_description text DEFAULT 'Premium IPTV subscriptions with 20,000+ live channels, movies, sports & PPV. Jailbroken Fire Stick 4K devices. 7-day money-back guarantee.',
  site_keywords text DEFAULT 'IPTV, premium IPTV, IPTV subscription, Fire Stick, jailbroken Fire Stick, Fire TV, live TV streaming',

  -- Business Information
  business_name text DEFAULT 'Inferno TV',
  business_email text DEFAULT 'reloadedfiretvteam@gmail.com',
  business_phone text DEFAULT '',
  business_address text DEFAULT '',

  -- Social Media Links
  facebook_url text DEFAULT '',
  twitter_url text DEFAULT '@infernotv',
  instagram_url text DEFAULT '',
  youtube_url text DEFAULT '',
  linkedin_url text DEFAULT '',

  -- Open Graph
  og_image_url text DEFAULT '/og-image.jpg',
  og_image_width integer DEFAULT 1200,
  og_image_height integer DEFAULT 630,

  -- Twitter Card
  twitter_card_type text DEFAULT 'summary_large_image',
  twitter_image_url text DEFAULT '/twitter-card.jpg',

  -- Schema.org
  aggregate_rating numeric(2,1) DEFAULT 4.8,
  review_count integer DEFAULT 1247,
  price_range_low numeric(10,2) DEFAULT 49.99,
  price_range_high numeric(10,2) DEFAULT 199.99,

  -- Settings
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO seo_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active SEO settings"
  ON seo_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can modify SEO settings"
  ON seo_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_seo_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_seo_settings_timestamp ON seo_settings;
CREATE TRIGGER update_seo_settings_timestamp
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_settings_timestamp();
