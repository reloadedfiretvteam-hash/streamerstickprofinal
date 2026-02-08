-- Competitor crush tracker for 100 crush pages (nuclear domination)
CREATE TABLE IF NOT EXISTS competitor_crush (
  id SERIAL PRIMARY KEY,
  competitor_name VARCHAR(100) NOT NULL,
  crush_url VARCHAR(500) NOT NULL UNIQUE,
  target_keywords JSONB DEFAULT '[]',
  traffic_stolen INT DEFAULT 0,
  live_status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_crush_url ON competitor_crush(crush_url);
CREATE INDEX IF NOT EXISTS idx_competitor_crush_live ON competitor_crush(live_status);

-- Tier 1 seed
INSERT INTO competitor_crush (competitor_name, crush_url, target_keywords, live_status) VALUES
  ('IPTVStronger', '/vs-iptvstronger', '["iptvstronger alternative"]', true),
  ('TroyPoint', '/vs-troypoint', '["troypoint alternative"]', true),
  ('IPTV Providers', '/vs-iptvproviders', '["iptv providers alternative"]', true),
  ('HypoTV', '/vs-hypotv', '["hypotv alternative"]', true),
  ('TV Worldwide', '/vs-tvworldwide', '["tv worldwide alternative"]', true),
  ('XtremeHD', '/vs-xtremehd', '["xtremehd alternative"]', true),
  ('IPTVGreat', '/vs-iptvgreat', '["iptvgreat alternative"]', true),
  ('Shoroc', '/vs-shoroc', '["shoroc alternative"]', true),
  ('IPTV Encoder', '/vs-iptvencoder', '["iptv encoder alternative"]', true)
ON CONFLICT (crush_url) DO NOTHING;
