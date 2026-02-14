# Audit: What Was Found, Fixed, and Deploy Status

Single list of everything from the SEO, Supabase, Cloudflare, code, and admin audits.

---

## Found and fixed (in repo)

| # | Finding | Fix |
|---|---------|-----|
| 1 | **SEO: Duplicate schema on homepage** – MainStore injected duplicate WebSite + Organization (already in index.html) and unused `organizationData` with broken `logo.png`. | Removed duplicate WebSite/Organization and dead `organizationData` from MainStore. Homepage uses index.html for those; MainStore keeps ItemList + ServiceSchema only. |
| 2 | **SEO: Blog post multiple H1s** – Post body could turn every `#` into `<h1>`, so more than one H1 per page. | Use `<h2>` for top-level `#` in post content so only the post title is H1. (In this repo it was already h2.) |
| 3 | **Front-end: Missing /seo-ads routes** – Admin “Open” goes to `/seo-ads/:slug` but App had no route → 404. | Added lazy `SeoAds` and routes `/seo-ads` and `/seo-ads/:slug` in App.tsx. |
| 4 | **Supabase: `seo_ads` table never created by migrations** – Worker `/api/seo-ads` and Admin SEO Ads use `seo_ads`; no migration in repo created it. | Added `supabase/migrations/20260214000000_create_seo_ads.sql` (CREATE TABLE seo_ads + indexes + RLS). Updated `scripts/run-supabase-migration.ts` to run `20260214*` so deploy creates the table. |
| 5 | **ResetPassword: Missing H1** – Page had no H1 (Bing “missing H1”). | Added sr-only `<h1>` in all four states (verifying, invalid link, success, form). |
| 6 | **Sitemap: 500 when Supabase fails** – `/sitemap.xml` could return 500 if getBlogPosts/getSeoPagesForSitemap threw. | Made sitemap resilient: try/catch per storage call, default to empty arrays; always return 200 with static + location-pages.json so no 500. |
| 7 | **Admin: Supabase key fallback** – Admin routes only used `SUPABASE_SERVICE_KEY \|\| VITE_SUPABASE_ANON_KEY`; Cloudflare env might use `SUPABASE_SERVICE_ROLE_KEY`. | In `worker/routes/admin.ts`, all createClient now use `SUPABASE_SERVICE_KEY \|\| SUPABASE_SERVICE_ROLE_KEY \|\| SUPABASE_SERVICE_ROLL_KEY \|\| VITE_SUPABASE_ANON_KEY`. |
| 8 | **Client: manifest.json 404** – index.html links to `/manifest.json` but file was missing. | Added `client/public/manifest.json` with name, start_url, theme_color, icons. |
| 9 | **Docs: Worker env unclear** – GITHUB-SECRETS didn’t list every Cloudflare Pages env the Worker needs. | Expanded “Worker runtime” in GITHUB-SECRETS-CHECKLIST with full list (Supabase, Stripe, auth, email, optional). |

---

## Found, documented (no code change)

| # | Finding | Why not “fixed” |
|---|---------|------------------|
| 10 | **run-supabase-migration only runs 20260207*–20260214*** – Tables `blog_posts`, `real_products`, `visitors`, `users` come from older 202511* migrations, which the deploy workflow does **not** run. | By design: production DB is expected to have been set up earlier (full migration run or Supabase dashboard). Adding 202511* to the script could conflict with existing DBs. Documented in DEEP-AUDIT and migration script comments. |
| 11 | **Favicon/OG images** – index.html references `favicon.png`, `opengraph.jpg`, `apple-touch-icon.png`; these may be missing in `client/public`. | If they 404, add those files to `client/public`. No code bug. |

---

## Deploy status

- **Deploy is not run by the audit.** Pushing to GitHub and running Actions is done by you.
- To deploy everything above:
  1. Commit all changes (App, MainStore, worker, scripts, migrations, docs).
  2. Push to **clean-main**:  
     `git push origin clean-main`
- The workflow will:
  - Run migrations (including **20260214000000_create_seo_ads.sql**),
  - Build (Vite + Worker),
  - Deploy to Cloudflare Pages,
  - Optionally purge cache if `CLOUDFLARE_ZONE_ID` is set,
  - Ping sitemaps and run IndexNow.

So: **everything listed under “Found and fixed” is in the repo; “deployed” means you push to clean-main and the workflow runs.**

---

## Quick checklist (all fixed in code)

- [x] Homepage: no duplicate WebSite/Organization; no broken logo.png in schema  
- [x] Blog: one H1 per post (title only); `#` in content → h2  
- [x] /seo-ads and /seo-ads/:slug routes and SeoAds component  
- [x] seo_ads table created by migration 20260214; run-supabase-migration runs it  
- [x] ResetPassword has H1 in every state  
- [x] Sitemap never 500s (resilient to Supabase failure)  
- [x] Admin Supabase key fallback includes ROLE_KEY and ROLL_KEY  
- [x] manifest.json in client/public  
- [x] GITHUB-SECRETS checklist has full Worker env list  
