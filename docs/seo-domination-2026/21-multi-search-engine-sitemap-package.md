# Deliverable 21: Multi-Search Engine Sitemap Package

## Sitemap URLs

- **Primary:** https://streamstickpro.com/sitemap.xml (dynamic, Worker)
- **Index:** https://streamstickpro.com/sitemap-index.xml

## Submission

### Google

- Google Search Console → Sitemaps → Add sitemap: `https://streamstickpro.com/sitemap.xml` (or sitemap-index.xml if you split later).

### Bing

- Bing Webmaster Tools → Sitemaps → Submit: `https://streamstickpro.com/sitemap.xml`
- Prefer ISO 8601 lastmod; Bing may ignore changefreq/priority.

### Yandex

- Yandex Webmaster → Indexing → Sitemap files → Add: `https://streamstickpro.com/sitemap.xml`
- Refresh limited (e.g. 10 per host per 30 days).

### IndexNow

- **Endpoints:** https://api.indexnow.org/indexnow (shared), https://www.bing.com/indexnow, https://yandex.com/indexnow
- **Script:** `scripts/indexnow-from-live-sitemap.ts` (run after deploy).
- **Key file:** Root of site (e.g. `*.txt` from Bing IndexNow tool).
- **Limit:** Up to 10K URLs per submission; batch if needed.

## Scripts in repo

- **submit-to-search-engines.ts** (if present): ping Google/Bing with sitemap URL.
- **indexnow-from-live-sitemap.ts:** Fetch live sitemap, submit URLs to IndexNow.
- **Deploy workflow:** Runs IndexNow after deploy (see 22-deployment-checklist.md).

## robots.txt

- Already lists: `Sitemap: https://streamstickpro.com/sitemap.xml` and `Sitemap: https://streamstickpro.com/sitemap-index.xml`

## Hreflang (Phase 14 – multi-region)

- **Targets:** en-US (USA), en-CA (Canada), en-GB (UK).
- **Implementation:** Add `<link rel="alternate" hreflang="en-us" href="https://streamstickpro.com/..." />` (and en-ca, en-gb) on each page; include a self-referencing hreflang. Same alternates must appear on all three variants.
- **Location pages:** Optional: serve different hreflang by country (e.g. /l/usa/... → en-us, /l/ca/... → en-ca, /l/uk/... → en-gb). Start with single-language; add hreflang when you have distinct regional URLs or content.
