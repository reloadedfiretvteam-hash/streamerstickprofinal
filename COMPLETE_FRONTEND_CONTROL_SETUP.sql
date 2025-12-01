-- ============================================================
-- COMPLETE FRONTEND CONTROL SETUP
-- This gives you 100% control of your website via admin panel
-- Run this AFTER ADMIN_PANEL_COMPLETE_SETUP.sql
-- ============================================================

-- 1. SECTION IMAGES (For Hero and all section backgrounds)
CREATE TABLE IF NOT EXISTS section_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text UNIQUE NOT NULL, -- 'hero', 'about', 'features', etc.
  image_url text NOT NULL,
  image_type text DEFAULT 'background', -- 'background', 'overlay', 'icon', etc.
  alt_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE section_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read section images" ON section_images;
CREATE POLICY "Public can read section images"
  ON section_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage section images" ON section_images;
CREATE POLICY "Authenticated users can manage section images"
  ON section_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default hero image
INSERT INTO section_images (section_name, image_url, alt_text)
VALUES ('hero', 'hero-firestick-breakout.jpg', 'Hero background - Fire Stick breaking out of jail cell')
ON CONFLICT (section_name) DO NOTHING;

-- Update trigger
DROP TRIGGER IF EXISTS update_section_images_timestamp ON section_images;
CREATE TRIGGER update_section_images_timestamp BEFORE UPDATE ON section_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. FRONTEND SETTINGS (Controls all frontend features and content)
CREATE TABLE IF NOT EXISTS frontend_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text', -- 'text', 'boolean', 'number', 'json'
  category text DEFAULT 'general',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE frontend_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read frontend settings" ON frontend_settings;
CREATE POLICY "Public can read frontend settings"
  ON frontend_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage frontend settings" ON frontend_settings;
CREATE POLICY "Authenticated users can manage frontend settings"
  ON frontend_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default frontend settings
INSERT INTO frontend_settings (setting_key, setting_value, setting_type, category, description) VALUES
  ('hero_title', 'Stream Stick Pro', 'text', 'hero', 'Main hero title'),
  ('hero_subtitle', 'Premium IPTV Subscriptions & Jailbroken Fire Stick Shop', 'text', 'hero', 'Hero subtitle'),
  ('hero_cta_primary', 'Shop Now', 'text', 'hero', 'Primary CTA button text'),
  ('hero_cta_secondary', 'Learn More', 'text', 'hero', 'Secondary CTA button text'),
  ('show_urgency_timer', 'false', 'boolean', 'features', 'Show urgency timer on product pages'),
  ('show_trust_badges', 'true', 'boolean', 'features', 'Show trust badges'),
  ('show_social_proof', 'true', 'boolean', 'features', 'Show social proof notifications'),
  ('show_comparison_table', 'true', 'boolean', 'features', 'Show product comparison table'),
  ('show_money_back_guarantee', 'true', 'boolean', 'features', 'Show money back guarantee badge'),
  ('show_reviews_carousel', 'true', 'boolean', 'features', 'Show reviews carousel'),
  ('show_email_popup', 'true', 'boolean', 'features', 'Show email capture popup'),
  ('social_proof_interval', '90', 'number', 'features', 'Social proof notification interval in seconds'),
  ('trust_badge_count', '6', 'number', 'features', 'Number of trust badges to show')
ON CONFLICT (setting_key) DO NOTHING;

-- Update trigger
DROP TRIGGER IF EXISTS update_frontend_settings_timestamp ON frontend_settings;
CREATE TRIGGER update_frontend_settings_timestamp BEFORE UPDATE ON frontend_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. HOMEPAGE SECTIONS (For full control of homepage layout and content)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text UNIQUE NOT NULL, -- 'hero', 'features', 'about', 'testimonials', etc.
  section_name text NOT NULL,
  section_title text,
  section_content text,
  background_color text DEFAULT '#1f2937',
  text_color text DEFAULT '#ffffff',
  padding_top text DEFAULT '5rem',
  padding_bottom text DEFAULT '5rem',
  is_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  custom_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible homepage sections" ON homepage_sections;
CREATE POLICY "Public can read visible homepage sections"
  ON homepage_sections FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Authenticated users can manage homepage sections" ON homepage_sections;
CREATE POLICY "Authenticated users can manage homepage sections"
  ON homepage_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default homepage sections
INSERT INTO homepage_sections (section_id, section_name, section_title, is_visible, display_order) VALUES
  ('hero', 'Hero Section', 'Welcome to Stream Stick Pro', true, 1),
  ('features', 'Features Section', 'Why Choose Us', true, 2),
  ('about', 'About Section', 'About Our Services', true, 3),
  ('testimonials', 'Testimonials', 'What Our Customers Say', true, 4),
  ('products', 'Products Section', 'Our Products', true, 5),
  ('cta', 'Call to Action', 'Get Started Today', true, 6)
ON CONFLICT (section_id) DO NOTHING;

-- Update trigger
DROP TRIGGER IF EXISTS update_homepage_sections_timestamp ON homepage_sections;
CREATE TRIGGER update_homepage_sections_timestamp BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. CONTAINER SETTINGS (For styling containers/boxes on frontend)
CREATE TABLE IF NOT EXISTS container_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id text UNIQUE NOT NULL, -- Unique identifier for each container
  container_type text DEFAULT 'section', -- 'section', 'card', 'box', 'banner', etc.
  background_color text,
  text_color text,
  border_color text,
  border_width text DEFAULT '0',
  border_radius text DEFAULT '0.5rem',
  padding text DEFAULT '1rem',
  margin text DEFAULT '0',
  shadow text DEFAULT 'none',
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE container_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible container settings" ON container_settings;
CREATE POLICY "Public can read visible container settings"
  ON container_settings FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Authenticated users can manage container settings" ON container_settings;
CREATE POLICY "Authenticated users can manage container settings"
  ON container_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update trigger
DROP TRIGGER IF EXISTS update_container_settings_timestamp ON container_settings;
CREATE TRIGGER update_container_settings_timestamp BEFORE UPDATE ON container_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMPLETE!
-- Now you have 100% control via admin panel:
-- 
-- - Hero images: section_images table
-- - Frontend features: frontend_settings table  
-- - Homepage sections: homepage_sections table
-- - Containers/boxes: container_settings table
-- - Page sections: page_sections table (already exists)
-- - Site settings: site_settings table (already exists)
-- 
-- All admin tools save to these tables!
-- ============================================================




