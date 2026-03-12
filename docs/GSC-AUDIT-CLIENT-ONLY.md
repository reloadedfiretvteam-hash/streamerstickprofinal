# GSC Audit – Client-Only SEO (No Layout / No Worker Changes)

Your site stays as-is. Only these **client** files were changed for SEO so you get fewer **Failed** / **Started then fail** on thousands of URLs and blogs.

---

## What was changed (client only)

| File | Change |
|------|--------|
| **client/index.html** | Added `og:image:width`, `og:image:height`, `og:image:alt` and `twitter:image:alt` (fewer enhancement issues). Added **BreadcrumbList** JSON-LD (Home). In **WebPage** schema: added `primaryImageOfPage`, set `dateModified` to 2026-03-11. No layout, no scripts, no CSS. |
| **client/public/robots.txt** | Added second sitemap line: `Sitemap: https://streamstickpro.com/sitemap.xml` next to sitemap-index.xml so GSC and crawlers see both. |

**Not changed:** workflow, worker, any other client code (no MainStore, no CSS, no components).

---

## Your GSC audit log – what to do in the console

Use this with the statuses you sent (Page with redirect, 5xx, Alternate canonical, Soft 404, noindex, Duplicate canonical, Crawled not indexed).

| Status | What to do in GSC (no code) |
|--------|-----------------------------|
| **Page with redirect** | Open the report, note the URL. If it’s a chain (A→B→C), fix your redirect so the source goes **301** straight to the final URL. |
| **Server error (5xx)** | Sample a few URLs. If they’re location/blog URLs, they may need worker/env fixes (we didn’t touch worker). For client-only, ensure sitemaps and homepage return 200. |
| **Alternate page with canonical** | Usually OK (canonical points to the main URL). No action unless you want one of those 111 to be the canonical. |
| **Soft 404** | If the URL is real content, add an H1 and content. If it’s missing, the server should return 404 (worker; we didn’t change it). |
| **Excluded by noindex** | Expected for checkout, success, admin, etc. No change unless you want one of those indexed. |
| **Duplicate, Google chose different canonical** | In the report, check if it’s trailing slash or query params. Use **one** canonical URL everywhere (e.g. no trailing slash). Internal links and sitemap should use that same URL. |
| **Crawled – currently not indexed** | For important pages (homepage, key blogs, money URLs): use **URL Inspection** → **Request indexing**. Add internal links to important URLs. |

---

## After you deploy

1. In GSC → **Sitemaps**: confirm **sitemap-index.xml** and **sitemap.xml** submitted and no errors.
2. **URL Inspection** on `https://streamstickpro.com/` → check coverage and request indexing if needed.
3. Over time, recheck **Pages** for Failed/Started; use the table above for each status.

Your layout and site behavior stay the same; only the above SEO updates are in place so you can fix the audit items and avoid more fails on your thousands of URLs and blogs.
