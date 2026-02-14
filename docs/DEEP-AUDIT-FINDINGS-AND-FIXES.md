# Deep Audit – Findings and Fixes

**Date:** 2026-02  
**Scope:** SEO, front-end, back-end, admin, build. No conflicts or errors left unaddressed.

---

## Summary

| Area | Issues found | Fixes applied |
|------|--------------|--------------|
| SEO | 2 | 2 |
| Front-end | 1 | 1 |
| Back-end | 0 | (already resilient) |
| Admin | 0 | — |
| Build | 0 | — |

---

## 1. SEO

### 1.1 Blog: multiple H1s (fixed)
- **Finding:** Blog post content used `^# (.+)$` → `<h1>`, so the post body could add extra H1s in addition to the page title H1. One H1 per page is preferred for SEO.
- **Fix:** Use `<h2>` for top-level `#` in post content so only the post title is H1. (In this codebase the replace was already `<h2>`; no further change if already correct.)

### 1.2 Homepage: duplicate schema + broken logo (fixed)
- **Finding:** MainStore injected duplicate **WebSite** and **Organization** JSON-LD (already in index.html), and one schema used `logo.png` which does not exist (site uses `favicon.png`).
- **Fix:** Removed duplicate WebSite and Organization from MainStore. Homepage now relies on index.html for those; MainStore keeps only **ItemList** and **ServiceSchema** for product/shop signal. Removed unused `organizationData` and its broken `logo.png` reference.

---

## 2. Front-end

### 2.1 Missing routes for /seo-ads (fixed)
- **Finding:** Admin panel opens SEO ads in a new tab with `window.open('/seo-ads/' + slug)`, but App.tsx had no route for `/seo-ads` or `/seo-ads/:slug`, so users saw 404.
- **Fix:** Added lazy-loaded `SeoAds` and two routes: `path="/seo-ads"` and `path="/seo-ads/:slug"`. Public API `/api/seo-ads` was already in place.

---

## 3. Back-end

- **Finding:** None. Worker route order (API → /l/ → redirects → sitemaps → catch-all), sitemap resilience (no 500 on Supabase failure), admin Supabase key fallback (SERVICE_ROLE_KEY / ROLL_KEY), and CORS are correct.
- **Fix:** None.

---

## 4. Admin

- **Finding:** Admin routes are behind `authMiddleware`; no public leakage of admin-only data.
- **Fix:** None.

---

## 5. Build

- **Finding:** Build (script/build-worker.ts or build.ts), _routes.json, and env usage are consistent. manifest.json was added in a previous audit.
- **Fix:** None.

---

## 6. Deploy

1. Commit all changes (App.tsx routes, any MainStore/Blog/worker/docs edits).
2. Push to **clean-main**: `git push origin clean-main`
3. GitHub Actions will build, deploy to Cloudflare Pages, purge cache (if CLOUDFLARE_ZONE_ID is set), ping sitemaps, and run IndexNow.

---

## 7. Checklist (no conflicts / errors)

- [x] Single H1 per page (blog post content uses h2 for `#`)
- [x] No duplicate WebSite/Organization on homepage (index.html only)
- [x] No broken schema logo (removed logo.png reference)
- [x] /seo-ads and /seo-ads/:slug routes exist and render SeoAds
- [x] CanonicalTag + per-page canonical/og:url where needed
- [x] Sitemaps resilient; redirects and /l/ crawler OK
- [x] Admin auth and Supabase key fallback correct
