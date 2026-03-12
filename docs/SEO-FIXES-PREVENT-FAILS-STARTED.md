# SEO Fixes – Prevent More "Failed" and "Started" in GSC

**Date:** 2026-03-11  
**Goal:** Reduce GSC "Failed" and "Started" (crawled but not indexed, 5xx, duplicate canonical, soft 404) by fixing similar issues across the site.

---

## 1. Worker

| Fix | Why |
|-----|-----|
| **/cancel noindex** | Stripe cancel_url lands users on /cancel. Added to PAGE_META and noindexPaths so Worker sends noindex; robots.txt already Disallow. Avoids indexing a thin/duplicate page. |
| **BreadcrumbList URL normalize** | buildBreadcrumbLD now strips trailing slash from pathname so crumb URLs match canonical (no trailing slash). Reduces "Duplicate, Google chose different canonical." |
| **/api/seo-page → 503 + Retry-After** | On catch, return 503 with `Retry-After: 60` instead of 500 so GSC treats as temporary and retries. Fewer "Server error (5xx)" over time. |
| **/l/ crawler handler → 503 on throw** | If getStorage or getSeoPageByPath throws, return 503 HTML with Retry-After instead of calling next() (which served SPA 200). Reduces 5xx for location pages. |
| **Location page OG image** | Added og:image:width, og:image:height, og:image:alt and twitter:image:alt to crawler-rendered /l/* HTML (same as index.html). Fewer enhancement issues. |
| **301 trailing slash redirect** | In catch-all handler, if pathname has trailing slash (except /), 301 redirect to same path without slash. One URL shape = fewer "Duplicate canonical" and cleaner indexing. |

---

## 2. Client

| Fix | Why |
|-----|-----|
| **LocationPage og:image dimensions + alt** | setMeta for og:image:width, og:image:height, og:image:alt and twitter:image:alt when JS runs (e.g. Googlebot). Aligns with index.html and Worker /l/ HTML. |
| **Blog post og:image dimensions + alt** | setMetaTag for og:image:width, og:image:height and twitter:image:alt on single post view. og:image:alt was already set. |

---

## What was not changed

- No Stripe/checkout/trial/webhook code.
- No layout or CSS.
- Sitemaps and robots.txt unchanged (already correct).

---

## After deploy

1. In GSC, recheck **Pages** over time: 5xx and duplicate canonical counts should improve as Google recrawls.
2. Use **URL Inspection** on key URLs and request indexing if needed.
3. Ensure Cloudflare Pages env (Production + Preview) has Stripe/Resend/Supabase so Worker and trial/checkout keep working.
