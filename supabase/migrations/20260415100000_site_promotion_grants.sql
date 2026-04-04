-- Ensure PostgREST can read/write site_promotion when using valid API keys.
-- service_role JWT bypasses RLS; grants still apply for table-level access.
grant select, insert, update, delete on table public.site_promotion to postgres;
grant select, insert, update, delete on table public.site_promotion to service_role;
