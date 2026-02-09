# Elite Domination Playbook — Pages, Tags, Campaigns, Links & Tactics

**Goal:** Every procedure and tactic researched across the web, applied so the site operates at elite level.  
**Channel count:** **18,000** live TV channels site-wide (canonical).

---

## 1. Meta & tags (every page)

| Tactic | Status | Where |
|--------|--------|--------|
| Unique title per page (50–60 chars, primary keyword \| brand) | ✅ | index.html; MainStore + pillar pages set document.title |
| Unique meta description (150–160 chars, CTA, keyword) | ✅ | index.html; MainStore + pillar pages set meta |
| og:title, og:description, og:image, og:url, og:type | ✅ | index.html; pillar pages set in useEffect |
| twitter:card, twitter:title, twitter:description, twitter:image | ✅ | index.html; pillar pages |
| meta keywords (focus + long-tail) | ✅ | index.html includes: best IPTV, jailbroken Fire Sticks, preloaded fire stick, downloader code, ONN Google TV, Onn 4K, IPTV media player |
| canonical URL | ✅ | index.html; LocationPage and others set per-route |
| hreflang (en-US, en-CA, en-GB, x-default) | ✅ | index.html |
| robots (index, follow; max-snippet, max-image-preview) | ✅ | index.html |
| theme-color, author, language | ✅ | index.html |

---

## 2. Schema (rich results & AEO)

| Schema type | Status | Where |
|-------------|--------|--------|
| Organization | ✅ | index.html |
| WebSite + SearchAction | ✅ | index.html |
| Store + OfferCatalog | ✅ | index.html |
| FAQPage | ✅ | index.html (6 Qs); SEOSchema on pillar/location pages |
| LocalBusiness | ✅ | index.html |
| Product (AggregateOffer) | ✅ | index.html |
| Product (AggregateRating) | ✅ | index.html |
| WebPage | ✅ | index.html |
| BreadcrumbList | ✅ | PillarLayout BreadcrumbSchema on every pillar + Trial, Pricing, VsCompetitor, etc. |
| ItemList (products) | ✅ | MainStore ItemListSchema |
| QASchema (answer engines) | ✅ | MainStore QASchema |
| ServiceSchema | ✅ | MainStore ServiceSchema |
| HowToSchema | ✅ | SEOSchema.tsx (available for setup guides) |

**Optional:** Add HowTo on /jailbroken-fire-sticks or /onn-google-tv for “how to set up” steps if you want HowTo rich results.

---

## 3. Pages & structure

| Page type | Status | Notes |
|-----------|--------|--------|
| Homepage | ✅ | MainStore; Shop section after Hero; one H1, one canonical title/description (18K+) |
| Pillar: IPTV Services | ✅ | IptvServices.tsx |
| Pillar: Jailbroken Fire Sticks | ✅ | JailbrokenFireSticks.tsx |
| Pillar: Onn Google TV | ✅ | OnnGoogleTv.tsx |
| Pillar: TiviMate | ✅ | Tivimate.tsx |
| Pillar: IPTV Smarters Pro | ✅ | IptvSmartersPro.tsx |
| Pillar: Fire Stick Devices | ✅ | FirestickDevices.tsx |
| Pillar: IPTV Firestick | ✅ | IptvFirestick.tsx |
| Pillar: Best IPTV Firestick | ✅ | BestIptvFirestick.tsx |
| Pillar: IPTV Media Players | ✅ | IptvMediaPlayers.tsx |
| Pricing | ✅ | Pricing.tsx |
| 36hr Trial | ✅ | Trial36hr.tsx |
| Vs Competitor (IPTVStronger, TroyPoint) | ✅ | VsCompetitor.tsx |
| Resources (backlink hub) | ✅ | Resources.tsx |
| Tools/Catalog (93K API, backlink magnet) | ✅ | ToolsCatalog.tsx |
| Ultimate IPTV Catalog | ✅ | UltimateIptvCatalog.tsx |
| Blog (index + posts) | ✅ | Blog.tsx; prerender; unique meta per post |
| Location pages (25K+ URLs) | ✅ | LocationPage.tsx; worker; unique h1/meta per URL |
| 404 | ✅ | not-found.tsx; title + meta |

---

## 4. Internal linking

| Tactic | Status | Where |
|--------|--------|--------|
| Nav to pillars + Shop + Blog | ✅ | MainStore nav; PillarLayout nav |
| Homepage → trial, jailbroken, ONN, catalog, #shop, pricing | ✅ | Hero + static shell |
| Niche hub (IPTV, Firestick, Devices, Jailbroken, etc.) | ✅ | MainStore section |
| Pillar → other pillars + Shop + trial | ✅ | PillarLayout; in-content Links in JailbrokenFireSticks, etc. |
| Blog → pillars + Shop + trial | ⚠️ | Add in post template/footer where relevant |
| Location pages → related guides + Shop | ✅ | LocationPage related links |
| No dead-end pages | ✅ | Every page has nav and/or links to key actions |

---

## 5. Discovery & indexing

| Tactic | Status | Where |
|--------|--------|--------|
| sitemap.xml (all URLs, lastmod) | ✅ | Build generates; worker/sitemap |
| Sitemap ping (Google, Bing, Yandex) | ✅ | deploy-cloudflare.yml |
| IndexNow (Bing, Yandex, Seznam) | ✅ | scripts/indexnow-from-live-sitemap.ts; workflow step |
| IndexNow key file | ✅ | client/public/59748a36d4494392a7d863abcf2d3b52.txt |
| robots.txt (allow, sitemap URL) | ✅ | Build/worker |
| GSC verification | ✅ | index.html |
| Bing verification | ✅ | index.html |

---

## 6. E-E-A-T & trust

| Tactic | Status | Where |
|--------|--------|--------|
| AggregateRating in schema | ✅ | index.html (adjust count if needed for defensibility) |
| Trust copy (247K users, 99.9% uptime, McAfee) | ✅ | Homepage hero + trust line |
| Contact (support email) | ✅ | Organization/LocalBusiness schema; SupportMessageBox |
| Clear product/plan descriptions | ✅ | MainStore; pillar pages |
| No fake or placeholder stats in visible copy | ✅ | Use 18,000 consistently |

---

## 7. AEO & answer engines

| Tactic | Status | Where |
|--------|--------|--------|
| FAQ schema on homepage + pillars + location | ✅ | index.html; SEOSchema with faq prop |
| Q&A schema (question/answer) | ✅ | MainStore QASchema |
| Direct answer in first 40–60 words (P1) | ✅ | Location pages p1_snippet; pillar descriptions |
| Question-style headings where useful | ✅ | Pillar content (e.g. “What Are Jailbroken Fire Sticks?”) |
| Submit to IndexNow on deploy | ✅ | Workflow |

---

## 8. Technical & crawl

| Tactic | Status | Where |
|--------|--------|--------|
| Single H1 per page | ✅ | Homepage (React H1); pillars (PillarLayout title) |
| Semantic structure (main, nav, article) | ✅ | MainStore; PillarLayout |
| Skip link (accessibility + crawl) | ✅ | index.html #skip-link → #main-content |
| Preconnect/preload critical origins | ✅ | index.html (Supabase, fonts) |
| Core Web Vitals (LCP, CLS, INP) | ✅ | Optimize images, avoid layout shift; preload hero |

---

## 9. Campaigns & tracking (optional)

| Tactic | Status | Where |
|--------|--------|--------|
| Google Ads / gtag | ⚠️ | Add if running paid; use env for ID |
| Meta Pixel | ⚠️ | Add if running Meta ads; use env for ID |
| UTM on outbound/campaign links | Manual | Use when you run campaigns |
| Conversion events (trial signup, add to cart, purchase) | ⚠️ | Wire to gtag/Meta if IDs present |

*(Campaigns and tags are environment-dependent; once IDs are in env, events can be wired in RetargetingPixels or equivalent.)*

---

## 10. Checklist — quick audit

- [x] **18,000** live channels everywhere (no 28K left).
- [x] Homepage title/description aligned (index + MainStore both 18K+).
- [x] Keywords include downloader code, ONN Google TV, preloaded fire stick, IPTV media player.
- [x] BreadcrumbList on all pillar/key pages.
- [x] FAQ + Q&A schema on homepage and pillars.
- [x] Sitemap + robots + IndexNow + pings on deploy.
- [ ] (Optional) HowTo schema on one setup guide.
- [ ] (Optional) Blog post template: add “Shop” / “36hr trial” links in footer or CTA block.
- [ ] (Optional) Google/Meta tags when you run paid campaigns.

---

## 11. Where to find things in code

| What | File(s) |
|------|--------|
| Homepage meta/title | client/index.html; client/src/pages/MainStore.tsx (useEffect) |
| Global schema | client/index.html (JSON-LD scripts) |
| Pillar meta + BreadcrumbSchema | client/src/pages/*.tsx (e.g. JailbrokenFireSticks, IptvServices); client/src/components/PillarLayout.tsx |
| FAQ / Q&A / Service / ItemList schema | client/src/pages/MainStore.tsx; client/src/components/SEOSchema.tsx |
| Sitemap generation | script/build.ts; worker; scripts/generate-location-pages-json.ts |
| IndexNow | scripts/indexnow-from-live-sitemap.ts; .github/workflows/deploy-cloudflare.yml; client/src/lib/indexnow.ts |
| Location page meta | client/src/pages/LocationPage.tsx; worker + Supabase data |
| Blog meta | client/src/pages/Blog.tsx (per-post in useEffect) |

---

*This playbook reflects tactics from Google/Bing docs, schema-first SEO, internal linking best practices, AEO checklists, and your existing implementation. Keep 18,000 as the single channel number and use this as the master checklist for an elite-level site.*
