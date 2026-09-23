-- Lock shopper-facing tables so the public Supabase key cannot read or change them.
-- The site worker uses the service role, which bypasses row level security.

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_edits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.customers FROM anon, authenticated;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.payment_transactions FROM anon, authenticated;
REVOKE ALL ON TABLE public.real_products FROM anon, authenticated;
REVOKE ALL ON TABLE public.visitors FROM anon, authenticated;
REVOKE ALL ON TABLE public.page_edits FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.get_live_visitors() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_shadow_product_prices() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.upsert_visitor_visit(text, text, text, text, text, text, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_username(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_password() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_live_visitors() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_shadow_product_prices() TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_visitor_visit(text, text, text, text, text, text, text, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_username(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_password() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role, authenticated;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.visitors_preserve_first_visit() SET search_path = public;
ALTER FUNCTION public.generate_username(text) SET search_path = public;
ALTER FUNCTION public.generate_password() SET search_path = public;
ALTER FUNCTION public.real_products_price_sync() SET search_path = public;
ALTER FUNCTION public.update_admin_credentials_timestamp() SET search_path = public;
ALTER FUNCTION public.get_live_visitors() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.sync_shadow_product_prices() SET search_path = public;
ALTER FUNCTION public.upsert_visitor_visit(text, text, text, text, text, text, text, text, text, boolean) SET search_path = public;
