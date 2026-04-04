-- Table-level grants (non-fatal: some DB roles or hosts reject GRANT).
-- Workers using the Supabase service_role JWT bypass RLS; these help direct pg access.
DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_promotion TO postgres;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'site_promotion GRANT to postgres skipped: %', SQLERRM;
END $$;

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_promotion TO service_role;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'site_promotion GRANT to service_role skipped: %', SQLERRM;
END $$;
