-- ============================================================
-- COMPLETE ADMIN PANEL SETUP SQL
-- Run this in Supabase SQL Editor to ensure all tables exist
-- ============================================================

-- 1. ADMIN CREDENTIALS (Required for login)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read admin credentials for login" ON admin_credentials;
CREATE POLICY "Anyone can read admin credentials for login"
  ON admin_credentials FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can modify credentials" ON admin_credentials;
CREATE POLICY "Only authenticated admins can modify credentials"
  ON admin_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO admin_credentials (username, password_hash, email, role)
VALUES ('admin', 'admin', 'reloadedfirestvteam@gmail.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 2. CAROUSEL SLIDES (Required for homepage carousel)
CREATE TABLE IF NOT EXISTS carousel_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  button_text text DEFAULT 'Learn More',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active carousel slides" ON carousel_slides;
CREATE POLICY "Anyone can view active carousel slides"
  ON carousel_slides FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage carousel slides" ON carousel_slides;
CREATE POLICY "Authenticated users can manage carousel slides"
  ON carousel_slides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_carousel_sort ON carousel_slides(sort_order, is_active);

-- 3. SITE SETTINGS (Required for SEO and general settings)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  category text DEFAULT 'general',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. FAQ ITEMS (Required for FAQ Manager)
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active FAQs" ON faq_items;
CREATE POLICY "Public can read active FAQs"
  ON faq_items FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage FAQs" ON faq_items;
CREATE POLICY "Authenticated users can manage FAQs"
  ON faq_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. PROMOTIONS (Required for Promotions Manager)
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL,
  minimum_amount numeric(10,2) DEFAULT 0,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active promotions" ON promotions;
CREATE POLICY "Public can read active promotions"
  ON promotions FOR SELECT
  USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

DROP POLICY IF EXISTS "Authenticated users can manage promotions" ON promotions;
CREATE POLICY "Authenticated users can manage promotions"
  ON promotions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. MEDIA LIBRARY (Required for Media Library Manager)
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  alt_text text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read media library" ON media_library;
CREATE POLICY "Public can read media library"
  ON media_library FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage media" ON media_library;
CREATE POLICY "Authenticated users can manage media"
  ON media_library FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. SEO CONFIGURATION (Required for SEO Managers)
CREATE TABLE IF NOT EXISTS seo_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL,
  page_id text,
  focus_keyword text,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  schema_markup jsonb,
  robots_meta text DEFAULT 'index, follow',
  breadcrumbs jsonb,
  readability_score integer DEFAULT 0,
  keyword_density numeric(5,2) DEFAULT 0,
  internal_links integer DEFAULT 0,
  external_links integer DEFAULT 0,
  seo_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_configuration ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read SEO config" ON seo_configuration;
CREATE POLICY "Public can read SEO config"
  ON seo_configuration FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage SEO" ON seo_configuration;
CREATE POLICY "Authenticated users can manage SEO"
  ON seo_configuration FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. SEO SETTINGS (Alternative SEO settings table)
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_analytics_id text,
  google_search_console_verification text,
  google_tag_manager_id text,
  site_name text,
  site_description text,
  site_keywords text,
  business_name text,
  business_email text,
  business_phone text,
  business_address text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  youtube_url text,
  linkedin_url text,
  og_image_url text,
  og_image_width integer,
  og_image_height integer,
  twitter_card_type text,
  twitter_image_url text,
  aggregate_rating numeric(3,2),
  review_count integer,
  price_range_low numeric(10,2),
  price_range_high numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read SEO settings" ON seo_settings;
CREATE POLICY "Public can read SEO settings"
  ON seo_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage SEO settings" ON seo_settings;
CREATE POLICY "Authenticated users can manage SEO settings"
  ON seo_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default SEO settings if not exists
INSERT INTO seo_settings (id, site_name, site_description)
VALUES ('00000000-0000-0000-0000-000000000001', 'Inferno TV', 'Premium IPTV subscriptions with 18,000+ live channels')
ON CONFLICT (id) DO NOTHING;

-- 9. PAGE ELEMENTS (For Visual Page Builder)
CREATE TABLE IF NOT EXISTS page_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_type text NOT NULL,
  element_id text NOT NULL,
  element_class text,
  content text,
  page_section text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_elements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read page elements" ON page_elements;
CREATE POLICY "Public can read page elements"
  ON page_elements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage page elements" ON page_elements;
CREATE POLICY "Authenticated users can manage page elements"
  ON page_elements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 10. PAGE SECTIONS (For Enhanced Visual Page Builder)
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  section_type text,
  content jsonb,
  styles jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active page sections" ON page_sections;
CREATE POLICY "Public can read active page sections"
  ON page_sections FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage page sections" ON page_sections;
CREATE POLICY "Authenticated users can manage page sections"
  ON page_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 11. TUTORIAL BOXES (For Tutorial Box Editor)
CREATE TABLE IF NOT EXISTS tutorial_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  image_url text,
  video_url text,
  link_url text,
  button_text text,
  color text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tutorial_boxes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active tutorials" ON tutorial_boxes;
CREATE POLICY "Public can read active tutorials"
  ON tutorial_boxes FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage tutorials" ON tutorial_boxes;
CREATE POLICY "Authenticated users can manage tutorials"
  ON tutorial_boxes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 12. REDIRECTS (For Redirects Manager)
CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_url text NOT NULL UNIQUE,
  to_url text NOT NULL,
  redirect_type integer DEFAULT 301,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active redirects" ON redirects;
CREATE POLICY "Public can read active redirects"
  ON redirects FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage redirects" ON redirects;
CREATE POLICY "Authenticated users can manage redirects"
  ON redirects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 13. AI COPILOT CONVERSATIONS (For AI Copilot)
CREATE TABLE IF NOT EXISTS ai_copilot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_title text,
  messages jsonb,
  ai_provider text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_copilot_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage AI conversations" ON ai_copilot_conversations;
CREATE POLICY "Authenticated users can manage AI conversations"
  ON ai_copilot_conversations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 14. SCHEDULED VIDEO POSTS (For AI Video Generator)
CREATE TABLE IF NOT EXISTS scheduled_video_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text,
  platform text,
  scheduled_time timestamptz,
  status text DEFAULT 'pending',
  post_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_video_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage scheduled posts" ON scheduled_video_posts;
CREATE POLICY "Authenticated users can manage scheduled posts"
  ON scheduled_video_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 15. AI GENERATED VIDEOS (For AI Video Generator)
CREATE TABLE IF NOT EXISTS ai_generated_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text,
  script text,
  video_url text,
  thumbnail_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_generated_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage AI videos" ON ai_generated_videos;
CREATE POLICY "Authenticated users can manage AI videos"
  ON ai_generated_videos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 16. EMAIL TEMPLATES (For Email Template Manager)
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text,
  body_text text,
  template_type text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage email templates" ON email_templates;
CREATE POLICY "Authenticated users can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 17. EMAIL LOGS (For Bulk Email Manager)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text,
  status text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read email logs" ON email_logs;
CREATE POLICY "Authenticated users can read email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

-- 18. FORMS (For Advanced Form Builder)
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  fields jsonb,
  settings jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active forms" ON forms;
CREATE POLICY "Public can read active forms"
  ON forms FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage forms" ON forms;
CREATE POLICY "Authenticated users can manage forms"
  ON forms FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 19. FORM SUBMISSIONS (For Form Builder)
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id),
  data jsonb,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert form submissions" ON form_submissions;
CREATE POLICY "Public can insert form submissions"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read submissions" ON form_submissions;
CREATE POLICY "Authenticated users can read submissions"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (true);

-- 20. POPUPS (For Popup Builder)
CREATE TABLE IF NOT EXISTS popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text,
  settings jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active popups" ON popups;
CREATE POLICY "Public can read active popups"
  ON popups FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage popups" ON popups;
CREATE POLICY "Authenticated users can manage popups"
  ON popups FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 21. CATEGORIES (For Category Manager)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active categories" ON categories;
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: The following tables should already exist from previous migrations:
-- - real_products
-- - product_images
-- - blog_posts
-- - orders
-- - bitcoin_orders
-- - stripe_products
-- - reviews
-- - email_captures
-- - website_visitors

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_admin_credentials_timestamp BEFORE UPDATE ON admin_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carousel_slides_timestamp BEFORE UPDATE ON carousel_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_timestamp BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_items_timestamp BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_timestamp BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_library_timestamp BEFORE UPDATE ON media_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_configuration_timestamp BEFORE UPDATE ON seo_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_settings_timestamp BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_elements_timestamp BEFORE UPDATE ON page_elements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_sections_timestamp BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutorial_boxes_timestamp BEFORE UPDATE ON tutorial_boxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_redirects_timestamp BEFORE UPDATE ON redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMPLETE! All required tables for admin panel are created.
-- ============================================================




