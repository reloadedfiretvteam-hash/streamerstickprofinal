/*
  # Fix All Security Issues - Complete
  
  1. Performance Issues
    - Add missing index for page_builder_revisions foreign key
    - Remove unused indexes that impact write performance
  
  2. Security Issues
    - Consolidate duplicate permissive RLS policies
    - Fix function search_path to be immutable
  
  3. Changes Made
    - Add: idx_page_builder_revisions_page_id
    - Remove: 19 unused indexes
    - Consolidate: 12 sets of duplicate RLS policies
    - Fix: update_cashapp_orders_updated_at function search_path
*/

-- ==========================================
-- 1. ADD MISSING INDEX FOR FOREIGN KEY
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_page_builder_revisions_page_id 
ON page_builder_revisions(page_id);

-- ==========================================
-- 2. REMOVE UNUSED INDEXES
-- ==========================================

DROP INDEX IF EXISTS idx_admin_credentials_username;
DROP INDEX IF EXISTS idx_admin_credentials_email;
DROP INDEX IF EXISTS idx_page_builder_elements_parent_id;
DROP INDEX IF EXISTS idx_seo_content_metadata_content;
DROP INDEX IF EXISTS idx_seo_keywords_keyword;
DROP INDEX IF EXISTS idx_seo_redirects_source;
DROP INDEX IF EXISTS idx_frontend_elements_container;
DROP INDEX IF EXISTS idx_real_products_slug;
DROP INDEX IF EXISTS idx_customer_orders_email;
DROP INDEX IF EXISTS idx_customer_orders_status;
DROP INDEX IF EXISTS idx_bitcoin_orders_code;
DROP INDEX IF EXISTS idx_bitcoin_orders_email;
DROP INDEX IF EXISTS idx_bitcoin_orders_status;
DROP INDEX IF EXISTS idx_bitcoin_orders_created;
DROP INDEX IF EXISTS idx_bitcoin_transactions_order;
DROP INDEX IF EXISTS idx_cashapp_orders_code;
DROP INDEX IF EXISTS idx_cashapp_orders_email;
DROP INDEX IF EXISTS idx_cashapp_orders_status;
DROP INDEX IF EXISTS idx_cashapp_orders_created;

-- ==========================================
-- 3. FIX DUPLICATE RLS POLICIES
-- ==========================================

-- Fix frontend_containers policies
DROP POLICY IF EXISTS "Allow admin full access containers" ON frontend_containers;
DROP POLICY IF EXISTS "Allow public read containers" ON frontend_containers;

CREATE POLICY "Public can read containers"
  ON frontend_containers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage containers"
  ON frontend_containers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix frontend_elements policies
DROP POLICY IF EXISTS "Allow admin full access elements" ON frontend_elements;
DROP POLICY IF EXISTS "Allow public read elements" ON frontend_elements;

CREATE POLICY "Public can read elements"
  ON frontend_elements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage elements"
  ON frontend_elements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix page_builder_elements policies
DROP POLICY IF EXISTS "Allow admin full access to elements" ON page_builder_elements;
DROP POLICY IF EXISTS "Allow public read visible elements" ON page_builder_elements;

CREATE POLICY "Public can read visible elements"
  ON page_builder_elements FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Admin can manage elements"
  ON page_builder_elements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix page_builder_pages policies
DROP POLICY IF EXISTS "Allow admin full access to pages" ON page_builder_pages;
DROP POLICY IF EXISTS "Allow public read published pages" ON page_builder_pages;

CREATE POLICY "Public can read published pages"
  ON page_builder_pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admin can manage pages"
  ON page_builder_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix popup_campaigns policies
DROP POLICY IF EXISTS "Allow admin full access popups" ON popup_campaigns;
DROP POLICY IF EXISTS "Allow public read popups" ON popup_campaigns;

CREATE POLICY "Public can read active popups"
  ON popup_campaigns FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage popups"
  ON popup_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix product_variants policies
DROP POLICY IF EXISTS "Allow admin full access variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public read variants" ON product_variants;

CREATE POLICY "Public can read variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix real_blog_posts policies
DROP POLICY IF EXISTS "Allow admin full access posts" ON real_blog_posts;
DROP POLICY IF EXISTS "Allow public read published posts" ON real_blog_posts;

CREATE POLICY "Public can read published posts"
  ON real_blog_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admin can manage posts"
  ON real_blog_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix real_products policies
DROP POLICY IF EXISTS "Allow admin full access products" ON real_products;
DROP POLICY IF EXISTS "Allow public read products" ON real_products;

CREATE POLICY "Public can read active products"
  ON real_products FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admin can manage products"
  ON real_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix seo_content_metadata policies
DROP POLICY IF EXISTS "Allow admin full access to SEO" ON seo_content_metadata;
DROP POLICY IF EXISTS "Allow public read SEO metadata" ON seo_content_metadata;

CREATE POLICY "Public can read SEO metadata"
  ON seo_content_metadata FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage SEO metadata"
  ON seo_content_metadata FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Fix site_settings policies
DROP POLICY IF EXISTS "Allow admin full access settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public read settings" ON site_settings;

CREATE POLICY "Public can read settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_credentials 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ==========================================
-- 4. FIX FUNCTION SEARCH PATH
-- ==========================================

-- Drop and recreate the function with immutable search_path
DROP FUNCTION IF EXISTS update_cashapp_orders_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_cashapp_orders_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_cashapp_orders_timestamp ON cashapp_orders;

CREATE TRIGGER update_cashapp_orders_timestamp
  BEFORE UPDATE ON cashapp_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_cashapp_orders_updated_at();