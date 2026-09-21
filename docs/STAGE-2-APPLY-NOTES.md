# Stage 2 apply notes

## What applied

1. **Cloudflare deploy** of Owner CMS Worker + public routes: success on `clean-main` (`7982997`+).
2. **Content store (live):** `site_settings` JSON keys because GitHub Actions `DATABASE_URL` is present but **not a valid Postgres URI** (`Invalid URL` in migrate workflow).
   - `cms_homepage_v1` (published three-path homepage)
   - `cms_devices_v1` (2 ONN devices: `android-onn-4k`, `android-onn-pro`)
   - `cms_plans_v1` (24 IPTV plans)
3. **SQL migration file** remains at `supabase/migrations/20260922000000_owner_cms_content_model.sql` for when a valid `DATABASE_URL` / `SUPABASE_DATABASE_URL` is configured.
4. Worker APIs auto-detect: prefer `cms_*` tables; else use `site_settings` fallback.

## Owner action required for full table migration

Fix GitHub secret `DATABASE_URL` to a real Supabase connection URI:

`postgresql://postgres.[ref]:[password]@aws-0-….pooler.supabase.com:5432/postgres`

Then re-run **Actions → Run Database Migration**.

## Live schema gaps vs repo

`real_products` on live is missing `sale_price` and `card_promo_label` (PostgREST 42703). Promo/sale columns from 202604 migrations were never applied. Owner CMS uses `price` for display until migration succeeds.
