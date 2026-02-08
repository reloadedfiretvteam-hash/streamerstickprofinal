-- STREAMSTICKPRO SEO DOMINATION SCHEMA 2026
-- Run in Supabase SQL Editor. No specific prices or city names in defaults.

-- PHASE 2: SEO ARCHITECTURE (supports IPTV, jailbreak, Google TV location pages)
CREATE TABLE IF NOT EXISTS seo_architecture (
  id BIGSERIAL PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL,  -- 'iptv' | 'jailbreak' | 'google'
  country VARCHAR(10) NOT NULL,     -- 'USA' | 'CA' | 'UK'
  region VARCHAR(100),              -- state/province/country
  location VARCHAR(100),            -- city or area name
  slug VARCHAR(255) NOT NULL,      -- URL slug (e.g. houston, toronto)
  target_keyword VARCHAR(255),
  title VARCHAR(255),
  meta_description TEXT,
  h1 VARCHAR(255),
  p1_snippet TEXT,                  -- first 60-word paragraph for featured snippet
  pillar_url VARCHAR(500),
  internal_links JSONB DEFAULT '[]', -- [{ "url": "/shop", "anchor": "Shop" }]
  schema_type VARCHAR(50) DEFAULT 'FAQPage',
  faq_json JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_type, country, slug)
);

CREATE INDEX IF NOT EXISTS idx_seo_arch_page_type ON seo_architecture(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_arch_country ON seo_architecture(country);
CREATE INDEX IF NOT EXISTS idx_seo_arch_published ON seo_architecture(published) WHERE published = true;

COMMENT ON TABLE seo_architecture IS 'Location/topic pages for IPTV, jailbreak, Google TV. Scale to 25K+ rows.';

-- REDIRECT MAP (301 rules; worker can load from here)
CREATE TABLE IF NOT EXISTS redirect_map (
  id SERIAL PRIMARY KEY,
  old_path VARCHAR(500) NOT NULL UNIQUE,  -- e.g. /firestick, /iptv-free
  new_path VARCHAR(500) NOT NULL,          -- e.g. /jailbroken-fire-sticks, /
  status_code INTEGER DEFAULT 301,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redirect_old ON redirect_map(old_path);

-- Seed essential redirects (no specific cities/prices)
INSERT INTO redirect_map (old_path, new_path, status_code) VALUES
  ('/firestick', '/jailbroken-fire-sticks', 301),
  ('/iptv-free', '/', 301),
  ('/cheap-iptv', '/shop', 301),
  ('/pricing', '/shop', 301),
  ('/free-trial', '/', 301),
  ('/guides', '/iptv-services', 301),
  ('/guide', '/iptv-services', 301),
  ('/jailbreak', '/jailbroken-fire-sticks', 301),
  ('/devices', '/firestick-devices', 301),
  ('/media-players', '/iptv-media-players', 301),
  ('/iptv-apps', '/iptv-media-players', 301),
  ('/iptv-players', '/iptv-media-players', 301)
ON CONFLICT (old_path) DO NOTHING;

-- CONTENT CLUSTERS (pillar → cluster mapping for internal linking)
CREATE TABLE IF NOT EXISTS content_clusters (
  id SERIAL PRIMARY KEY,
  pillar_topic VARCHAR(200) NOT NULL,
  pillar_url VARCHAR(500) NOT NULL,
  cluster_keywords JSONB DEFAULT '[]',  -- ["keyword1", "keyword2"]
  cluster_page_slugs JSONB DEFAULT '[]',  -- ["slug1", "slug2"]
  topical_authority_target FLOAT DEFAULT 95.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (allow anon read for public pages; restrict write to service role)
ALTER TABLE seo_architecture ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seo_arch_public_read" ON seo_architecture;
CREATE POLICY "seo_arch_public_read" ON seo_architecture FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "redirect_map_public_read" ON redirect_map;
CREATE POLICY "redirect_map_public_read" ON redirect_map FOR SELECT USING (true);

DROP POLICY IF EXISTS "content_clusters_public_read" ON content_clusters;
CREATE POLICY "content_clusters_public_read" ON content_clusters FOR SELECT USING (true);

-- Optional: author/expert table for E-E-A-T (Phase 9)
CREATE TABLE IF NOT EXISTS seo_experts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  title VARCHAR(200),           -- e.g. "IPTV Specialist, StreamStickPro"
  bio TEXT,                    -- 1–2 sentences, no fake claims
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seo_experts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seo_experts_public_read" ON seo_experts;
CREATE POLICY "seo_experts_public_read" ON seo_experts FOR SELECT USING (true);
