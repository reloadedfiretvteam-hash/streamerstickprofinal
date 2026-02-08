# Elite SEO & Technical Audit — Final Checklist

This document is the single source of truth for: **no generics, no samples, everything implemented and working** for elite SEO (GSC, IndexNow, E-E-A-T, snippets, breadcrumbs, internal links, meta, schema). Use it to verify every variable, pipeline, and page.

---

## 1. Environment variables & secrets

### 1.1 Worker `Env` (worker/index.ts)

| Variable | Required at runtime | Used for |
|----------|----------------------|----------|
| `VITE_SUPABASE_URL` | Yes | Supabase client (storage, blog, seo_architecture, redirect_map) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase client (fallback when no service key) |
| `SUPABASE_SERVICE_KEY` | Yes | Server-side Supabase (admin, orders, products, SEO tables) |
| `STRIPE_SECRET_KEY` | Yes | Checkout, webhooks |
| `STRIPE_PUBLISHABLE_KEY` | Yes | `/api/stripe/config` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signature verification |
| `RESEND_API_KEY` | Yes | Order/trial/email campaigns |
| `RESEND_FROM_EMAIL` | Yes | Sender (e.g. noreply@streamstickpro.com) |
| `ADMIN_USERNAME` | Recommended | Admin panel login |
| `ADMIN_PASSWORD` | Recommended | Admin panel login |
| `NODE_ENV` | Optional | Debug / behavior |
| `JWT_SECRET` | Optional | JWT signing if used |
| `DATABASE_URL` | **No** (CI only) | Not used by worker; only by `scripts/run-supabase-migration.ts` in GitHub Actions |
| `ASSETS` | Injected by Cloudflare | SPA + static files fallback |
| `GITHUB_TOKEN`, `OPENAI_API_KEY`, `CLOUDFLARE_*` | Optional | Admin/AI/deploy features |

### 1.2 GitHub Actions (deploy-cloudflare.yml)

Set in **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- `DATABASE_URL` (for run-supabase-migration only; optional)
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`, `SESSION_SECRET`

### 1.3 Cloudflare Pages (runtime)

Set in **Workers & Pages → streamerstickpro-live → Settings → Environment variables**:

- **Vars (can match wrangler.toml):** `NODE_ENV`, `RESEND_FROM_EMAIL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SECURE_HOSTS`, `VITE_STORAGE_BUCKET_NAME`, `SITE_URL`
- **Secrets:** `STRIPE_WEBHOOK_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SUPABASE_SERVICE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, (optional) `JWT_SECRET`, `SESSION_SECRET`

Ref: `docs/SECRETS_CHECKLIST.md`, `wrangler.toml` comments.

---

## 2. Every page: title, meta description, H1

| Route | Title set | Meta description | H1 |
|-------|-----------|-------------------|-----|
| `/` (MainStore) | ✅ index.html + JS | ✅ index.html + JS | ✅ Hero/headline |
| `/shop` | ✅ Shop.tsx | ✅ Shop.tsx | ✅ "Shop StreamStickPro" |
| `/blog` | ✅ Blog.tsx (default + per post) | ✅ Blog (per post meta) | ✅ Post title or "Blog" |
| `/blog/:slug` | ✅ From post | ✅ From post | ✅ Post title |
| `/iptv-services` | ✅ IptvServices.tsx | ✅ | ✅ PillarLayout(title) |
| `/iptv-firestick` | ✅ IptvFirestick.tsx | ✅ | ✅ PillarLayout(title) |
| `/jailbroken-fire-sticks` | ✅ JailbrokenFireSticks.tsx | ✅ | ✅ PillarLayout(title) |
| `/firestick-devices` | ✅ FirestickDevices.tsx | ✅ | ✅ PillarLayout(title) |
| `/best-iptv-firestick` | ✅ BestIptvFirestick.tsx | ✅ | ✅ PillarLayout(title) |
| `/iptv-media-players` | ✅ IptvMediaPlayers.tsx | ✅ | ✅ PillarLayout(title) |
| `/l/:country/:pageType/:slug` | ✅ From API (page.title/h1) | ✅ From API (page.meta_description) | ✅ displayH1 (page.h1 + [LOCATION]) |
| `/terms` | ✅ TermsOfService | ✅ | ✅ "Terms of Service" |
| `/privacy` | ✅ PrivacyPolicy | ✅ | ✅ "Privacy Policy" |
| `/refund` | ✅ RefundPolicy | ✅ | ✅ "Refund Policy" |
| `/checkout` | ✅ | — | Contextual |
| `/success` | ✅ | — | Contextual |
| `/admin` | — | noindex in practice | ✅ |
| `/shadow-services` | ✅ | — | ✅ |
| 404 | — | — | ✅ "404 Page Not Found" |

All pillar and location pages use **unique, non-generic** copy (18K+ channels, StreamStickPro, real keywords). No “lorem” or “sample” in live UI.

---

## 3. Internal links (no broken or generic links)

### 3.1 Global nav (PillarLayout + MainStore)

- Home `/`, Shop `/shop`, IPTV `/iptv-services`, Firestick `/iptv-firestick`, Devices `/firestick-devices`, Media Players `/iptv-media-players`, Jailbroken `/jailbroken-fire-sticks`, Blog `/blog`. All point to correct paths.

### 3.2 Location pages

- **From API:** `internal_links` (related guides) when provided by `seo_architecture`.
- **Fallback in page:** CTA block links to `/`, `/shop`, `/jailbroken-fire-sticks`, `/iptv-services`, `/iptv-media-players` (always present).

### 3.3 Blog (prerender + client)

- **Related guides:** IPTV Services, Jailbroken Fire Sticks, IPTV for Fire Stick, Shop (in `scripts/prerender-blog.ts`).
- **Footer:** Home, Shop, IPTV Services, Jailbroken Fire Sticks, Blog.

### 3.4 Redirects (worker)

- DB `redirect_map` first, then static: `/guides`→`/iptv-services`, `/guide`→`/iptv-services`, `/firestick`→`/iptv-firestick`, `/jailbreak`→`/jailbroken-fire-sticks`, `/devices`→`/firestick-devices`, `/media-players`, `/iptv-apps`, `/iptv-players`→`/iptv-media-players`. No generics; all canonical.

---

## 4. Schema & snippets

### 4.1 index.html (homepage)

- **Organization:** name, url, logo, description, contactPoint (support@streamstickpro.com), sameAs (empty; add social URLs when you have them).
- **WebSite:** name, url, SearchAction (blog search).
- **Store:** name, image, url, description, priceRange, address, hasOfferCatalog.
- **FAQPage:** 5 questions/answers (setup, savings, content, complexity).
- **LocalBusiness:** name, description, url, image, email, contactPoint, serviceType, areaServed; sameAs [].
- **Product:** StreamStickPro IPTV Subscription, AggregateOffer (shop URL, price range, availability).

No placeholder telephone; contact is email + contactPoint. All copy is real (18K+ channels, StreamStickPro).

### 4.2 Location pages

- **SEOSchema:** FAQ (when from API), BreadcrumbList (from breadcrumbs). Injected by LocationPage.

### 4.3 Breadcrumbs

- **PillarLayout:** Renders breadcrumbs; LocationPage builds from API (Home → Country → Page type → Slug). Schema breadcrumbs use absolute URLs (SITE_URL + path).

---

## 5. Worker pipeline (Cloudflare)

### 5.1 Order of execution

1. CORS
2. API routes: `/api/auth`, `/api/products`, `/api/checkout`, `/api/orders`, `/api/admin/*`, `/api/stripe`, `/api/track`, `/api/customer`, `/api/free-trial`, `/api/blog`, `/api/seo-ads`, `/api/ai-assistant`, `/api/email-campaigns`, `/api/track-cart`, `/api/stripe/config`, `/api/health`, `/api/seo-page/:country/:pageType/:slug`, `/api/debug`, `/cron/email-campaigns`
3. **SEO 301 redirects:** DB (`redirect_map`) then static map
4. **Sitemap index:** `/sitemap-index.xml` → points to `/sitemap.xml`
5. **Sitemap:** `/sitemap.xml` → static pages + blog posts (published) + `seo_architecture` (up to 25k URLs)
6. **Catch-all:** ASSETS (SPA fallback to index.html); security headers on all responses

### 5.2 _routes.json (script/build-worker.ts)

- **Include:** `["/*"]` so worker handles redirects, sitemap, `/l/*`, API, SPA.
- **Exclude:** `/assets/*`, `/robots.txt`, static extensions (css, js, images, fonts), `BingSiteAuth.xml`, `googledf2a7b91b7b9494f.html`, IndexNow key files (`59748a36d4494392a7d863abcf2d3b52.txt`, `696320d78e6e55d1584eca38a9d864b5.txt`) so Pages serves them from dist.

### 5.3 Sitemap contents

- Static: `/`, `/shop`, `/blog`, pillar pages, terms/privacy/refund, checkout. No `/free-trial` (301 to `/`).
- Blog: all published posts from storage.
- Location: from `getSeoPagesForSitemap(25000)` (seo_architecture). No duplicates; `/shop` once.

---

## 6. Cloudflare Pages & build

- **Project:** streamerstickpro-live; branch clean-main.
- **Build:** `npx tsx script/build-worker.ts` (Vite client → dist, esbuild worker → dist/_worker.js, _routes.json, prerender blog).
- **Deploy:** wrangler-action `pages deploy dist --project-name=streamerstickpro-live --branch=clean-main`.
- **Post-deploy:** Warm sitemap (curl), ping Google/Bing sitemap, optional `scripts/indexnow-from-live-sitemap.ts` (IndexNow).

---

## 7. IndexNow & verification

- **Key file:** `59748a36d4494392a7d863abcf2d3b52.txt` in `client/public/` → deployed to `https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt` (excluded from worker so Pages serves it).
- **Key location:** Same URL in `client/src/lib/indexnow.ts` (keyLocation). Used by `scripts/indexnow-from-live-sitemap.ts` (SITE_URL, key, keyLocation).
- **GSC:** `googledf2a7b91b7b9494f` in index.html; file in public.
- **Bing:** `msvalidate.01` in index.html; BingSiteAuth.xml in public.

---

## 8. Supabase & migrations

- **Schema:** `supabase/migrations/20260207000001_seo_domination_schema.sql` (redirect_map, seo_architecture, etc.).
- **Seed:** `20260207000002_seed_50_location_pages.sql` (50 location pages; 18,000+ channels; no prices in copy).
- **CI:** `scripts/run-supabase-migration.ts` runs both when `DATABASE_URL` (mapped to SUPABASE_DATABASE_URL in workflow) is set in GitHub Secrets. If not set, run the two migrations manually in Supabase SQL Editor.

---

## 9. No generics / no samples

- **Copy:** All user-facing title, description, H1, schema text use real product (StreamStickPro, 18K+ channels, Fire Stick, IPTV, etc.). No “lorem”, “sample”, or “your brand”.
- **Data:** Location pages and blog from DB/CMS; pillar content in code is real. Seed data uses real-looking location names and slugs.
- **Schema:** sameAs is empty (valid); add social profile URLs when available. All other fields filled with real values.

---

## 10. Quick verification list

- [ ] GitHub Secrets: all required names set (no typos).
- [ ] Cloudflare Pages env: STRIPE_WEBHOOK_SECRET, ADMIN_*, SUPABASE_SERVICE_KEY, Stripe keys, RESEND_*.
- [ ] Supabase: migrations 20260207000001 and 20260207000002 applied (redirect_map, seo_architecture, 50 locations).
- [ ] After deploy: `https://streamstickpro.com/sitemap.xml` returns XML with home, shop, blog, pillars, location URLs.
- [ ] `https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt` returns key content.
- [ ] Redirects: e.g. `/guides` → 301 to `/iptv-services`.
- [ ] Location: e.g. `/l/us/iptv/houston` returns 200 with H1 and meta from API (when row exists).
- [ ] GSC/Bing: sitemap submitted; optional URL inspection for key pages.

This audit aligns with: FINAL-LINE-BY-LINE-AUDIT.md, SEO-MASTER-AUDIT.md, CRITICAL-AUDIT.md, ELITE_TRAFFIC_PLAYBOOK.md, and SECRETS_CHECKLIST.md. Everything listed above is implemented and intended to be working; no placeholders or sample content in production paths.
