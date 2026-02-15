# Deploy Checklist: Supabase + Cloudflare Workers + API

**Push to `clean-main`** triggers the full pipeline. Ensure the following are in place.

---

## 1. GitHub Secrets (Settings → Secrets and variables → Actions)

Required for **migrations**, **25K seed**, **build**, and **deploy**:

| Secret | Purpose |
|--------|---------|
| `SUPABASE_DATABASE_URL` or `DATABASE_URL` | Runs SQL migrations (20260207*–20260214*) in CI |
| `VITE_SUPABASE_URL` | Build + 25K seed + Worker needs at runtime |
| `VITE_SUPABASE_ANON_KEY` | Client auth + build |
| `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) | 25K seed + Worker API (sitemap, /l/, blog, admin) |
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy to Cloudflare Pages |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout / webhooks |
| `RESEND_API_KEY` | Email (trial, order) |
| `SESSION_SECRET` | Admin/auth sessions |

Optional: `CLOUDFLARE_ZONE_ID` for cache purge after deploy.

---

## 2. Supabase (updated by workflow)

- **Migrations** run automatically on push to `clean-main` via `scripts/run-supabase-migration.ts`.
- Uses **SUPABASE_DATABASE_URL** or **DATABASE_URL** (PostgreSQL connection string from Supabase → Project Settings → Database).
- Applies all `supabase/migrations/` files matching `20260207*`–`20260214*` (SEO, visitors, blog, seo_ads, etc.).
- If migration fails (e.g. already applied), the step continues so deploy still runs.

---

## 3. Cloudflare Pages – Worker runtime (API endpoints)

The **Worker** (`dist/_worker.js`) serves all API routes and dynamic pages. It gets **runtime** env from **Cloudflare**, not from the build.

**Set in Cloudflare:**  
**Pages → streamerstickpro-live → Settings → Environment variables (Production)**

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase API (sitemap, /api/seo-page, blog, redirects, track-visit) |
| `VITE_SUPABASE_ANON_KEY` | Client-side Supabase |
| `SUPABASE_SERVICE_KEY` (or ROLE/ROLL) | Server-side Supabase (admin, sitemap, /l/ pages from DB) |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout & webhooks |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin panel |
| `SESSION_SECRET` | Auth sessions |

Without **VITE_SUPABASE_URL** and **SUPABASE_SERVICE_KEY** in Cloudflare, the Worker will still serve static assets and location pages from `location-pages.json`, but `/api/*` endpoints that use Supabase (blog, sitemap from DB, track-visit, admin) will fail.

---

## 4. What the workflow does (on push to clean-main)

1. **Run Database Migration** – Supabase SEO + visitor + blog + seo_ads (20260207*–20260214*).
2. **Seed 25K location pages** – If VITE_SUPABASE_URL + SUPABASE_SERVICE_KEY (or DATABASE_URL) set.
3. **Build** – Vite client → `dist/`, Worker → `dist/_worker.js`, `_routes.json`, `location-pages.json`, blog prerender.
4. **Deploy** – `wrangler pages deploy dist` → Cloudflare Pages project `streamerstickpro-live`.
5. **Purge cache** – If CLOUDFLARE_ZONE_ID set.
6. **Ping sitemaps** – Google, Bing, Yandex.
7. **IndexNow** – Submit URLs from live sitemap.

---

## 5. Verify after deploy

- **Site:** https://streamstickpro.com
- **API health:** https://streamstickpro.com/api/health
- **Sitemap:** https://streamstickpro.com/sitemap-index.xml
- **IndexNow key:** https://streamstickpro.com/752d1cf8edc045568943005a03892968.txt

If sitemap or /l/ pages are empty, check GitHub Secrets and Cloudflare env (Supabase URL + service key).
