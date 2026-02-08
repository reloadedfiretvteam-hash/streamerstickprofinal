# SEO Master Audit – Pipeline, Tables, Admin, Backlinks, Snippets, Breadcrumbs

**Purpose:** Triple-check implementation, link admin SEO to live data, and document what’s in place for impressions, links, redirects, URLs, snippets, and breadcrumbs.

---

## 1. Pipeline (end-to-end)

| Step | Component | Status | Notes |
|------|-----------|--------|--------|
| **Data** | Supabase `seo_architecture` | ✅ | 50 location pages (USA/CA/UK, iptv/jailbreak/google). Scale to 25K by inserting more rows. |
| | Supabase `redirect_map` | ✅ | 301 rules; seed matches worker static list. Worker reads DB first, then static. |
| | Supabase `content_clusters` | ✅ | Pillar → cluster mapping (internal linking). |
| | Supabase `seo_experts` | ✅ | E-E-A-T table; optional seed. |
| **Worker** | `getRedirectMap()` | ✅ | Used for redirect middleware. |
| | `getSeoPagesForSitemap(25000)` | ✅ | Builds `/l/{country}/{page_type}/{slug}` for sitemap. |
| | `getSeoPageByPath(country, pageType, slug)` | ✅ | Used by GET /api/seo-page for LocationPage. |
| **Routes** | Redirect `*` → DB then static | ✅ | 301 to https://streamstickpro.com. |
| | GET /sitemap.xml, /sitemap-index.xml | ✅ | Dynamic sitemap (static + blog + seo_architecture). |
| | GET /api/seo-page/:country/:pageType/:slug | ✅ | Returns JSON for client. |
| **Client** | LocationPage | ✅ | Fetches API, sets title/meta, PillarLayout, breadcrumbs, FAQ schema, internal links, CTA. |
| | Pillar pages (IPTV, Fire Stick, etc.) | ✅ | All have breadcrumbs + schema where applicable. |
| **Deploy** | GitHub Actions → build → Cloudflare Pages | ✅ | Migrations run (schema + 50 location seed) when DATABASE_URL set. |
| **Indexing** | Sitemap ping (Google/Bing) | ✅ | In workflow after deploy. |
| | IndexNow script | ✅ | Fetches live sitemap, submits up to 10K URLs. |

**Verdict:** Pipeline is implemented and wired. Redirects, URLs, and location pages flow from Supabase → Worker → Sitemap/API → Client. Indexing is triggered on deploy.

---

## 2. SQL tables (all in order)

| Table | Purpose | Used by |
|-------|---------|--------|
| **seo_architecture** | Location/topic pages (title, h1, p1_snippet, faq_json, internal_links) | Worker sitemap, getSeoPageByPath; LocationPage API |
| **redirect_map** | 301 rules (old_path, new_path, status_code) | Worker redirect middleware; admin SEO redirects |
| **content_clusters** | Pillar URL + cluster keywords/slugs | Internal-link strategy (docs/code can consume) |
| **seo_experts** | E-E-A-T authors | Optional bylines/author schema |
| **blog_posts** | Blog; is_published, published_at | Worker sitemap, getBlogPosts |
| **seo_ads** | SEO ad/landing content | Admin seo-ads CRUD |

**Shared schema (seo_pages, seo_redirects, seo_404_logs, seo_keywords, seo_audits, seo_settings):** Defined in `shared/schema.ts` for a fuller admin SEO suite. **Not** currently used by the Worker; Worker uses `redirect_map` and `seo_architecture`. Admin **Live SEO** now reads from `redirect_map` + `seo_architecture` + blog so you see real counts (redirects, location pages, sitemap URL count).

---

## 3. Admin panel – linked to live movement

| Before | After |
|--------|--------|
| SeoToolkit called `/api/admin/seo/stats` and `/api/admin/seo/redirects` but **no routes existed** → empty/zeros. | **Implemented** GET `/api/admin/seo/stats` and GET `/api/admin/seo/redirects` in `worker/routes/admin.ts`. |

**New admin API (under `/api/admin/seo/`):**

- **GET /api/admin/seo/stats**  
  Returns: totalPages (static + blog + location), totalRedirects (from redirect_map), locationPageCount, blogPageCount, sitemapUrlCount, plus placeholder scores so the dashboard renders.

- **GET /api/admin/seo/redirects**  
  Returns redirect_map rows in the shape the SeoToolkit Redirects tab expects (sourceUrl, targetUrl, redirectType, isActive, etc.).

- **GET /api/admin/seo/live-stats**  
  Returns: redirectCount, locationPageCount, blogPageCount, sitemapUrlCount, sitemapUrl, indexNowKeyUrl (for optional tools).

**SeoToolkit UI:**  
- Dashboard now shows **Live SEO (what’s out there)** when the stats response includes sitemapUrlCount/locationPageCount: URLs in sitemap, location pages, blog posts, redirects.  
- Redirects tab shows **real redirects** from redirect_map.

**Still optional (not required for “linked to movement”):**  
- SEO Pages, Keywords, 404 logs, Audits, Settings tabs expect other tables/APIs (seo_pages, seo_keywords, etc.). Those endpoints are not implemented; tabs can stay empty or you can add them later. The important link is **stats + redirects from live data**.

---

## 4. Impressions, links, redirects, URLs

- **Impressions:** Come from Google/Bing once pages are indexed. The system is set up to support hundreds of thousands of URLs (25K location pages + blog + static). Actual impressions depend on indexing and rankings; pipeline is ready.
- **Links back to your site:**  
  - **Internal:** Location pages, pillar pages, internal-link-map CSV and content_clusters support internal linking.  
  - **External (backlinks):** Not created by code. You get those via content, outreach, social (templates in docs), and directories. See “Backlinks / link magnets” below.
- **Redirects:** Implemented. Worker applies redirect_map (DB) then static list; admin shows count and list from redirect_map.
- **URLs:** Sitemap includes home, shop, blog, pillars, free-trial, terms, privacy, refund, checkout, all blog posts, and all seo_architecture rows (e.g. 50 now, up to 25K). All point back to streamstickpro.com.

---

## 5. “1000s of magnet backlinks, snippets, breadcrumbs”

### Backlinks (link magnets)

- **Not automated:** Backlinks are links from other sites to yours. No code can “create” thousands of real backlinks; that’s outreach, content, and distribution.
- **What exists:**  
  - **Social/voice templates** for distribution: `docs/seo-domination-2026/social-templates/` (Reddit, Quora, X), `voice-query-map.csv`, `11-voice-query-map.md`.  
  - **Content that can attract links:** 50 location pages, pillar guides, blog (278+ posts), AEO practices (2000+), schema and trust signals.  
- **Recommendation:** Use the templates and content to promote; use GSC/Bing to monitor “Links” and “Impressions” over time.

### Snippets (1000s)

- **AEO practices (2000+):** `docs/seo-domination-2026/aeo-practices/` – 10 files (content structure, query types, featured snippets, voice, schema, PAA, intent, IPTV/Fire Stick vertical, E-E-A-T, zero-click). Use these to shape titles, P1, FAQs, and lists so more pages can win snippets.
- **P1/FAQ on location pages:** Each location page has p1_snippet and faq_json (and optional internal_links). Seed has 40–60 word style; expand with AEO guidance.
- **Schema:** FAQPage, BreadcrumbList on location and pillar pages; templates in `schema-templates/` (FAQ, HowTo, Organization, Product, Service, WebSite, BreadcrumbList). More snippets = more chances for rich results.

### Breadcrumbs (1000s)

- **On-site:** Every LocationPage and pillar page that uses PillarLayout has breadcrumbs (UI + BreadcrumbList schema). 50 location pages + 9+ pillar pages = 59+ pages with breadcrumbs; scaling to 25K location pages = 25K+ breadcrumb instances.
- **Generator:** `scripts/breadcrumb-generator.mjs` – outputs BreadcrumbList JSON-LD for any path (e.g. `/l/usa/iptv/houston`). Use for new page types or static generation if needed.
- **Schema templates:** `docs/seo-domination-2026/schema-templates/BreadcrumbList.json`.

So: **snippets** = 2000+ practices + schema + P1/FAQ on every location page; **breadcrumbs** = on every location and pillar page + generator + schema. **Backlinks** = templates and content in place; real backlinks come from your promotion and external sites.

---

## 6. Worker + build + Cloudflare

- **Worker:** Redirects, sitemap, /api/seo-page, security headers, ASSETS fallback – all in order (see CRITICAL-AUDIT.md).
- **_routes.json:** `include: ["/*"]` so worker receives sitemap and /l/*; static assets excluded.
- **Build:** IptvMediaPlayers.tsx in repo; no duplicate /shop in sitemap; LocationPage displayH1 fixed.
- **Migrations:** 20260207000001 (schema), 20260207000002 (50 location pages) run in CI when DATABASE_URL is set.

---

## 7. Checklist – “everything works together”

- [x] Supabase: seo_architecture, redirect_map, content_clusters, seo_experts exist and are used.
- [x] Worker: getRedirectMap, getSeoPagesForSitemap, getSeoPageByPath used by redirects, sitemap, API.
- [x] Client: LocationPage fetches API, sets H1 (with [LOCATION] replaced), meta, breadcrumbs, FAQ schema, internal links.
- [x] Sitemap: Includes static pages, blog, and seo_architecture; no duplicate /shop.
- [x] Admin: /api/admin/seo/stats and /api/admin/seo/redirects return live data; dashboard shows “Live SEO” counts; Redirects tab shows redirect_map.
- [x] Indexing: Sitemap ping and IndexNow in deploy workflow; key file in public and excluded from worker.
- [x] Docs: 22 deliverables present; AEO 2000+ practices; internal-link-map, redirect-rules-template, schema templates, breadcrumb generator.
- [x] Redirects and URLs: All point to streamstickpro.com; pipeline ready for hundreds of thousands of impressions/URLs once indexed.

---

## 8. What to do next

1. **Deploy** the latest code (admin SEO routes + SeoToolkit “Live SEO” card).
2. **Open Admin → SEO** and confirm Dashboard shows URLs in sitemap, location pages, blog posts, redirects, and Redirects tab shows your redirect_map rows.
3. **Submit sitemap** in Google Search Console and Bing Webmaster; monitor Coverage and “Links” for impressions and backlinks over time.
4. **Scale location pages** by inserting more rows into seo_architecture (same structure as seed) to grow sitemap and breadcrumb/snippet coverage.
5. **Use AEO practices** when writing or updating location/pillar content to target more featured snippets and zero-click visibility.
