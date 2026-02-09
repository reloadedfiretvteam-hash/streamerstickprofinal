-- Ultimate 93K content catalog (Nuclear SEO/AEO prompt)
-- Tables: iptv_channels, movies, series, seo_impressions. RLS + indexes for ~50ms queries.

-- 18K live TV channels (country, language, genre, device scores)
CREATE TABLE IF NOT EXISTS iptv_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country VARCHAR(3) NOT NULL,
  language VARCHAR(10),
  genre VARCHAR(50),
  channel_name VARCHAR(255) NOT NULL,
  stream_url TEXT,
  device_score_onn DECIMAL(3,2),
  device_score_firestick DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iptv_channels_country ON iptv_channels(country);
CREATE INDEX IF NOT EXISTS idx_iptv_channels_language ON iptv_channels(language);
CREATE INDEX IF NOT EXISTS idx_iptv_channels_genre ON iptv_channels(genre);
CREATE INDEX IF NOT EXISTS idx_iptv_channels_device_onn ON iptv_channels(device_score_onn) WHERE device_score_onn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iptv_channels_device_firestick ON iptv_channels(device_score_firestick) WHERE device_score_firestick IS NOT NULL;

ALTER TABLE iptv_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read iptv_channels" ON iptv_channels;
CREATE POLICY "Allow read iptv_channels" ON iptv_channels FOR SELECT USING (true);

-- 60K movies (prompt: 60K movies, no sports)
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  year INT,
  country VARCHAR(3),
  available_onn BOOLEAN DEFAULT true,
  available_firestick BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movies_country ON movies(country);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_available_onn ON movies(available_onn);
CREATE INDEX IF NOT EXISTS idx_movies_available_firestick ON movies(available_firestick);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read movies" ON movies;
CREATE POLICY "Allow read movies" ON movies FOR SELECT USING (true);

-- 15K series
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  seasons INT,
  episodes INT,
  country VARCHAR(3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_series_country ON series(country);
CREATE INDEX IF NOT EXISTS idx_series_seasons ON series(seasons);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read series" ON series;
CREATE POLICY "Allow read series" ON series FOR SELECT USING (true);

-- SEO/AEO analytics (impressions by keyword, country, position, device)
CREATE TABLE IF NOT EXISTS seo_impressions (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  country VARCHAR(3),
  position INT,
  device_type VARCHAR(50),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_impressions_keyword ON seo_impressions(keyword);
CREATE INDEX IF NOT EXISTS idx_seo_impressions_country ON seo_impressions(country);
CREATE INDEX IF NOT EXISTS idx_seo_impressions_recorded ON seo_impressions(recorded_at);

ALTER TABLE seo_impressions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all seo_impressions" ON seo_impressions;
CREATE POLICY "Allow all seo_impressions" ON seo_impressions FOR ALL USING (true);

-- RPC for Worker/catalog API: get channel count by country (fast)
CREATE OR REPLACE FUNCTION get_channels_by_country(p_country VARCHAR(3))
RETURNS TABLE(channel_name VARCHAR(255), genre VARCHAR(50), device_score_onn DECIMAL(3,2), device_score_firestick DECIMAL(3,2))
LANGUAGE sql
STABLE
AS $$
  SELECT ic.channel_name, ic.genre, ic.device_score_onn, ic.device_score_firestick
  FROM iptv_channels ic
  WHERE ic.country = upper(p_country)
  LIMIT 500;
$$;
