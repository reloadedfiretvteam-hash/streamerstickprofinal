/*
  # Visitor tracking: dedupe by IP hash, live stats by location

  - Add ip_hash (unique), pages_viewed, is_bot, last_visit, first_visit, state to visitors
  - Create get_live_visitors() RPC for admin dashboard (state/city aggregates)
  - Backward compatible: new columns nullable or have defaults
*/

-- Add columns to visitors (nullable/default for existing rows)
ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS pages_viewed jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_visit timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS first_visit timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS state text;

-- Unique constraint on ip_hash (allows multiple NULLs for legacy rows)
CREATE UNIQUE INDEX IF NOT EXISTS idx_visitors_ip_hash_unique ON visitors (ip_hash) WHERE ip_hash IS NOT NULL;

-- Index for live stats query (state, city, last_visit)
CREATE INDEX IF NOT EXISTS idx_visitors_state_city ON visitors (state, city) WHERE state IS NOT NULL AND city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitors_region_city ON visitors (region, city);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors (last_visit DESC);

-- RPC: live visitors grouped by state/city (uses region as state when state is null)
CREATE OR REPLACE FUNCTION get_live_visitors()
RETURNS TABLE (
  state text,
  city text,
  daily_visits bigint,
  yesterday_visits bigint,
  weekly_visits bigint,
  monthly_visits bigint,
  unique_ips bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(v.state, v.region, '')::text AS state,
    COALESCE(v.city, '')::text AS city,
    COUNT(DISTINCT COALESCE(v.ip_hash, v.id::text)) FILTER (WHERE (v.last_visit IS NOT NULL AND v.last_visit >= date_trunc('day', now())) OR (v.last_visit IS NULL AND v.created_at >= date_trunc('day', now()))) AS daily_visits,
    COUNT(DISTINCT COALESCE(v.ip_hash, v.id::text)) FILTER (WHERE (COALESCE(v.last_visit, v.created_at) >= date_trunc('day', now()) - INTERVAL '1 day' AND COALESCE(v.last_visit, v.created_at) < date_trunc('day', now()))) AS yesterday_visits,
    COUNT(DISTINCT COALESCE(v.ip_hash, v.id::text)) FILTER (WHERE COALESCE(v.last_visit, v.created_at) > now() - INTERVAL '7 days') AS weekly_visits,
    COUNT(DISTINCT COALESCE(v.ip_hash, v.id::text)) FILTER (WHERE COALESCE(v.last_visit, v.created_at) > now() - INTERVAL '30 days') AS monthly_visits,
    COUNT(DISTINCT COALESCE(v.ip_hash, v.id::text)) AS unique_ips
  FROM visitors v
  WHERE (COALESCE(v.last_visit, v.created_at) > now() - INTERVAL '1 day')
    AND (v.is_bot IS NOT TRUE)
  GROUP BY COALESCE(v.state, v.region), COALESCE(v.city, '')
  ORDER BY daily_visits DESC NULLS LAST, monthly_visits DESC NULLS LAST;
END;
$$;

-- Grant execute to authenticated and service_role (admin dashboard)
GRANT EXECUTE ON FUNCTION get_live_visitors() TO authenticated;
GRANT EXECUTE ON FUNCTION get_live_visitors() TO service_role;

COMMENT ON FUNCTION get_live_visitors() IS 'Returns aggregated visitor counts by state/city for last 24h; used by admin Live Visitors panel.';

-- Preserve first_visit on upsert (do not overwrite with new value when updating by ip_hash)
CREATE OR REPLACE FUNCTION visitors_preserve_first_visit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.ip_hash IS NOT NULL AND NEW.ip_hash IS NOT NULL AND OLD.first_visit IS NOT NULL THEN
    NEW.first_visit := OLD.first_visit;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS visitors_preserve_first_visit_trigger ON visitors;
CREATE TRIGGER visitors_preserve_first_visit_trigger
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION visitors_preserve_first_visit();

-- RPC: upsert visitor by ip_hash (dedupe by IP), append page to pages_viewed
CREATE OR REPLACE FUNCTION upsert_visitor_visit(
  p_ip_hash text,
  p_state text,
  p_city text,
  p_country text,
  p_user_agent text,
  p_session_id text,
  p_page text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO visitors (ip_hash, state, region, city, country, user_agent, session_id, last_visit, first_visit, pages_viewed)
  VALUES (p_ip_hash, p_state, p_state, p_city, p_country, p_user_agent, p_session_id, now(), now(), to_jsonb(ARRAY[p_page]))
  ON CONFLICT (ip_hash) WHERE (ip_hash IS NOT NULL)
  DO UPDATE SET
    last_visit = now(),
    user_agent = COALESCE(EXCLUDED.user_agent, visitors.user_agent),
    state = COALESCE(EXCLUDED.state, visitors.state),
    region = COALESCE(EXCLUDED.region, visitors.region),
    city = COALESCE(EXCLUDED.city, visitors.city),
    country = COALESCE(EXCLUDED.country, visitors.country),
    session_id = COALESCE(EXCLUDED.session_id, visitors.session_id),
    pages_viewed = COALESCE(visitors.pages_viewed, '[]'::jsonb) || to_jsonb(ARRAY[p_page]);
END;
$$;
GRANT EXECUTE ON FUNCTION upsert_visitor_visit(text, text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION upsert_visitor_visit(text, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_visitor_visit(text, text, text, text, text, text, text) TO service_role;
COMMENT ON FUNCTION upsert_visitor_visit IS 'Deduplicated visit tracking by ip_hash; appends page to pages_viewed on repeat visits.';
