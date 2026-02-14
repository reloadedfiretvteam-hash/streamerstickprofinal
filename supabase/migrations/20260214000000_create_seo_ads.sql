-- seo_ads: used by Worker /api/seo-ads and Admin SEO Ads. No migration created this table before.
CREATE TABLE IF NOT EXISTS seo_ads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'device-comparison',
  content TEXT,
  excerpt TEXT,
  primary_keyword TEXT,
  secondary_keywords JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  featured_image TEXT,
  gallery_images JSONB DEFAULT '[]',
  comparison_data JSONB,
  product_links JSONB DEFAULT '[]',
  cta_text TEXT,
  cta_link TEXT,
  badge_labels JSONB DEFAULT '[]',
  social_proof JSONB,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_ads_slug ON seo_ads(slug);
CREATE INDEX IF NOT EXISTS idx_seo_ads_published ON seo_ads(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_seo_ads_category ON seo_ads(category);

ALTER TABLE seo_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seo_ads_public_read" ON seo_ads;
CREATE POLICY "seo_ads_public_read" ON seo_ads FOR SELECT USING (published = true);

COMMENT ON TABLE seo_ads IS 'SEO landing pages (comparisons, guides). Public API /api/seo-ads; Admin CRUD in Admin Panel.';
