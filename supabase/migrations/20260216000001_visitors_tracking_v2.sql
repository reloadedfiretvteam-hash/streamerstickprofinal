/*
  # Visitor tracking v2: stable dedupe + better stats fields

  Goals:
  - Keep using visitors.ip_hash as the unique visitor key (cookie-hash preferred, IP/UA fallback)
  - Store the latest page_url + referrer for admin dashboards
  - Mark bots so live stats can exclude them
  - Keep backward compatibility (nullable columns + default values)
*/

ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS last_page_url text,
  ADD COLUMN IF NOT EXISTS last_referrer text;

-- Upgrade RPC: include page_url/referrer + bot flag
CREATE OR REPLACE FUNCTION upsert_visitor_visit(
  p_ip_hash text,
  p_state text,
  p_city text,
  p_country text,
  p_user_agent text,
  p_session_id text,
  p_page text,
  p_page_url text,
  p_referrer text,
  p_is_bot boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO visitors (
    ip_hash,
    state,
    region,
    city,
    country,
    user_agent,
    session_id,
    last_visit,
    first_visit,
    pages_viewed,
    page_url,
    referrer,
    last_page_url,
    last_referrer,
    is_bot
  )
  VALUES (
    p_ip_hash,
    p_state,
    p_state,
    p_city,
    p_country,
    p_user_agent,
    p_session_id,
    now(),
    now(),
    to_jsonb(ARRAY[p_page]),
    p_page_url,
    p_referrer,
    p_page_url,
    p_referrer,
    COALESCE(p_is_bot, false)
  )
  ON CONFLICT (ip_hash) WHERE (ip_hash IS NOT NULL)
  DO UPDATE SET
    last_visit = now(),
    user_agent = COALESCE(EXCLUDED.user_agent, visitors.user_agent),
    state = COALESCE(EXCLUDED.state, visitors.state),
    region = COALESCE(EXCLUDED.region, visitors.region),
    city = COALESCE(EXCLUDED.city, visitors.city),
    country = COALESCE(EXCLUDED.country, visitors.country),
    session_id = COALESCE(EXCLUDED.session_id, visitors.session_id),
    page_url = COALESCE(EXCLUDED.page_url, visitors.page_url),
    referrer = COALESCE(EXCLUDED.referrer, visitors.referrer),
    last_page_url = COALESCE(EXCLUDED.last_page_url, visitors.last_page_url),
    last_referrer = COALESCE(EXCLUDED.last_referrer, visitors.last_referrer),
    is_bot = COALESCE(visitors.is_bot, false) OR COALESCE(EXCLUDED.is_bot, false),
    pages_viewed = COALESCE(visitors.pages_viewed, '[]'::jsonb) || to_jsonb(ARRAY[p_page]);
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_visitor_visit(text, text, text, text, text, text, text, text, text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION upsert_visitor_visit(text, text, text, text, text, text, text, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_visitor_visit(text, text, text, text, text, text, text, text, text, boolean) TO service_role;

COMMENT ON FUNCTION upsert_visitor_visit IS 'Deduplicated visitor tracking by ip_hash; updates last_visit/page_url/referrer/is_bot and appends page to pages_viewed.';

