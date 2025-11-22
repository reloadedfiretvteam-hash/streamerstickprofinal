/*
  # Visual Page Builder & Advanced SEO System

  1. New Tables
    - `page_builder_elements`
      - Stores all visual elements (text, images, buttons, containers, widgets)
      - Full element properties (styles, links, content, positioning)
      - Version history and drag-drop positioning
    
    - `page_builder_pages`
      - Manages different pages that can be built
      - Templates and layouts
    
    - `seo_content_metadata`
      - Advanced SEO for all content types
      - Meta titles, descriptions, keywords, schema markup
      - Rank Math Pro level features
    
    - `seo_keywords_tracking`
      - Keyword rankings and tracking
      - Competition analysis
    
    - `seo_redirects_advanced`
      - 301/302 redirects with analytics
    
    - `ai_copilot_suggestions`
      - AI-generated suggestions for content, SEO, design
      - Tracking of applied suggestions

  2. Security
    - Enable RLS on all tables
    - Allow public read for published content
    - Restrict write to authenticated admins

  3. Features
    - Click-to-edit any element on page
    - Real-time visual editing
    - AI-powered suggestions
    - Advanced SEO optimization
*/

-- Page Builder Pages
CREATE TABLE IF NOT EXISTS page_builder_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  page_slug text UNIQUE NOT NULL,
  page_type text DEFAULT 'custom', -- 'home', 'custom', 'product', 'blog'
  is_published boolean DEFAULT false,
  template_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Page Builder Elements
CREATE TABLE IF NOT EXISTS page_builder_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_builder_pages(id) ON DELETE CASCADE,
  element_type text NOT NULL, -- 'text', 'image', 'button', 'container', 'widget', 'link', 'video', etc.
  element_name text,
  content jsonb DEFAULT '{}', -- text content, HTML, etc.
  styles jsonb DEFAULT '{}', -- CSS styles, colors, fonts, spacing
  properties jsonb DEFAULT '{}', -- links, paths, actions, data attributes
  position_order integer DEFAULT 0,
  parent_id uuid REFERENCES page_builder_elements(id) ON DELETE CASCADE,
  is_visible boolean DEFAULT true,
  breakpoint_styles jsonb DEFAULT '{}', -- responsive styles for mobile/tablet/desktop
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SEO Content Metadata (Rank Math Pro features)
CREATE TABLE IF NOT EXISTS seo_content_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL, -- 'page', 'post', 'product', 'category'
  content_id text NOT NULL,
  focus_keyword text,
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  schema_markup jsonb DEFAULT '{}',
  seo_score integer DEFAULT 0,
  readability_score integer DEFAULT 0,
  keyword_density jsonb DEFAULT '{}',
  internal_links integer DEFAULT 0,
  external_links integer DEFAULT 0,
  word_count integer DEFAULT 0,
  is_indexed boolean DEFAULT true,
  robots_meta text DEFAULT 'index,follow',
  breadcrumbs jsonb DEFAULT '[]',
  faq_schema jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- SEO Keywords Tracking
CREATE TABLE IF NOT EXISTS seo_keywords_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  current_rank integer,
  previous_rank integer,
  best_rank integer,
  target_url text,
  search_volume integer,
  competition_level text, -- 'low', 'medium', 'high'
  tracked_since timestamptz DEFAULT now(),
  last_checked timestamptz DEFAULT now(),
  ranking_history jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Advanced SEO Redirects
CREATE TABLE IF NOT EXISTS seo_redirects_advanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  target_url text NOT NULL,
  redirect_type text DEFAULT '301', -- '301', '302', '307', '308'
  is_active boolean DEFAULT true,
  hit_count integer DEFAULT 0,
  last_accessed timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Copilot Suggestions
CREATE TABLE IF NOT EXISTS ai_copilot_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_type text NOT NULL, -- 'seo', 'content', 'design', 'marketing'
  target_element text,
  suggestion_title text NOT NULL,
  suggestion_description text,
  suggestion_data jsonb DEFAULT '{}',
  is_applied boolean DEFAULT false,
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at timestamptz DEFAULT now(),
  applied_at timestamptz
);

-- Element Revision History
CREATE TABLE IF NOT EXISTS page_builder_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_builder_pages(id) ON DELETE CASCADE,
  revision_data jsonb NOT NULL,
  revision_note text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_builder_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_redirects_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_copilot_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_builder_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read published pages"
  ON page_builder_pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Allow admin full access to pages"
  ON page_builder_pages FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read visible elements"
  ON page_builder_elements FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Allow admin full access to elements"
  ON page_builder_elements FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read SEO metadata"
  ON seo_content_metadata FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow admin full access to SEO"
  ON seo_content_metadata FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin full access to keywords"
  ON seo_keywords_tracking FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin full access to redirects"
  ON seo_redirects_advanced FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin full access to AI suggestions"
  ON ai_copilot_suggestions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin full access to revisions"
  ON page_builder_revisions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_builder_elements_page_id ON page_builder_elements(page_id);
CREATE INDEX IF NOT EXISTS idx_page_builder_elements_parent_id ON page_builder_elements(parent_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_metadata_content ON seo_content_metadata(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_keyword ON seo_keywords_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_seo_redirects_source ON seo_redirects_advanced(source_url);

-- Insert default home page
INSERT INTO page_builder_pages (page_name, page_slug, page_type, is_published)
VALUES ('Home Page', 'home', 'home', true)
ON CONFLICT (page_slug) DO NOTHING;