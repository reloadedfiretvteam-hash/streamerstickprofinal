# Builder Reference: SEO Domination – API Endpoints, Supabase, Cloudflare, GitHub

Single source of truth for the SEO domination stack. Use this to wire frontends, scripts, and CI.

---

## 1. Public API (Worker – Cloudflare)

Base URL: `https://streamstickpro.com` (or your Pages host).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/seo-page/:country/:pageType/:slug` | Fetch one location page (JSON). Params: country (e.g. usa), pageType (iptv \| jailbreak \| google), slug (e.g. houston-tx). |
| GET | `/sitemap.xml` | Dynamic sitemap: static pages + blog + up to 25K URLs from `seo_architecture`. |
| GET | `/sitemap-index.xml` | Sitemap index (points to sitemap.xml). |
| GET | `/l/:country/:pageType/:slug` | Location page URL. Crawlers get OG-rich HTML; browsers get SPA (index.html). |

**Redirects:** 301s are applied in the Worker: first from Supabase `redirect_map`, then from static map (`/firestick` → `/jailbroken-fire-sticks`, `/jailbreak` → `/jailbroken-fire-sticks`, etc.).

---

## 2. Admin API (Worker – behind auth)

Base: `https://streamstickpro.com`. All under `/api/admin`; require admin auth header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/seo/stats` | SEO stats: totalPages, totalRedirects, locationPageCount, blogPageCount, sitemapUrlCount. |
| GET | `/api/admin/seo/redirects` | List redirects (sourceUrl, targetUrl, redirectType). |
| GET | `/api/admin/seo/live-stats` | redirectCount, locationPageCount, blogPageCount, sitemapUrlCount, sitemapUrl, indexNowKeyUrl. |
| GET | `/api/admin/seo/infrastructure` | infrastructure (supabase, cloudflare, github, worker), seo (healthScore, redirectCount, locationPageCount, blogPageCount, sitemapUrlCount), urls (sitemap, indexNow, liveSite). |
| GET | `/api/admin/seo/location-pages?limit=200` | List from `seo_architecture` (path, title, country, page_type, slug). Max limit 1000. |
| POST | `/api/admin/seo/redirects` | Add redirect. Body: `{ "sourceUrl": "/old", "targetUrl": "/new", "redirectType": 301 }`. |
| DELETE | `/api/admin/seo/redirects?old_path=/old` | Delete redirect by old_path. |

---

## 3. Supabase – SEO Tables

**Database:** Supabase Postgres. Migrations in `supabase/migrations/`; CI runs all `20260207*.sql` in order on push (see GitHub workflow).

| Table | Purpose |
|-------|--------|
| `seo_architecture` | Location/topic pages. Columns: id, page_type (iptv \| jailbreak \| google), country (USA \| CA \| UK), region, location, slug, target_keyword, title, meta_description, h1, p1_snippet, pillar_url, internal_links (JSONB), content_blocks (JSONB), schema_type, faq_json (JSONB), published, created_at, updated_at. UNIQUE(page_type, country, slug). |
| `redirect_map` | 301 rules. Columns: id, old_path, new_path, status_code, created_at. |
| `content_clusters` | Pillar → cluster mapping. Columns: id, pillar_topic, pillar_url, cluster_keywords (JSONB), cluster_page_slugs (JSONB), topical_authority_target, created_at. |
| `seo_experts` | E-E-A-T author bios. Columns: id, name, title, bio, image_url, created_at. |

**RLS:** `seo_architecture` and `redirect_map` and `content_clusters` and `seo_experts` have public read policies; writes use service role.

**Migrations run by CI (in filename order):**  
`20260207000001_seo_domination_schema.sql` → … → `20260207000008_seo_content_clusters_seed.sql`.  
Script: `scripts/run-supabase-migration.ts` (reads all `20260207*.sql`, sorts, runs in order).

---

## 4. Cloudflare Worker – Routes and Order

- **Auth:** `/api/auth/*`  
- **Products, checkout, orders:** `/api/products`, `/api/checkout`, `/api/orders`  
- **Admin (auth required):** `/api/admin/*` (includes `/api/admin/seo/*`)  
- **Stripe, track, customer, trial, blog, seo-ads, ai-assistant, email-campaigns:** `/api/stripe`, `/api/track`, `/api/customer`, `/api/free-trial`, `/api/blog`, `/api/seo-ads`, `/api/ai-assistant`, `/api/email-campaigns`  
- **SEO:** `/api/seo-page/:country/:pageType/:slug`  
- **Crawler OG:** GET `/l/:country/:pageType/:slug` (crawler User-Agent → OG HTML; else next)  
- **Redirects:** GET `*` → DB redirect_map then static map → 301  
- **Sitemaps:** GET `/sitemap-index.xml`, GET `/sitemap.xml`  
- **Static/SPA:** GET `*` → ASSETS (index.html fallback)

**Worker env (wrangler.toml [vars] + Dashboard secrets):**  
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, STRIPE_*, RESEND_*, ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET, etc. Required for SEO: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY (worker reads redirect_map and seo_architecture from Supabase).

---

## 5. GitHub – Pipeline and Secrets

**Workflow:** `.github/workflows/deploy-cloudflare.yml`  
**Trigger:** Push to `clean-main` or workflow_dispatch.

**Steps:**  
1. Checkout  
2. Setup Node 20, npm install  
3. **Run Database Migration** – `npx tsx scripts/run-supabase-migration.ts` (needs `SUPABASE_DATABASE_URL`)  
4. **Build for Cloudflare Workers** – `npx tsx script/build-worker.ts` (client + worker → dist)  
5. **Deploy to Cloudflare Pages** – `pages deploy dist --project-name=streamerstickpro-live --branch=clean-main`  
6. **Purge Cloudflare cache** – POST to Zones API purge_everything (needs `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN`)  
7. **Warm sitemap and ping** – GET sitemap, ping Google/Bing/Yandex  
8. **IndexNow** – `npx tsx scripts/indexnow-from-live-sitemap.ts`  

**Required GitHub Secrets:**

| Secret | Used by | Purpose |
|--------|--------|--------|
| SUPABASE_DATABASE_URL | run-supabase-migration.ts | Postgres connection for migrations (creates SEO tables, seed data). |
| CLOUDFLARE_API_TOKEN | wrangler-action + purge step | Deploy Pages; purge cache. |
| CLOUDFLARE_ACCOUNT_ID | wrangler-action | Deploy target. |
| CLOUDFLARE_ZONE_ID | purge step (optional) | Zone ID for streamstickpro.com (Dashboard → domain → Overview). Purge step no-ops if not set. |
| VITE_SUPABASE_URL | build-worker.ts | Supabase URL (worker + client). |
| VITE_SUPABASE_ANON_KEY | build-worker.ts | Supabase anon key. |
| SUPABASE_SERVICE_KEY | build-worker.ts (env to worker) | Worker reads redirect_map, seo_architecture, blog, etc. |
| STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET | build / worker | Checkout. |
| RESEND_API_KEY, SESSION_SECRET | build / worker | Email, auth. |

---

## 6. Scripts (local or CI)

| Script | Purpose | Env |
|--------|--------|-----|
| `npx tsx scripts/run-supabase-migration.ts` | Run all 20260207* SEO migrations + base tables. | SUPABASE_DATABASE_URL |
| `npx tsx scripts/seed-25k-location-pages.ts` | Insert 24,950 rows into seo_architecture (50 + 24,950 = 25K total). Upsert by (page_type, country, slug). | VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY |
| `npx tsx script/build-worker.ts` | Build client + worker → dist. | VITE_*, STRIPE_*, SUPABASE_*, RESEND_*, etc. |
| `npx tsx scripts/indexnow-from-live-sitemap.ts` | Submit sitemap URLs to IndexNow. | SITE_URL (e.g. https://streamstickpro.com) |

---

## 7. Frontend (Admin) – SEO Endpoints

Admin panel calls (with auth):

- `GET /api/admin/seo/infrastructure` → Infrastructure & SEO dashboard (cards, redirect count, location page count, sitemap URL count).  
- `GET /api/admin/seo/redirects` → Redirect list (add/delete in UI).  
- `GET /api/admin/seo/location-pages?limit=500` → Location pages list (path, title, country, page_type, slug).  
- `POST /api/admin/seo/redirects` → Add redirect (body: sourceUrl, targetUrl, redirectType).  
- `DELETE /api/admin/seo/redirects?old_path=...` → Delete redirect.

---

## 8. Checklist – “SEO prompt works”

- [ ] **Supabase:** All `20260207*.sql` migrations applied (run by CI or manually with SUPABASE_DATABASE_URL). Tables: seo_architecture, redirect_map, content_clusters, seo_experts.  
- [ ] **Supabase data:** At least 50 rows in seo_architecture (from 00002); optionally run seed-25k-location-pages.ts for 25K. redirect_map and content_clusters seeded by migrations.  
- [ ] **Cloudflare:** Pages project `streamerstickpro-live`, branch `clean-main`. Worker env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY set in Dashboard.  
- [ ] **GitHub:** Secrets set (SUPABASE_DATABASE_URL, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, VITE_SUPABASE_*, SUPABASE_SERVICE_KEY, etc.). Push to clean-main runs migrate → build → deploy → purge → sitemap ping → IndexNow.  
- [ ] **Live:** https://streamstickpro.com/sitemap.xml returns XML; https://streamstickpro.com/api/seo-page/usa/iptv/houston returns JSON; /l/usa/iptv/houston loads; redirects (e.g. /firestick → /jailbroken-fire-sticks) return 301.

Done. This is the builder reference for API endpoints, Supabase tables, Cloudflare worker, and GitHub pipeline for SEO domination.
