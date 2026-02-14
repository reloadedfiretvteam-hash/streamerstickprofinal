# Deep Audit: Cloudflare ↔ SEO, Supabase, GitHub

**Purpose:** One checklist so Cloudflare, Supabase, and GitHub are aligned and nothing is missing for SEO and deploy.

---

## 1. Cloudflare ↔ SEO

| Check | Status | Notes |
|-------|--------|--------|
| **Worker serves sitemaps** | OK | `/sitemap-index.xml`, `/sitemap-pages.xml`, `/sitemap-posts.xml`, `/sitemap.xml` — all in worker; sitemap.xml never 500s (resilient to Supabase failure). |
| **Sitemap index** | OK | Lists sitemap-pages, sitemap-posts, sitemap.xml. Workflow pings `sitemap-index.xml` to Google/Bing/Yandex. |
| **STATIC_SITEMAP_PAGES** | OK | Matches all indexable app routes (/, /shop, /blog, pillars, /tutorials, /resources, /terms, /privacy, /refund, /checkout, vs-*, /ultimate-iptv-catalog-2026, /tools/catalog). No login/success/admin. |
| **Redirects** | OK | DB first (redirect_map), then static map in worker. No redirect-everything. |
| **/l/:country/:pageType/:slug** | OK | Crawler gets OG HTML from worker; SPA from assets. location-pages.json fallback if DB empty. |
| **_routes.json** | OK | `include: ["/*"]` so API, sitemaps, /l/*, redirects hit Worker. Static assets (JS, CSS, images, verification files) excluded. |
| **robots.txt** | OK | In client/public; Allow /, Disallow /api/, /admin, /shadow-services, /checkout, /success, /cancel. Two Sitemap lines. |
| **IndexNow** | OK | Key file `59748a36d4494392a7d863abcf2d3b52.txt` in public; workflow runs indexnow-from-live-sitemap.ts after deploy. |
| **CORS** | OK | Worker allows streamstickpro.com, www, secure subdomain. |

**Manual (Cloudflare Dashboard):** Bot Fight Mode Off; Security Level Medium/Low; SSL Full; no global redirect away; Pages project build Success; custom domain Active. Purge cache after config changes (or set CLOUDFLARE_ZONE_ID in GitHub for auto purge).

---

## 2. Cloudflare ↔ Supabase

| Check | Status | Notes |
|-------|--------|--------|
| **Worker env** | Doc | Worker reads `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLL_KEY` or `VITE_SUPABASE_ANON_KEY` (helpers.ts + admin.ts). Set in **Cloudflare Pages → Settings → Environment variables**. |
| **getStorage()** | OK | Uses SERVICE_KEY || ROLE_KEY || ROLL_KEY || ANON. Admin routes now use same fallback chain. |
| **Sitemap** | OK | If Supabase fails, sitemap.xml still returns static pages + location-pages.json (no 500). |
| **Redirects** | OK | DB redirect_map then static; catch block uses static. |
| **/l/ crawler HTML** | OK | getSeoPageByPath then location-pages.json fallback. |
| **track-visit** | Needs env | Requires VITE_SUPABASE_URL + service key in Cloudflare for RPCs. |
| **Blog / products** | Needs env | getBlogPosts, getRealProducts used by sitemaps and APIs; anon key may RLS-block — use service key in production. |

**Conclusion:** Set **VITE_SUPABASE_URL** and **SUPABASE_SERVICE_KEY** (or ROLE_KEY/ROLL_KEY) in Cloudflare Pages env so sitemaps, redirects, /l/ pages, track-visit, and admin work. If not set, sitemaps and /l/ still work via static/location-pages.json.

---

## 3. GitHub ↔ Deploy

| Check | Status | Notes |
|-------|--------|--------|
| **Trigger** | OK | Push to `clean-main` and workflow_dispatch; schedule uses ref clean-main. |
| **Migrations** | OK | run-supabase-migration.ts uses SUPABASE_DATABASE_URL or DATABASE_URL from secrets. |
| **25K seed** | OK | Uses VITE_SUPABASE_URL + SUPABASE_SERVICE_KEY (or ROLE/ROLL) or DATABASE_URL. |
| **Build** | OK | script/build-worker.ts; env from GitHub Secrets (VITE_*, STRIPE_*, SUPABASE_*, RESEND, SESSION_SECRET). |
| **Deploy** | OK | wrangler-action pages deploy dist; project streamerstickpro-live, branch clean-main. |
| **Secrets** | Doc | GITHUB-SECRETS-CHECKLIST.md lists required + optional. Worker runtime env is **Cloudflare** only (not injected by workflow). |
| **Cache purge** | Optional | Set CLOUDFLARE_ZONE_ID in GitHub Secrets for purge after deploy. |
| **Sitemap ping** | OK | Google, Bing, Yandex with sitemap-index.xml. |
| **IndexNow** | OK | Script runs after deploy with SITE_URL. |

---

## 4. Client public assets

| Asset | Status | Notes |
|-------|--------|--------|
| **manifest.json** | Added | Created; index.html links to it. |
| **favicon.png** | Add if missing | index.html + schema reference it. Add to client/public if 404. |
| **opengraph.jpg** | Add if missing | OG/twitter image. Add to client/public if 404. |
| **apple-touch-icon.png** | Add if missing | PWA/manifest. Add to client/public if 404. |
| **robots.txt** | OK | Present. |
| **IndexNow key** | OK | 59748a36d4494392a7d863abcf2d3b52.txt present. |
| **Verification** | OK | googledf2a7b91b7b9494f.html, BingSiteAuth.xml. |

---

## 5. Fixes applied in this audit

1. **manifest.json** — Added to client/public so the link in index.html does not 404.
2. **sitemap.xml** — Made resilient: if Supabase or getStorage fails, sitemap still returns static pages + location-pages.json (never 500).
3. **admin.ts** — All createClient now use SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLL_KEY || VITE_SUPABASE_ANON_KEY so Cloudflare env with ROLE_KEY/ROLL_KEY works.
4. **GITHUB-SECRETS-CHECKLIST** — Expanded “Worker runtime” with full Cloudflare Pages env list (Supabase, Stripe, auth, email, optional keys).

---

## 6. What to do next

1. **Cloudflare Pages → Environment variables:** Ensure every variable in section 2 and GITHUB-SECRETS-CHECKLIST “Worker runtime” is set for Production.
2. **Public images:** If favicon.png, opengraph.jpg, or apple-touch-icon.png are missing, add them to client/public (or confirm they are generated/copied by build).
3. **Deploy:** Push to clean-main (or run workflow) to build and deploy; then confirm sitemaps and IndexNow in the workflow summary.
