# SEO Prompt Checklist – Where Everything Lives

This maps **our SEO prompt** to the codebase so workers, SQL tables, storage, and endpoints are all in one place.

---

## 1. Supabase (SQL tables & storage)

| Prompt item | Implementation |
|-------------|----------------|
| **seo_architecture** | Table. 25K location pages (country, page_type, slug, title, meta_description, h1, p1_snippet, faq_json, internal_links, content_blocks, published). Migrations: `20260207000001_seo_domination_schema.sql`, `20260207000002_seed_50_location_pages.sql`. |
| **redirect_map** | Table. old_path, new_path, status_code. Migration: same schema. Worker reads this first, then static redirects. |
| **content_blocks, seo_experts, content_clusters** | Tables in 20260207* migrations. |
| **competitor_crush** | Table. Migration: `20260208120000_competitor_crush.sql`. |
| **iptv_channels, movies, series, seo_impressions** | Catalog tables. Migration: `20260209100000_ultimate_catalog_tables.sql`. RPC: `get_channels_by_country(p_country)`. |
| **Storage bucket** | `imiges` (products/hero). Optional: `iptv-previews` per `docs/SUPABASE-BUCKET-IPTV-PREVIEWS.md`. |

**Migrations run:** `scripts/run-supabase-migration.ts` (GitHub Actions). Uses `SUPABASE_DATABASE_URL` or `DATABASE_URL`.

---

## 2. Worker (Cloudflare)

| Prompt item | Implementation |
|-------------|----------------|
| **Redirects** | DB `redirect_map` first, then `SEO_REDIRECTS_STATIC` in `worker/index.ts` (e.g. /trial → /, /iptvstronger → /vs-iptvstronger). |
| **Sitemap** | `/sitemap-index.xml`, `/sitemap-pages.xml`, `/sitemap-posts.xml`, `/sitemap.xml`. From static list + `seo_architecture` (paginated) + fallback `location-pages.json`. |
| **25K location URLs** | Sitemap built from DB or from build-time `location-pages.json` when DB has &lt;2000 rows. |
| **Crawler HTML for /l/:country/:pageType/:slug** | Full HTML: title, meta description (155 chars), canonical, og, twitter, robots, **FAQPage schema**, BreadcrumbList, H1, “What StreamStickPro Builds”, related links. |
| **API** | `/api/seo-page/:country/:pageType/:slug`, `/api/catalog-summary`, `/api/health`, plus products, orders, blog, auth, etc. |

**Worker env (Cloudflare Pages project):** Set in dashboard so the worker can read them at runtime: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLL_KEY`), Stripe, Resend, etc. See `docs/GITHUB-SECRETS-CHECKLIST.md` for build/deploy; **Cloudflare Pages → project → Settings → Environment variables** for worker runtime.

---

## 3. Client (meta, schema, pages)

| Prompt item | Implementation |
|-------------|----------------|
| **Homepage** | `client/index.html`: H1, meta title/description, og, twitter, Organization, WebSite, Store, FAQPage, WebPage schema. `MainStore.tsx`: nuclear hero, 36hr trial, 3 CTAs, competitor section, device section, “Explore 93K Catalog”. |
| **Money pages** | `/36hr-trial`, `/pricing`, `/jailbroken-fire-sticks`, `/onn-google-tv`, `/iptv-smarters-pro`, `/tivimate`. Each has meta + PillarLayout + breadcrumbs. |
| **Crush pages** | `/vs-:competitor` (VsCompetitor.tsx). Tier 1 in sitemap; redirects /iptvstronger → /vs-iptvstronger etc. |
| **Catalog hub** | `/ultimate-iptv-catalog-2026` with Dataset schema and catalog stats. |
| **Location pages (SPA)** | `/l/:country/:pageType/:slug` → LocationPage.tsx. Crawlers get worker HTML; users get SPA. |
| **Breadcrumbs & FAQ schema** | PillarLayout, SEOSchema, LocationPage; worker HTML has BreadcrumbList + FAQPage for crawlers. |

---

## 4. GitHub Actions (deploy)

| Prompt item | Implementation |
|-------------|----------------|
| **Branch** | **clean-main only.** Push to clean-main triggers deploy. |
| **Steps** | Checkout → migrations (Supabase) → 25K seed (if URL + service key or DATABASE_URL) → build (Vite + worker) → deploy to Cloudflare Pages → purge cache (if ZONE_ID) → verify sitemap URL count → ping Google/Bing/Yandex → IndexNow. |
| **Secrets** | See `docs/GITHUB-SECRETS-CHECKLIST.md`. No secrets in code. |

---

## 5. Meta tags & AEO (per prompt)

| Item | Where |
|------|--------|
| **Meta titles** | index.html (homepage); each page sets document.title + meta in useEffect. Worker location HTML: `<title>${fullTitle}</title>`. |
| **Meta descriptions** | 155 chars on location pages (worker). Homepage in index.html. |
| **OG / Twitter** | index.html; worker location HTML; PillarLayout pages. |
| **FAQPage schema** | index.html (homepage); worker location HTML (every /l/ page, with DB faq_json or default 3 questions). |
| **BreadcrumbList** | Worker location HTML; PillarLayout + BreadcrumbSchema on client pages. |
| **Dataset schema** | UltimateIptvCatalog.tsx (93K catalog). |

---

## 6. Verify after deploy

- **Sitemap:** `https://streamstickpro.com/sitemap-pages.xml` → expect ~24K+ `<loc>` (static + location).
- **Location page (crawler):** `curl -A "Googlebot" https://streamstickpro.com/l/usa/iptv/houston` → full HTML with meta, FAQPage, BreadcrumbList.
- **Homepage:** `https://streamstickpro.com/` → 200, “36 HOUR FREE TRIAL” in content.
- **API:** `https://streamstickpro.com/api/catalog-summary` → JSON. `https://streamstickpro.com/api/health` → ok.

If 25K seed didn’t run (missing secrets), sitemap still has ~24K URLs from `location-pages.json` (build-time). Add `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (or ROLL_KEY) in GitHub Secrets and in Cloudflare Pages env so seed runs and worker can read Supabase.
