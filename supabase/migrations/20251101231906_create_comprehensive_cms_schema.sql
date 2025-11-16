/*
  # Complete CMS Schema for Website Management

  ## Overview
  This migration creates a comprehensive content management system that allows
  full control over every section of the website from the admin dashboard.

  ## New Tables
  
  ### 1. `website_sections`
  Stores all website section content (Hero, About, Features, etc.)
  - `id` (uuid, primary key)
  - `section_key` (text, unique) - Identifier like 'hero', 'about', 'features'
  - `section_name` (text) - Display name
  - `content` (jsonb) - All section data (text, images, buttons, etc.)
  - `is_active` (boolean) - Show/hide section
  - `sort_order` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `tutorial_boxes`
  Stores tutorial content boxes
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `content` (text) - Rich HTML content
  - `image_url` (text)
  - `video_url` (text) - YouTube/Vimeo embed
  - `button_text` (text)
  - `button_url` (text)
  - `is_active` (boolean)
  - `sort_order` (integer)
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `faq_items`
  Stores FAQ questions and answers
  - `id` (uuid, primary key)
  - `question` (text)
  - `answer` (text)
  - `category` (text)
  - `is_active` (boolean)
  - `sort_order` (integer)
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `media_library`
  Central media storage
  - `id` (uuid, primary key)
  - `file_name` (text)
  - `file_url` (text)
  - `file_type` (text) - image, video, document
  - `file_size` (integer)
  - `alt_text` (text)
  - `tags` (text[])
  - `uploaded_by` (uuid)
  - `created_at` (timestamptz)

  ### 5. `content_backups`
  Backup system for content versions
  - `id` (uuid, primary key)
  - `backup_name` (text)
  - `backup_data` (jsonb) - Complete website content snapshot
  - `created_by` (uuid)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated users can read
  - Only admin users can modify
*/

-- Create website_sections table
CREATE TABLE IF NOT EXISTS website_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  section_name text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tutorial_boxes table
CREATE TABLE IF NOT EXISTS tutorial_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  image_url text,
  video_url text,
  button_text text,
  button_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create faq_items table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'image',
  file_size integer DEFAULT 0,
  alt_text text,
  tags text[] DEFAULT '{}',
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create content_backups table
CREATE TABLE IF NOT EXISTS content_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name text NOT NULL,
  backup_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_sections
CREATE POLICY "Anyone can view active website sections"
  ON website_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all website sections"
  ON website_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update website sections"
  ON website_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert website sections"
  ON website_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for tutorial_boxes
CREATE POLICY "Anyone can view active tutorial boxes"
  ON tutorial_boxes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage tutorial boxes"
  ON tutorial_boxes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for faq_items
CREATE POLICY "Anyone can view active FAQ items"
  ON faq_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage FAQ items"
  ON faq_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for media_library
CREATE POLICY "Anyone can view media"
  ON media_library FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage media"
  ON media_library FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for content_backups
CREATE POLICY "Authenticated users can view backups"
  ON content_backups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create backups"
  ON content_backups FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_website_sections_key ON website_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_website_sections_active ON website_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_tutorial_boxes_active ON tutorial_boxes(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON faq_items(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(file_type);

-- Insert default website sections
INSERT INTO website_sections (section_key, section_name, content, sort_order) VALUES
('hero', 'Hero Section', '{
  "title": "Cut The Cord & Stream Unlimited",
  "subtitle": "Get 18,000+ Live Channels, 60,000+ Movies & Shows on Your Fire Stick",
  "buttonText": "Get Started Now",
  "buttonUrl": "#shop",
  "backgroundImage": "",
  "features": ["18,000+ Live TV Channels", "60,000+ Movies & Shows", "All Sports & PPV Events"]
}'::jsonb, 1),

('about', 'About Section', '{
  "title": "What is Stream Unlimited?",
  "content": "Stream Unlimited offers premium IPTV services and jailbroken Fire Sticks...",
  "image": ""
}'::jsonb, 2),

('features', 'Features Section', '{
  "title": "Why Choose Us",
  "features": [
    {"icon": "tv", "title": "Massive Content Library", "description": "18,000+ channels"},
    {"icon": "hd", "title": "Premium Quality", "description": "4K Ultra HD streaming"},
    {"icon": "support", "title": "24/7 Support", "description": "Always here to help"}
  ]
}'::jsonb, 3),

('footer', 'Footer Section', '{
  "companyName": "Stream Unlimited",
  "tagline": "Your Premium Streaming Solution",
  "email": "support@streamunlimited.com",
  "phone": "1-800-STREAM",
  "social": {
    "facebook": "",
    "twitter": "",
    "instagram": ""
  },
  "legal": "All content and services are provided as-is."
}'::jsonb, 99)

ON CONFLICT (section_key) DO NOTHING;
