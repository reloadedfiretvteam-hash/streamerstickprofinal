-- SEO Domination: seed content_clusters (pillar → cluster mapping) for internal linking and topical authority.
-- Run after seo_architecture and location pages exist.

-- Allow upsert by pillar_url
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_clusters_pillar_url ON content_clusters(pillar_url);

INSERT INTO content_clusters (pillar_topic, pillar_url, cluster_keywords, cluster_page_slugs, topical_authority_target)
VALUES
  ('IPTV Services', '/iptv-services', '["IPTV", "live TV", "streaming", "channels", "Fire Stick IPTV", "Google TV IPTV"]'::jsonb, '["houston", "los-angeles", "new-york-city", "chicago", "phoenix", "miami", "seattle", "denver", "atlanta", "boston", "toronto", "montreal", "vancouver", "london", "manchester", "glasgow"]'::jsonb, 95.0),
  ('Jailbroken Fire Sticks', '/jailbroken-fire-sticks', '["jailbroken Fire Stick", "pre-loaded Fire Stick", "Kodi", "Stremio", "streaming device"]'::jsonb, '["houston", "los-angeles", "new-york-city", "chicago", "miami", "phoenix", "seattle", "denver", "atlanta", "boston", "toronto", "montreal", "vancouver", "london", "manchester"]'::jsonb, 95.0),
  ('IPTV Media Players / Google TV', '/iptv-media-players', '["Google TV", "Chromecast", "TiviMate", "IPTV app", "media player"]'::jsonb, '["houston", "los-angeles", "new-york-city", "toronto", "london", "montreal", "vancouver", "chicago", "miami", "manchester"]'::jsonb, 95.0),
  ('IPTV for Fire Stick', '/iptv-firestick', '["IPTV Fire Stick", "Fire Stick IPTV", "best IPTV Firestick"]'::jsonb, '["houston", "los-angeles", "chicago", "miami", "seattle", "boston", "toronto", "london"]'::jsonb, 95.0),
  ('Fire Stick Devices', '/firestick-devices', '["Fire Stick", "Fire TV", "streaming device"]'::jsonb, '["houston", "los-angeles", "new-york-city", "chicago", "toronto", "london"]'::jsonb, 95.0),
  ('Best IPTV Firestick', '/best-iptv-firestick', '["best IPTV", "IPTV comparison", "Firestick IPTV"]'::jsonb, '["houston", "los-angeles", "chicago", "miami", "toronto", "london", "vancouver"]'::jsonb, 95.0)
ON CONFLICT (pillar_url) DO UPDATE SET
  pillar_topic = EXCLUDED.pillar_topic,
  cluster_keywords = EXCLUDED.cluster_keywords,
  cluster_page_slugs = EXCLUDED.cluster_page_slugs,
  topical_authority_target = EXCLUDED.topical_authority_target;

-- Ensure content_blocks column exists on seo_architecture (idempotent)
ALTER TABLE seo_architecture ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT NULL;

-- Index for sitemap and API lookups
CREATE INDEX IF NOT EXISTS idx_seo_arch_country_type_slug ON seo_architecture(country, page_type, slug);
CREATE INDEX IF NOT EXISTS idx_seo_arch_updated ON seo_architecture(updated_at) WHERE published = true;

COMMENT ON TABLE content_clusters IS 'Pillar → cluster mapping for SEO internal linking; used by worker and admin.';
