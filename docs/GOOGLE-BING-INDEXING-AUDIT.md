# Why Nothing Shows on Google/Bing – Full Audit & Fixes

**Goal:** Find every point where deployment, Cloudflare, Supabase, or SEO can break indexing, then fix and verify.

---

## 1. What we know from your live site

- **robots.txt (live):** Fetched successfully. It shows:
  - Cloudflare Managed block (Content-Signal; various AI bots Disallow).
  - Your block: `Allow: /`, `Disallow: /api/, /admin`, etc.
  - **Only one Sitemap line** in the merged result: `Sitemap: https://streamstickpro.com/sitemap.xml`  
    (Your repo has two lines; the second `sitemap-index.xml` may be dropped in merge or deploy.)
  - **Crawl-delay** for Googlebot (1), Bingbot (2): Google ignores it; Bing may honor it and crawl slower.
- **sitemap-index.xml and homepage:** Fetch from this tool failed (network). You must verify locally:
  - Open https://streamstickpro.com/sitemap-index.xml
  - Open https://streamstickpro.com/sitemap.xml
  - Open https://streamstickpro.com/
  If any return 404, 500, or empty/minimal content, that’s a direct cause of “nothing showing.”

---

## 2. Full chain: from code to Google

```
GitHub (clean-main) → Actions workflow → Build → Deploy to Cloudflare Pages
                                                      ↓
Cloudflare Pages (streamerstickpro-live, branch clean-main)
  - Serves static from dist/ (including robots.txt from client/public)
  - Requests hit Worker when not in _routes.json exclude
  - Worker needs env from Cloudflare Pages → Settings → Environment variables (not from GitHub)
                                                      ↓
Worker: sitemap.xml, sitemap-index.xml, sitemap-pages.xml, /l/*, API, SPA fallback
  - Sitemap data: STATIC_SITEMAP_PAGES + Supabase (blog_posts, seo_architecture) + location-pages.json
  - If Supabase env missing in Cloudflare → Worker still returns 200 but with fewer URLs (static + location-pages only)
  - If location-pages.json missing (build OOM) → sitemap has only ~40 static URLs
                                                      ↓
Google/Bing: crawl robots.txt → discover Sitemap → fetch sitemap → crawl URLs
  - If sitemap 404/500 or has very few URLs → little or no indexing
  - If Cloudflare challenges bots (Bot Fight Mode, high Security) → crawlers may not get content
  - If pages 404/500 or no indexable content → “issues” in GSC/Bing
```

---

## 3. Where it can break (checklist)

| # | Where | What to check | If wrong |
|---|--------|----------------|----------|
| 1 | **GitHub** | Pushes go to **clean-main** (workflow only runs on clean-main). | Push to clean-main; other branches do not deploy. |
| 2 | **GitHub Secrets** | All required secrets set (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY or ROLE_KEY, STRIPE_*, RESEND_API_KEY, SESSION_SECRET; optional SUPABASE_DATABASE_URL, CLOUDFLARE_ZONE_ID). | Add missing in Settings → Secrets and variables → Actions. |
| 3 | **Workflow run** | After push, Actions tab shows “Deploy to Cloudflare Pages” green. | Fix failing step (migration, build, or deploy). |
| 4 | **Cloudflare Pages** | Project **streamerstickpro-live**, branch **clean-main**, last deployment **Success**. | Re-run workflow or fix build. |
| 5 | **Cloudflare env** | Pages → your project → Settings → **Environment variables (Production)**. Worker needs: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY (or ROLE_KEY/ROLL_KEY), STRIPE_*, RESEND_*, ADMIN_*, SESSION_SECRET. | Add every var the Worker uses; without Supabase, sitemap has no DB URLs. |
| 6 | **Cloudflare Security** | **Bot Fight Mode** = Off. **Security level** = Medium or Low (not “I’m Under Attack”). | Turn off Bot Fight; lower Security so Googlebot/Bingbot aren’t blocked or challenged. |
| 7 | **Cloudflare SSL** | SSL/TLS mode = Full or Full (strict). | So crawlers don’t hit certificate errors. |
| 8 | **Supabase** | Migrations run (workflow step “Run Database Migration”). Tables exist: seo_architecture, redirect_map, blog_posts, visitors, seo_ads (from 20260214). | Set SUPABASE_DATABASE_URL or DATABASE_URL in GitHub Secrets so migrations run. |
| 9 | **Build** | script/build-worker.ts runs; dist has _worker.js, _routes.json, location-pages.json (and optional blog prerender). | If 25K location script OOMs, location-pages.json may be missing → sitemap has fewer URLs. |
| 10 | **robots.txt** | Live file allows Googlebot/Bingbot and lists sitemap(s). No accidental Disallow: /. | Repo has two Sitemap lines; remove Crawl-delay so Bing doesn’t slow. |
| 11 | **Sitemaps** | Live /sitemap.xml and /sitemap-index.xml return 200 and contain many <loc> URLs. | If 0 or few URLs, fix Worker env and/or build (location-pages.json). |
| 12 | **GSC/Bing** | Property is streamstickpro.com (or https://streamstickpro.com). Sitemap submitted; no critical errors. | Resubmit sitemap; fix issues GSC/Bing report (canonical, coverage, etc.). |

---

## 4. Fixes applied in this audit (code)

1. **robots.txt** – Ensure both sitemaps are listed; remove Crawl-delay so Bing isn’t slowed (see below).
2. **Workflow** – Add a sitemap URL-count check after deploy so the job fails if sitemap has 0 URLs (catches deploy/config breaks).
3. **Docs** – This file + GSC/Bing “common issues” so you can match their messages to fixes.

---

## 5. GSC / Bing “issues” – what they often mean

| Message / report | Likely cause | What to do |
|------------------|--------------|------------|
| “Submitted URL not selected (canonical)” | Canonical points to another URL. | Ensure CanonicalTag and index.html canonical match the URL you want indexed; fix duplicate content. |
| “Crawled – currently not indexed” | Low priority or quality. | Improve content, internal links, sitemap; request indexing for key URLs. |
| “Discovered – currently not indexed” | In sitemap but not yet crawled. | Normal; ensure sitemap is submitted and URLs are valid 200. |
| “Sitemap could not be read” | Sitemap 404, 500, or invalid XML. | Fix Worker so /sitemap.xml and /sitemap-index.xml return 200 and valid XML. |
| “Duplicate without user-selected canonical” | Several URLs with same/similar content. | Pick one URL per topic; set canonical and noindex duplicates where needed. |
| “Page with redirect” | URL redirects (301/302). | Use 301 to the canonical URL; avoid redirect chains. |
| “Soft 404” | Page returns 200 but looks empty/error. | Return 404 for real missing pages; ensure real content and one H1. |
| “Mobile usability” | Mobile issues. | Fix viewport, tap targets, content width (your stack is responsive; check GSC details). |

---

## 6. After you deploy – verify (do this yourself)

1. **Deploy:** Push to **clean-main** and wait for the workflow to finish.
2. **Cloudflare:** Purge cache (Caching → Configuration → Purge Everything) or rely on workflow if CLOUDFLARE_ZONE_ID is set.
3. **robots.txt:** Open https://streamstickpro.com/robots.txt — confirm Allow: / and at least one Sitemap (ideally both).
4. **Sitemaps:**  
   - https://streamstickpro.com/sitemap-index.xml → 200, lists sitemap-pages, sitemap-posts, sitemap.  
   - https://streamstickpro.com/sitemap.xml → 200, many <loc> URLs (not 0).
5. **Homepage:** https://streamstickpro.com/ → 200, title and visible content (no blank or error).
6. **GSC:** Submit sitemap (Sitemaps → add sitemap-index.xml or sitemap.xml); run URL Inspection on the homepage.
7. **Bing:** Same in Bing Webmaster Tools – submit sitemap, check URLs.

---

## 7. Deploy the fixes (you do this)

1. **Commit** all changes (this audit doc, robots.txt, workflow, any other fixes in the repo).
2. **Push to clean-main:**  
   `git push origin clean-main`
3. **Wait** for the GitHub Action "Deploy to Cloudflare Pages" to finish (green check).
4. **Open the workflow run** and check the "Sitemap verification" step:  
   - If it says "sitemap.xml URLs: 0" or very low, the Worker has no Supabase data → set env in Cloudflare (see §3).
   - If URL count is in the hundreds/thousands, the chain is working.
5. **Cloudflare Dashboard (manual):**
   - **Security → Bots:** Bot Fight Mode = **Off**.
   - **Security → Settings:** Security level = **Medium** or **Low**.
   - **SSL/TLS:** Full or Full (strict).
   - **Caching:** Purge Everything once after deploy (or use CLOUDFLARE_ZONE_ID in GitHub so workflow purges).
   - **Workers & Pages → streamerstickpro-live:** Last deployment **Success**; **Environment variables** for Production include VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY (or ROLE_KEY), and the rest from GITHUB-SECRETS-CHECKLIST.
6. **GSC / Bing:** Submit sitemap (sitemap-index.xml or sitemap.xml); use URL Inspection on the homepage; fix any issues they report (see §5).

---

## 8. One-line summary

**Nothing showing** is usually: sitemap empty/wrong (Worker env or build), Cloudflare blocking/challenging bots, or sitemap not submitted. **Fix:** Set Cloudflare env, turn off Bot Fight Mode, lower Security, ensure deploy runs and sitemaps return many URLs, then resubmit sitemaps in GSC and Bing and verify with the steps above.
