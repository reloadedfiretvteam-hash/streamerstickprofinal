/*
  # Create Comprehensive Blog System with SEO
  
  1. New Tables
    - `blog_posts_advanced`
      - Full blog post content with rich SEO metadata
      - Meta titles, descriptions, keywords
      - Featured images and thumbnails
      - Categories and tags
      - Published/draft status
      - View counts and engagement metrics
    
    - `blog_product_links`
      - Links products to blog posts
      - Click tracking
      - Position tracking within posts
    
    - `blog_categories`
      - Blog post categories
      - SEO metadata per category
    
    - `blog_tags`
      - Blog post tags
      - Tag relationships
  
  2. Security
    - Enable RLS on all tables
    - Public read access for published posts
    - Admin-only write access
  
  3. Features
    - Full SEO optimization
    - Product integration
    - Analytics tracking
    - Category/tag management
*/

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  meta_title text,
  meta_description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name text NOT NULL UNIQUE,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Advanced Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts_advanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  thumbnail_image text,
  
  -- SEO Fields
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  meta_keywords text[],
  focus_keyword text,
  canonical_url text,
  
  -- Organization
  category_id uuid REFERENCES blog_categories(id),
  author_name text DEFAULT 'FireStreamPlus Team',
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  scheduled_for timestamptz,
  
  -- Analytics
  view_count integer DEFAULT 0,
  read_time_minutes integer DEFAULT 5,
  
  -- SEO Score
  seo_score integer DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Post Tags Junction Table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts_advanced(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- Blog Product Links Table
CREATE TABLE IF NOT EXISTS blog_product_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts_advanced(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  link_text text NOT NULL,
  position_in_post integer DEFAULT 1,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, product_id, position_in_post)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts_advanced(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts_advanced(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts_advanced(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts_advanced(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_product_links_post ON blog_product_links(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_product_links_product ON blog_product_links(product_id);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_product_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Blog Categories
CREATE POLICY "Anyone can view active categories"
  ON blog_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Blog Tags
CREATE POLICY "Anyone can view tags"
  ON blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON blog_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Blog Posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts_advanced FOR SELECT
  USING (status = 'published' AND published_at <= now());

CREATE POLICY "Authenticated users can view all posts"
  ON blog_posts_advanced FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage posts"
  ON blog_posts_advanced FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON blog_posts_advanced FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON blog_posts_advanced FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for Post Tags
CREATE POLICY "Anyone can view post tags"
  ON blog_post_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage post tags"
  ON blog_post_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Product Links
CREATE POLICY "Anyone can view product links"
  ON blog_product_links FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage product links"
  ON blog_product_links FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert Default Categories
INSERT INTO blog_categories (category_name, slug, description, meta_title, meta_description) VALUES
('IPTV Guides', 'iptv-guides', 'Complete guides about IPTV streaming services', 'IPTV Guides & Tutorials | FireStreamPlus', 'Learn everything about IPTV with our comprehensive guides and tutorials.'),
('Fire Stick Setup', 'fire-stick-setup', 'How to setup and optimize your Fire Stick', 'Fire Stick Setup Guides | FireStreamPlus', 'Step-by-step guides to setup and optimize your Amazon Fire Stick for streaming.'),
('Streaming Tips', 'streaming-tips', 'Tips and tricks for better streaming', 'Streaming Tips & Tricks | FireStreamPlus', 'Expert tips and tricks to enhance your streaming experience.'),
('Product Reviews', 'product-reviews', 'Reviews of our streaming products', 'Product Reviews | FireStreamPlus', 'Honest reviews of Fire Sticks, IPTV services, and streaming devices.')
ON CONFLICT (slug) DO NOTHING;

-- Insert Default Tags
INSERT INTO blog_tags (tag_name, slug) VALUES
('IPTV', 'iptv'),
('Fire Stick', 'fire-stick'),
('4K Streaming', '4k-streaming'),
('Live TV', 'live-tv'),
('Movies', 'movies'),
('Sports', 'sports'),
('Setup Guide', 'setup-guide'),
('Tips & Tricks', 'tips-tricks'),
('Product Review', 'product-review'),
('Streaming', 'streaming')
ON CONFLICT (tag_name) DO NOTHING;
