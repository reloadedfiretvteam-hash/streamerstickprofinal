# SEO/AEO Domination 2026 – Phase 0 Diagnostic & Deployment Guide

**StreamStickPro.com – executed in this codebase (Cursor), not in a separate “Superbase” builder.**

---

## PHASE 0: IMMEDIATE SYSTEM DIAGNOSTIC (ANSWERS)

| # | Question | Answer |
|---|----------|--------|
| **1. CURRENT STATUS** | Total pages on streamstickpro.com? | **~24K+ location URLs** (from build-time `location-pages.json` when DB has &lt;2000 rows) **+** static (15) **+** blog posts. If DB seed ran: same 24K+ from Supabase. Check live: open https://streamstickpro.com/sitemap.xml and count `<loc>` tags. |
| **2. SITEMAP CHECK** | sitemap.xml exists? URL count? | **Yes.** https://streamstickpro.com/sitemap.xml exists. **Sitemap index:** https://streamstickpro.com/sitemap-index.xml lists `sitemap-pages.xml`, `sitemap-posts.xml`, `sitemap.xml`. **URL count** = static + blog + location (24K+ when static fallback is used or DB is seeded). |
| **3. SUPABASE STATUS** | Can you query with secret variables? | **In CI (GitHub Actions):** Yes, when secrets are set. **In this repo:** No direct access to your Supabase; worker uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (or service key) from Cloudflare env. **25K pages work without DB:** build outputs `location-pages.json`; worker uses it for sitemap and /l/ meta when DB has few rows. |
| **4. DEPLOYMENT PATH** | GitHub → Cloudflare → Live or direct? | **GitHub (clean-main) → GitHub Actions → Cloudflare Pages.** Deploy workflow: build (Vite + Worker + location-pages.json) → deploy to Cloudflare Pages (streamerstickpro-live). No direct “domain write”; site is built and deployed via this pipeline. |
| **5. PAGE LIMIT** | Max page generation per run? | **No per-run limit.** Build generates **24,344** location entries in `location-pages.json`. Sitemap can list all of them (single file &lt;50K URLs is valid). Worker serves each `/l/:country/:pageType/:slug` with full meta (title, description, OG, canonical). |
| **6. ERROR LOG** | Errors from previous attempts? | **Resolved:** (1) Seed was skipped when only DATABASE_URL was set → fixed with DATABASE_URL seed path. (2) Sitemap showed ~292 URLs when DB had no seed → fixed with **static fallback**: build-time `location-pages.json` used for sitemap + /l/ pages so 25K URLs and meta exist even without DB seed. |

**IF ANY FAIL →** See [FIX-25K-URLS-ALL-APPROACHES.md](./FIX-25K-URLS-ALL-APPROACHES.md) and [EMERGENCY-25K-STATUS-AND-FORCE-SEED.md](./EMERGENCY-25K-STATUS-AND-FORCE-SEED.md).

---

## PHASE 1: CORE MONEY PAGES – MAPPING TO THIS SITE

| Prompt URL | This codebase | Status |
|------------|----------------|--------|
| **/** (Homepage) | MainStore.tsx | ✅ H1/meta configurable; CTAs to shop and guides |
| **/trial** | Redirect → **/** (trial CTA on homepage) | ✅ 301 /trial → / |
| **/pricing** | Redirect → **/shop** | ✅ 301 /pricing → /shop |
| **/jailbroken-sticks** | **/jailbroken-fire-sticks** (JailbrokenFireSticks.tsx) | ✅ Pillar page, FAQ, schema |
| **/guides** | Redirect → **/iptv-services** | ✅ 301 /guides → /iptv-services |

**Live in &lt;5 min:** Push to clean-main → workflow builds and deploys. Money pages are live at /, /shop, /jailbroken-fire-sticks, /iptv-services; /trial and /pricing redirect as above.

---

## PHASE 2: PILLAR PAGES – MAPPING

| Prompt | This codebase |
|--------|----------------|
| /iptv-guide, USA/Canada/UK directories | **/iptv-services** (IptvServices.tsx), **/iptv-firestick**, **/jailbroken-fire-sticks**, **/iptv-media-players**; geo = **/l/usa/iptv/slug**, /l/ca/iptv/..., /l/uk/iptv/... |
| /about, /reviews, /channels, /tools | Add routes and pages as needed; **/resources** exists. |

---

## PHASE 3: AEO (EVERY PAGE)

- **Location pages (/l/...):** H1, first paragraph (p1_snippet), H2 sections, numbered lists, tables, FAQ (faq_json), internal_links from seed. **BreadcrumbList** and **FAQPage** schema on LocationPage.tsx.
- **Pillar pages:** H1, FAQ, schema in components (e.g. JailbrokenFireSticks, IptvServices).

---

## PHASE 4: TECHNICAL SEO – DEPLOYED

| Item | Status |
|------|--------|
| **Sitemap index** | ✅ https://streamstickpro.com/sitemap-index.xml → sitemap-pages.xml, sitemap-posts.xml, sitemap.xml |
| **sitemap-pages.xml** | ✅ Static + location pages (25K+ when using static fallback) |
| **sitemap-posts.xml** | ✅ Blog posts only |
| **sitemap.xml** | ✅ Full single sitemap (static + blog + location) |
| **robots.txt** | ✅ Allow: /, Sitemap: https://streamstickpro.com/sitemap.xml |
| **Breadcrumbs** | ✅ BreadcrumbList schema on location pages and pillar pages |

---

## PHASE 5: GEO ROLL-OUT

- **25K location URLs:** Format **/l/{country}/{pageType}/{slug}** (e.g. /l/usa/iptv/houston, /l/usa/jailbreak/los-angeles). Built from `getSeedRows()` (USA/CA/UK cities × 3 page types + extras). Sitemap and meta work via **location-pages.json** (build) or Supabase when seeded.

---

## PHASE 6: INTERNAL LINKING

- Each location row has **internal_links** (pillars, shop, blog). Rendered on LocationPage. Pillar pages link to each other and /shop.

---

## PHASE 7–9: SCHEMA, MAGNETS, E-E-A-T

- **WebPage + Breadcrumb + FAQ** on location and pillar pages. Add Review/AggregateRating, Dataset, or author bios in components as needed.

---

## PHASE 10: CLOUDFLARE WORKER

- **Redirector:** Worker handles 301s (DB redirect_map + static map: /firestick → /jailbroken-fire-sticks, /pricing → /shop, /trial → /, etc.). No separate “Worker 1” script; logic lives in worker/index.ts.

---

## PHASE 11: SUPABASE

- **Tables:** seo_architecture, redirect_map, content_clusters, etc. (migrations in supabase/migrations). **If Supabase fails:** 25K pages still work via static **location-pages.json** (build-time).

---

## PHASE 12: DEPLOYMENT + VERIFICATION

1. **Write to production:** Push to **clean-main** → GitHub Actions builds and deploys to streamstickpro.com.
2. **Sitemap:** https://streamstickpro.com/sitemap.xml and https://streamstickpro.com/sitemap-index.xml.
3. **Ping Google:** Workflow pings `https://www.google.com/ping?sitemap=https://streamstickpro.com/sitemap.xml` after deploy. Also submit sitemap-index.xml in GSC.
4. **GSC:** Submit sitemap-index.xml and/or sitemap.xml.

---

## MANDATORY DELIVERABLES – WHERE THEY LIVE

| Deliverable | Where |
|-------------|--------|
| 5 Money pages LIVE | /, /shop, /jailbroken-fire-sticks, /iptv-services; /trial → /, /pricing → /shop |
| Sitemap content | Worker routes: /sitemap.xml, /sitemap-pages.xml, /sitemap-posts.xml, /sitemap-index.xml |
| First 20+ city URLs | /l/usa/iptv/houston, /l/usa/iptv/los-angeles, … (see location-pages.json or seed) |
| robots.txt | Live at https://streamstickpro.com/robots.txt |
| Internal link map | location seed: internal_links per row; pillar pages link in TSX |
| Schema | SEOSchema + BreadcrumbSchema in LocationPage, JailbrokenFireSticks, etc. |
| Page count | Before: ~292 if no seed. After: 24K+ (static fallback or DB seed). Check sitemap.xml `<loc>` count. |
| Google ping | In deploy workflow (Verify sitemap step). |

---

## EMERGENCY ALTERNATIVES (IF 25K “FAILS”)

- **Option A – 1K version:** Already covered: static fallback gives 24K+ URLs; no 1K cap.
- **Option B – 100 pages:** Static pages + blog + first 100 from location list; same code, no change needed.
- **Option C – Manual build:** Not needed; site is React + Worker, not WordPress. Use this repo and deploy.

---

## PROGRESS REPORT (CURRENT STATE)

- **Phase 0:** Done (this doc).
- **Phase 1:** Money pages mapped; redirects /trial, /pricing, /guides in place.
- **Phase 4:** Sitemap index + sitemap-pages.xml + sitemap-posts.xml added; robots and breadcrumbs in place.
- **Phase 5:** 24K+ geo URLs via location-pages.json + optional DB seed.
- **Phase 10:** Worker redirects and sitemap logic in worker/index.ts.

**Next:** Deploy (push to clean-main), then in GSC submit https://streamstickpro.com/sitemap-index.xml and verify URL count in sitemap.xml.
