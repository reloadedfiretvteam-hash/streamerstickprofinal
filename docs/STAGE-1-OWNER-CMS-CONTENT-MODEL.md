# Stage 1 — Owner CMS content model (locked)

**Status:** Migration text prepared; applied in Stage 2 via GitHub Actions (`DATABASE_URL`).

## Decisions locked

1. **Plans & Services** = existing `real_products` IPTV/subscription SKUs, surfaced via `cms_plan_content` (display/SEO), commerce ID kept as `real_product_id`.
2. **Devices** = Google/ONN physical SKUs via `cms_device_content`; live DB currently has `android-onn-4k`, `android-onn-pro` plus legacy Fire Stick SKUs (Fire Stick must not be published as for-sale devices in CMS).
3. **Payment** = Stripe IDs remain on `real_products.shadow_*` / `site_promotion.promo_shadow_price_id` as **display-only** in content forms; CMS Save handlers must not create Stripe prices.
4. **Feature flag:** Public homepage reads `cms_homepage` when `document` present; falls back to MainStore defaults if missing/error (`VITE_CMS_HOMEPAGE=1` default on).

## Admin IA (target modules)

Dashboard · Homepage · Banners · Google TV Devices · Plans & Services · Media · Pages/Nav · Guides · SEO · Support · Change History

## Migration file

[`supabase/migrations/20260922000000_owner_cms_content_model.sql`](../supabase/migrations/20260922000000_owner_cms_content_model.sql)

## Rollback

```sql
-- Only if Stage 2 must be fully reverted (does not delete real_products)
DROP TABLE IF EXISTS public.cms_admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.cms_content_revisions CASCADE;
DROP TABLE IF EXISTS public.cms_seo_metadata CASCADE;
DROP TABLE IF EXISTS public.cms_media_assets CASCADE;
DROP TABLE IF EXISTS public.cms_brand_settings CASCADE;
DROP TABLE IF EXISTS public.cms_navigation CASCADE;
DROP TABLE IF EXISTS public.cms_guides CASCADE;
DROP TABLE IF EXISTS public.cms_plan_content CASCADE;
DROP TABLE IF EXISTS public.cms_device_content CASCADE;
DROP TABLE IF EXISTS public.cms_banners CASCADE;
DROP TABLE IF EXISTS public.cms_homepage CASCADE;
-- Optional: keep site_promotion if legacy admin needs it
ALTER TABLE public.real_products DROP COLUMN IF EXISTS public_display_price_cents;
ALTER TABLE public.real_products DROP COLUMN IF EXISTS public_compare_at_cents;
ALTER TABLE public.real_products DROP COLUMN IF EXISTS content_kind;
```

## Backup before apply

pg_dump or Supabase dashboard backup of `real_products`, `site_settings`, `page_edits`, `orders` recommended before first apply.
