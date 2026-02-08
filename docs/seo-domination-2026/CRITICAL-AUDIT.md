# Full system audit – Build, schema, SSL, deploy

**Date:** 2026-02-08  
**Scope:** Entire build pipeline, Supabase schema/SEO system, Cloudflare Worker, client routes, and deployment.  
**Outcome:** 2 critical bugs fixed; rest of system verified.

---

## Critical issues found and fixed

### 1. **LocationPage: `displayH1` undefined (runtime crash)**

- **Where:** `client/src/pages/LocationPage.tsx` line 132.
- **Issue:** `PillarLayout title={displayH1}` used `displayH1` but it was never defined. Any location page (e.g. `/l/usa/iptv/houston`) would throw **ReferenceError: displayH1 is not defined** and break the page.
- **Fix:** Defined `displayH1` by replacing `[LOCATION]` in `page.h1` with `locationLabel`:
  - `const displayH1 = (page.h1 || "").replace(/\[LOCATION\]/g, locationLabel);`

### 2. **Worker sitemap: duplicate `/shop` URL**

- **Where:** `worker/index.ts` sitemap generation.
- **Issue:** `/shop` was included in `staticPages` and then added again in an “Add shop page” block, so the sitemap could list `/shop` twice (wastes crawl budget, can look sloppy to engines).
- **Fix:** Removed the duplicate “Add shop page” block; `/shop` remains only in `staticPages`.

---

## Build audit

| Item | Status | Notes |
|------|--------|--------|
| **build-worker.ts** | OK | Vite → `dist`, esbuild → `dist/_worker.js`, `_routes.json` → `dist`, then prerender. |
| **Vite config** | OK | `vite.config.cloudflare.ts`: root `client`, outDir overridden to `dist` by build script. |
| **_routes.json** | OK | `include: ["/*"]`, exclude only static assets; worker gets redirects, sitemap, `/l/*`, API, SPA fallback. |
| **Prerender** | OK | Writes `dist/blog/`, `dist/sitemap.xml`, `dist/robots.txt`; uses Supabase anon for blog_posts. |
| **Output layout** | OK | `dist/`: index.html, assets/, blog/, _worker.js, _routes.json, sitemap.xml, robots.txt. |
| **IndexNow key file** | OK | `client/public/59748a36d4494392a7d863abcf2d3b52.txt` copied to dist; excluded from worker so static file is served. |

**Potential improvement:** Vite config has `outDir: dist/public` but build script overrides to `dist`. No bug, but if someone runs Vite alone they get `dist/public`. Consider aligning or documenting.

---

## Schema / Supabase (SEO system) audit

| Item | Status | Notes |
|------|--------|--------|
| **seo_architecture** | OK | Columns: country, page_type, slug, title, meta_description, h1, p1_snippet, pillar_url, internal_links, faq_json, published. UNIQUE(page_type, country, slug). |
| **redirect_map** | OK | old_path, new_path, status_code; seed matches worker static map; RLS read for all. |
| **content_clusters** | OK | pillar_topic, pillar_url, cluster_keywords, cluster_page_slugs. |
| **seo_experts** | OK | E-E-A-T table; RLS read. |
| **getSeoPageByPath** | OK | .eq('country', country.toUpperCase()), .eq('page_type', pageType), .eq('slug', slug), .single(). |
| **getSeoPagesForSitemap** | OK | path = `/l/${country.toLowerCase()}/${page_type}/${slug}`; limit 25000. |
| **getRedirectMap** | OK | Returns { old_path, new_path, status_code }; catch returns []. |
| **Migration in CI** | OK | `run-supabase-migration.ts` runs 20260207000001 (schema) and 20260207000002 (50 location pages) when DATABASE_URL is set. |

**Seed data:** 50 rows USA/CA/UK, iptv/jailbreak/google; h1 uses `[LOCATION]` for client replacement; 18,000+ channels; no prices.

---

## Worker (Cloudflare) audit

| Item | Status | Notes |
|------|--------|--------|
| **Route order** | OK | API routes → redirect `*` (next) → /sitemap-index.xml → /sitemap.xml → catch-all ASSETS + index.html. |
| **Redirects** | OK | DB first, then SEO_REDIRECTS_STATIC; 301 to https://streamstickpro.com. |
| **GET /api/seo-page/:country/:pageType/:slug** | OK | getSeoPageByPath → JSON or 404. |
| **Sitemap** | OK | Static pages + blog (getBlogPosts) + seo_architecture (getSeoPagesForSitemap(25000)); no duplicate /shop after fix. |
| **Security headers** | OK | X-Content-Type-Options, X-Frame-Options, Referrer-Policy on all responses. |
| **CORS** | OK | streamstickpro.com, www, secure. |
| **ASSETS fallback** | OK | On fetch failure, serves /index.html for SPA. |

**Blog in sitemap:** Uses `getBlogPosts()` which returns `publishedAt` (mapped from `published_at`); worker uses `post.publishedAt` for lastmod. Consistent.

---

## Client audit

| Item | Status | Notes |
|------|--------|--------|
| **App routes** | OK | All pillar and location routes present; IptvMediaPlayers and LocationPage lazy-loaded. |
| **LocationPage** | **FIXED** | displayH1 now defined; fetch /api/seo-page; title/meta; PillarLayout; breadcrumbs; FAQ schema; internal links; CTA block. |
| **PillarLayout / SEOSchema** | OK | Used on LocationPage and pillar pages. |
| **CanonicalTag** | OK | Used in App. |

---

## SSL / security (high level)

- **HTTPS:** Cloudflare Pages + custom domain; SSL handled by Cloudflare (Full/strict typical).
- **Worker:** No secrets in client bundle; env (Stripe, Supabase, etc.) from Cloudflare bindings.
- **Headers:** Nosniff, X-Frame-Options, Referrer-Policy applied by worker.
- **Supabase:** RLS on seo_architecture (SELECT where published), redirect_map (SELECT), content_clusters, seo_experts.

---

## GitHub Actions deploy

| Step | Status | Notes |
|------|--------|--------|
| Trigger | OK | push to clean-main, workflow_dispatch. |
| Run Database Migration | OK | run-supabase-migration.ts (customers + SEO migrations if DATABASE_URL set). |
| Build | OK | npx tsx script/build-worker.ts with env from secrets. |
| Deploy | OK | wrangler pages deploy dist --project-name=streamerstickpro-live --branch=clean-main. |
| Warm sitemap + ping | OK | GET sitemap; ping Google/Bing sitemap. |
| IndexNow | OK | indexnow-from-live-sitemap.ts (up to 10K URLs). |

---

## What was done (summary)

1. **Build fix:** IptvMediaPlayers.tsx added to repo; _routes.json set to `include: ["/*"]` so worker handles all non-static paths.
2. **Supabase on deploy:** SEO migrations run from run-supabase-migration.ts when DATABASE_URL is set.
3. **Push:** Committed and pushed to clean-main to trigger deploy.
4. **Critical code fixes:** displayH1 defined in LocationPage; duplicate /shop removed from worker sitemap.

---

## When to expect “even better”

- **Deploy:** Same push that triggers the workflow; build and deploy usually finish within a few minutes.
- **Indexing (Google/Bing):** After deploy, sitemap is pinged and IndexNow runs. New/updated URLs typically start appearing in search within **days to a few weeks**; 50 location pages + pillars will index over time.
- **Traffic:** Depends on competition, backlinks, and content. The setup (sitemap, redirects, location pages, schema, internal links) is in place; GSC/Bing Webmaster will show impressions/clicks as pages are indexed and ranked.
- **Next step:** Submit sitemap in Google Search Console and Bing Webmaster if not already done; monitor Coverage and Sitemaps for errors.

---

## Checklist before next deploy

- [ ] Commit the two fixes (LocationPage displayH1, worker duplicate /shop) and push to clean-main.
- [ ] Ensure GitHub secret DATABASE_URL is set if you want SEO migrations to run in CI.
- [ ] After deploy, open https://streamstickpro.com/l/usa/iptv/houston and confirm H1 shows “Houston” (not “[LOCATION]”) and page doesn’t error.
- [ ] Open https://streamstickpro.com/sitemap.xml and confirm /shop appears once.
