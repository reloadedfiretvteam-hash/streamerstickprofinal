# GSC Status Fixes – Passed / Failed / Started

Your reported statuses and what was fixed or how to handle them.

---

## Failed (must fix)

### Page with redirect — 1
**Meaning:** One URL is a redirect that GSC flags (e.g. non-301, or redirect chain).

**Done in code:**
- All static redirects use **301** (`SEO_REDIRECTS_STATIC` + `c.redirect(..., 301)`).
- DB `redirect_map` uses `status_code` (default 301).

**What you should do:**
1. In GSC → **Pages** → “Page with redirect” → open the report and note the **URL**.
2. Open that URL in a browser; follow redirects. If it goes A → B → C, that’s a **chain**. Edit **redirect_map** (Admin or DB) so the source URL redirects **directly** to the final target with **301**.
3. Remove any redirect whose **target** is itself a redirect (so every redirect goes to a final 200 URL).

---

## Started (in progress – we reduced impact)

### Server error (5xx) — 1,440
**Meaning:** URLs returned 500 or 503 when crawled.

**Done in code:**
- **Location pages (`/l/...`):**  
  - DB `getSeoPageByPath` is wrapped in try/catch; on failure we fall back to static `location-pages.json` only (no 500).  
  - If the whole handler throws, we return **503** with **Retry-After: 60** and a minimal HTML (noindex) so GSC treats it as temporary and retries.
- **`/api/seo-page`:** Returns **503** with **Retry-After: 60** instead of 500 when the service is temporarily unavailable.

**Result:** Fewer 500s; temporary failures become 503 so crawlers retry. After deploy, 5xx count should drop over time as Google recrawls.

**What you should do:** In GSC, open “Server error (5xx)” and sample a few URLs. If they’re `/l/...`, they should now get 200 (or 404 if missing, or 503 if overload). Fix any remaining 500s (e.g. other API routes) if needed.

---

### Alternate page with proper canonical tag — 111
**Meaning:** These pages have a canonical pointing to another URL; Google treats them as alternates. Usually **OK** if that’s what you want (e.g. pagination, duplicates).

**Done in code:** Every page sets `Link: <url>; rel="canonical"` and HTML `<link rel="canonical">`. No change needed unless you want some of these 111 to be the canonical URL themselves (then fix canonical on those pages).

---

### Soft 404 — 18
**Meaning:** URL returns 200 but looks like an error or empty page.

**Done in code:** For crawler requests to `/l/:country/:pageType/:slug`, if the page is not found we return **404** with HTML (noindex, “Page Not Found”), not 200.

**What you should do:** In GSC, open “Soft 404” and check the listed URLs. If any are valid content pages, add real content and one H1. If they’re truly missing, ensure the Worker returns 404 for them (we do for unknown `/l/` paths).

---

### Excluded by ‘noindex’ tag — 4
**Meaning:** Four URLs have `noindex` and are correctly excluded.

**Done in code:** We intentionally noindex: `/checkout`, `/success`, `/admin`, `/customer-login`, `/my-account`, `/forgot-password`, `/reset-password`, `/shadow-services`. So **4** is expected.

**What you should do:** Nothing unless one of those 4 should be indexed (then remove noindex for that path in Worker `PAGE_META` / `noindexPaths`).

---

### Duplicate, Google chose different canonical than user — 8,295
**Meaning:** We declared a canonical, but Google picked a different URL as canonical for the same content.

**Done in code:** We set canonical everywhere (HTTP `Link` header + HTML `<link rel="canonical">`). To strengthen the signal we keep one canonical per URL (no trailing slash inconsistency; we normalize in `applySecurityHeaders`).

**What you should do:**
1. In GSC, open the report and see which URL Google chose vs which we set. Often this is **trailing slash** (e.g. `/page` vs `/page/`) or **query params**. Ensure your internal links and sitemap use the **same** URL you set as canonical (e.g. no trailing slash).
2. In **Admin → SEO** (or DB), ensure `redirect_map` and canonicals don’t conflict (e.g. canonical should point to the final 200 URL, not a redirect).

---

### Crawled - currently not indexed — 244
**Meaning:** Google crawled the URL but didn’t add it to the index (priority/quality).

**Done in code:** Strong internal links from homepage and location “Related” sections; sitemaps submitted; good meta and content.

**What you should do:** Use **URL Inspection** for important money pages and click “Request indexing.” Add more internal links to the 244 URLs if they’re important.

---

## Passed (keep as is)

### Blocked by robots.txt — 1  
**Meaning:** One URL is correctly blocked. **No change needed.**

### Redirect error — 0  
**Meaning:** No redirect errors. **No change needed.**

### Duplicate without user-selected canonical — 0  
**Meaning:** No duplicate-without-canonical. **No change needed.**

---

## After deploy: checkout and free trial

1. Open **https://streamstickpro.com/api/health** → expect `stripe: true`, `resend: true`, `supabase: true`.
2. **Checkout:** Add a product to cart → go to checkout → complete (or use test card). Should redirect to success.
3. **Free trial:** Open **https://streamstickpro.com/36hr-trial** → submit the form with a real email. Check that the trial email arrives.

If any step fails, check GitHub Secrets and Cloudflare Pages env (Production + Preview) for `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, and Supabase vars; then redeploy.
