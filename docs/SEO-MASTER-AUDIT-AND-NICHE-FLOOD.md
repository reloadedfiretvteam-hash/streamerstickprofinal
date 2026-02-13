# SEO Master Audit & Niche Flood Strategy

Line-by-line audit framework and “flood every inch of the niche” playbook for IPTV, jailbroken Fire Sticks, Canada/US/UK, every device, every media player, and every search engine (Google, Bing, Yahoo, Yandex, AI search).

---

## 1. Niche Coverage Matrix

### 1.1 Geography
- **USA:** 50 states × cities → location pages `/l/usa/iptv/{city-state}`, `/l/usa/jailbreak/…`, etc. (seed: 40K+ rows).
- **Canada:** Provinces × cities → `/l/ca/iptv/…`, `/l/ca/jailbreak/…`.
- **UK:** Regions × cities → `/l/uk/iptv/…`, `/l/uk/jailbreak/…`.
- **Intent:** Every “IPTV [City]”, “Jailbroken Fire Stick [State]”, “IPTV Canada”, “IPTV UK”, “Fire Stick IPTV USA” should land on a pillar or location page.

### 1.2 Devices
- **Fire Stick:** `/jailbroken-fire-sticks`, `/firestick-devices`, `/best-iptv-firestick`, `/iptv-firestick`.
- **ONN Google TV:** `/onn-google-tv`.
- **Android TV / Google TV:** `/iptv-media-players`, `/onn-google-tv`.
- **Smart TV:** Covered under IPTV media players and services.
- Redirects map: `/firestick` → jailbroken, `/devices` → firestick-devices.

### 1.3 Media Players & Apps
- **TiviMate:** `/tivimate` (HowTo schema).
- **IPTV Smarters Pro:** `/iptv-smarters-pro` (HowTo schema).
- **Perfect Player, VLC, Kodi, Stremio:** Covered by `/iptv-media-players` and `/resources`; redirects from `/perfect-player`, `/vlc-iptv`, `/kodi-iptv`, `/stremio` → `/iptv-media-players` or `/resources`.

### 1.4 Topics
- **IPTV services:** `/iptv-services`, `/pricing`, `/shop`.
- **Jailbroken / unlocked Fire Stick:** `/jailbroken-fire-sticks`.
- **Free trial:** `/36hr-trial`, `/` (home).
- **Competitors:** `/vs-iptvstronger`, `/vs-troypoint`, `/vs-hypotv`, etc.
- **Catalog / AEO:** `/ultimate-iptv-catalog-2026`, `/tools/catalog`, `/api/catalog-summary`.

---

## 2. Meta at Scale (Titles & Descriptions)

### 2.1 Best practice
- **Title:** 50–60 characters (SERP truncation ~60).
- **Meta description:** 140–160 characters (snippet sweet spot).

### 2.2 Static pages
- Every pillar and key page must set `document.title` and `meta name="description"` (and og/twitter) in code; lengths checked in audit.
- Location pages: title and description come from DB or `location-pages.json` (t: title, d: description), truncated to 155–160 chars in worker and LocationPage.tsx.

### 2.3 “Thousands” of meta
- **Location pages:** 40K+ pages each have unique title/description from seed (location + page type + template).
- **Blog posts:** Each has its own title/description from CMS.
- **Pillar pages:** One title + one description per route; ensure each is 50–60 and 140–160.

---

## 3. Redirects

### 3.1 Static redirects (worker)
- Old paths, typos, and alternate keywords → canonical pillar (see `SEO_REDIRECTS_STATIC` in worker).
- Examples: `/guides` → `/iptv-services`, `/trial` → `/`, `/firestick` → `/jailbroken-fire-sticks`, `/iptv-apps` → `/iptv-media-players`, competitor slugs → `/vs-*`.

### 3.2 DB redirect_map
- Admin can add 301s via `redirect_map` (Supabase). Used for campaigns, renames, and one-off URLs.
- Worker applies DB redirects first, then static.

### 3.3 Coverage
- Every common search variant (IPTV Canada, IPTV UK, best IPTV Fire Stick, Perfect Player IPTV, VLC IPTV, jailbreak firestick, etc.) should either hit a dedicated page or redirect to the right pillar.

---

## 4. AEO (Answer Engine Optimization)

### 4.1 Schema
- **FAQPage:** Location pages (crawler HTML + client), pillar FAQs (SEOSchema).
- **HowTo:** TiviMate, IPTV Smarters Pro (step-by-step snippets).
- **Product:** Shop, MainStore.
- **BreadcrumbList:** Pillars and location.
- **Organization / WebSite:** index.html.
- **Article:** Blog posts (BlogPostSchema).
- **QAPage, VideoObject, Service, ItemList:** Available in SEOSchema for guides/tools.

### 4.2 Content
- Clear H1, H2s, short paragraphs.
- FAQ sections with natural-language Q&A.
- Numbered steps for setup guides (HowTo).
- `/api/catalog-summary` and `/ultimate-iptv-catalog-2026` for AI/citation.

---

## 5. Backlinks (Strategy Only – No Keys)

- **Linkable assets:** Blog guides, Tools Catalog, Ultimate IPTV Catalog, comparison pages (vs-*), location pages.
- **Tactics:** Guest posts, resource page links, tool/app mentions, local/country-specific roundups. Do not put secret keys or API keys in repo; use env/secrets only for any future backlink-tracking or API tools.

---

## 6. Search Engines & Indexing

- **Google:** Sitemap ping (sitemap-index.xml), GSC property, IndexNow not used by Google.
- **Bing / Yahoo:** Sitemap ping + IndexNow (Yahoo uses Bing).
- **Yandex:** Sitemap ping + IndexNow.
- **IndexNow:** All sitemap URLs submitted in 10K batches after deploy (script: `indexnow-from-live-sitemap.ts`). Key file: `59748a36d4494392a7d863abcf2d3b52.txt` at site root.

---

## 7. Audit Checklist (Line-by-Line)

- [ ] Every route in App.tsx has a canonical page or redirect.
- [ ] Every STATIC_SITEMAP_PAGES entry is correct and live.
- [ ] Every pillar page: title 50–60 chars, meta description 140–160 chars.
- [ ] Location page meta: truncated to 160; no empty or “[LOCATION]” only.
- [ ] All redirects (static + DB): no loops; target exists.
- [ ] robots.txt: Allow /, Sitemap(s); Disallow only admin, api, checkout success/cancel.
- [ ] Canonical and og:url set per page (CanonicalTag + page-level).
- [ ] Schema: FAQ/HowTo/Product/Breadcrumb where applicable; no invalid or empty fields.
- [ ] Sitemap: static + blog + location (DB or location-pages.json); IndexNow runs on live sitemap after deploy.

---

## 8. Campaign / Ads / Marketing Copy

- Use the same meta and messaging as the site: 50–60 char titles, 140–160 char descriptions.
- Ad copy and landing pages should align with pillar URLs (e.g. IPTV Canada → location or `/iptv-services`).
- No secret keys in repo; use environment variables and platform-specific secret stores (e.g. Cloudflare, GitHub Secrets, Supabase dashboard) for any API or tracking.

---

**Summary:** Flood the niche via (1) 40K+ location pages with unique meta, (2) pillar pages for every device and app, (3) 301 redirects for every keyword variant, (4) schema and AEO on key pages, (5) sitemap + IndexNow for all engines. Audit line-by-line using the checklist above; keep all secrets in env/Cloudflare/GitHub/Supabase only.
