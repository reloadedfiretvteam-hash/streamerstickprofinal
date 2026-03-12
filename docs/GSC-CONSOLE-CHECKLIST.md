# Google Search Console – Passed / Failed Checklist

Use this to match what you see in GSC (passed vs failed) to what’s in the system and what to do. Everything below is addressed in code or in deploy so GSC stays healthy.

---

## 1. Page indexing

| GSC report | Status in code | What to do if it fails |
|-----------|----------------|-------------------------|
| **Submitted and indexed** | Sitemaps: `sitemap-index.xml`, `sitemap.xml` in robots.txt; workflow pings Google with all sitemaps after deploy. Canonical on homepage and Worker location pages. | Resubmit sitemap in GSC (Sitemaps → add `https://streamstickpro.com/sitemap-index.xml`). Use URL Inspection on key URLs and “Request indexing.” |
| **Crawled – currently not indexed** | Normal for low-priority URLs. We have strong internal links from homepage and location “Related” links. | Improve internal links to that URL; request indexing for money pages (/, /36hr-trial, /shop, /jailbroken-fire-sticks). |
| **Discovered – currently not indexed** | URLs are in sitemap; Google hasn’t crawled yet. | Ensure sitemap is submitted and returns 200 with many `<loc>` URLs. |
| **Duplicate, user-declared canonical** | Canonical in index.html and Worker HTML; CanonicalTag on client pages. | Confirm canonical tag points to the URL you want indexed; fix duplicates. |
| **Soft 404** | Worker returns 404 for real missing routes; pages have one H1 and real content. | If a URL is a real 404, keep it. If it’s a valid page, add content and one clear H1. |

---

## 2. Sitemaps

| GSC report | Status in code | What to do if it fails |
|------------|----------------|-------------------------|
| **Sitemap submitted, no errors** | robots.txt lists both `sitemap-index.xml` and `sitemap.xml`. Workflow pings Google with sitemap-index, sitemap-pages, sitemap-posts, sitemap. | In GSC → Sitemaps, add `https://streamstickpro.com/sitemap-index.xml` if not already. |
| **Sitemap could not be read** | Worker serves /sitemap.xml, /sitemap-index.xml, /sitemap-pages.xml, /sitemap-posts.xml (200, valid XML). | Check live URLs: open sitemap-index.xml and sitemap.xml in browser; fix Worker or build if 404/500 or empty. |
| **URL count** | Workflow step “Verify sitemap and ping search engines” prints sitemap URL count; warns if &lt; 10. | If count is 0 or very low, set Cloudflare Pages env (Supabase, etc.) and ensure location-pages.json exists in build. |

---

## 3. Enhancements (FAQ, Q&A, Breadcrumbs, etc.)

| GSC report | Status in code | What to do if it fails |
|------------|----------------|-------------------------|
| **FAQ / Q&A – Valid** | Homepage: FAQPage JSON-LD in index.html with full answers. Worker location pages: `sanitizeFaq()` removes empty/N/A/Location/short answers. Client LocationPage and SEOSchema filter FAQ the same way. | If GSC shows “Invalid” or “Missing answer”: ensure no FAQ item has empty answer, “N/A”, “Location”, or answer &lt; 25 chars. Re-validate in GSC. |
| **Breadcrumbs** | Homepage: BreadcrumbList in index.html (Home). Other pages use breadcrumbs where implemented. | Add or fix BreadcrumbList JSON-LD for the failing URL. |
| **Product / Organization** | Homepage: Organization, WebSite, Store, Product, WebPage, FAQPage in index.html. | Fix or remove invalid schema; use Rich Results Test. |

---

## 4. Core Web Vitals (LCP, INP, CLS)

| GSC report | Status in code | What to do if it fails |
|------------|----------------|-------------------------|
| **Passed (Good)** | Viewport, preconnect/preload hero image, font display swap, responsive layout, tap targets 48px+ (cta-hero 56px/72px). | Keep monitoring. |
| **Needs improvement / Failed** | Same as above. | Check GSC URL for that page: reduce LCP (preload critical image, faster server), reduce CLS (image dimensions, no layout shift), improve INP (less main-thread work). |

---

## 5. Mobile usability

| GSC report | Status in code | What to do if it fails |
|------------|----------------|-------------------------|
| **Passed** | viewport meta, touch targets (min 48px; cta-hero/cta-primary 56px mobile, 72px desktop), readable font, content fits screen. | — |
| **Failed** | — | Fix viewport, tap target size, or content width for the reported URL. |

---

## 6. Security & manual actions

| GSC report | Status in code | What to do if it fails |
|------------|----------------|-------------------------|
| **No issues** | HTTPS, no known malware. | — |
| **Security issue** | — | Resolve in GSC and fix site/server. |
| **Manual action** | — | Follow GSC instructions and request review. |

---

## 7. System: Checkout & free trials

Not in GSC, but required for the site to work:

| Check | Status in code | What to do |
|-------|----------------|------------|
| **Worker has Stripe + Resend** | Sync script pushes secrets to Cloudflare Pages **production** and **preview**. Smoke test after deploy calls `/api/health` and fails the job if stripe/resend/supabase false. | Ensure GitHub Secrets include STRIPE_SECRET_KEY, RESEND_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY. Optionally add STRIPE_SECRET_KEY and RESEND_API_KEY in Cloudflare Dashboard (Pages → streamerstickpro-live → Settings → Variables and Secrets) for Production and Preview. |
| **Checkout works** | Worker route uses `c.env.STRIPE_SECRET_KEY`; sync provides it. | After deploy, open https://streamstickpro.com/api/health — expect `"stripe": true`, `"resend": true`, `"supabase": true`. If not, fix secrets and redeploy. |
| **Free trial works** | Worker trial route uses `c.env.RESEND_API_KEY`; sync provides it. | Same as above; test /36hr-trial form. |

---

## 8. Deploy (so everything is live)

1. **Commit** all changes (this doc, robots.txt, any other fixes).
2. **Push to clean-main:**  
   `git push origin clean-main`
3. **Wait** for the GitHub Action “Deploy to Cloudflare Pages” to finish.
4. **Check workflow run:**
   - **Sync secrets** step: must succeed (no missing env).
   - **Smoke test – verify Worker has Stripe, Resend, Supabase:** must pass. If it fails, add/fix secrets (GitHub + optional Cloudflare Dashboard), then push again or “Re-run all jobs.”
   - **Sitemap verification:** note sitemap URL count; if very low, fix Worker env/build.
5. **GSC:** Open Search Console → Sitemaps → confirm sitemap-index.xml (or sitemap.xml) submitted and no errors. Use URL Inspection on homepage and key pages; “Request indexing” if needed.
6. **Live check:**  
   - https://streamstickpro.com/api/health → stripe, resend, supabase true.  
   - https://streamstickpro.com/ → loads, H1 “IPTV Fire Stick 2026”.  
   - Test checkout and free trial once.

---

## One-line summary

**GSC passed/failed:** Use the tables above to match each report to what’s implemented and what to fix. **System:** Checkout and free trials work when the Worker has secrets (sync runs to both envs every deploy; optional Dashboard backup). **Deploy:** Push to clean-main; confirm sync + smoke test pass, then verify health and GSC.
