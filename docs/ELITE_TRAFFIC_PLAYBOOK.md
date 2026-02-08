# Elite Traffic Playbook — Get More People to Your Website Faster

**Goal:** Correct build, full deploy verification, and maximum legitimate discovery across search engines so your site gets indexed and surfaced faster.

## Implementation status (what’s done vs what you do)

| Item | Status | Who |
|------|--------|-----|
| Push to clean-main triggers deploy | **Done** | Code in repo + GitHub Actions |
| Worker sitemap, redirects, /api/seo-page | **Done** | In worker + _routes |
| IndexNow on every deploy (script + workflow step) | **Done** | scripts/indexnow-from-live-sitemap.ts + workflow |
| Sitemap ping to Google/Bing after deploy | **Done** | In workflow |
| IndexNow key file at /59748a36d4494392a7d863abcf2d3b52.txt | **Done** | client/public, deploys with site |
| Blog posts link to 2+ pillars + /shop (prerender) | **Done** | prerender-blog.ts “Related guides” + footer |
| Submit sitemap in Google Search Console | **You do once** | GSC → Add property → Sitemaps |
| Submit sitemap in Bing Webmaster | **You do once** | Bing Webmaster Tools |
| Request indexing for key URLs (optional) | **You do** | GSC URL Inspection |
| Unique title/description per page | **Done** for pillars + LocationPage | Blog from CMS; audit if needed |

So: the playbook is **not** “things we’re going to do” — the automatic and code parts above are **implemented**. The rest are one-time or ongoing actions you do in GSC/Bing.

---

## 1. Was Everything Deployed? (Verify)

**You deploy by pushing code to GitHub. Cloudflare and Supabase do NOT get "pushed to" manually — they react to your repo and config.**

| Where | What happens | How to verify |
|-------|----------------|----------------|
| **GitHub** | You push branch `clean-main`. All code (client, worker, redirects, internal links, SEO) lives here. | Go to repo → Branch `clean-main` → check latest commit. |
| **Cloudflare Pages** | On push to `clean-main`, GitHub Actions runs: build (npm install, build-worker.ts) → deploys `dist` to Cloudflare. Workers/redirects/sitemap are inside that build. | Cloudflare dashboard → Pages → streamerstickpro-live → Deployments. Latest deployment should be "Success". |
| **Supabase** | No deploy. It’s your database and storage. Migrations run in GitHub Actions (optional). Products, blog, orders, trials are in Supabase. | Supabase dashboard → Table Editor / Storage. No "deploy" step — just ensure env vars (in Cloudflare) point to the right Supabase project. |

**One-time checklist:**

1. Push to `clean-main`:  
   `git add -A && git commit -m "SEO: elite playbook, IndexNow on deploy, security headers" && git push origin clean-main`
2. Wait for GitHub Actions to finish (Actions tab → last workflow run).
3. In Cloudflare Pages, confirm latest deployment is successful.
4. Open https://streamstickpro.com — confirm site loads.
5. Open https://streamstickpro.com/sitemap.xml — confirm it lists home, pillars, blog, etc.
6. Test one redirect: https://streamstickpro.com/guides → should 301 to https://streamstickpro.com/iptv-services.

If all above pass, **your workers, redirects, internal links, and build are deployed and working together.**

---

## 2. Correct Architecture (What You Have)

- **Single deployment branch:** `clean-main` → one source of truth.
- **Build:** `script/build-worker.ts` builds client + worker; worker serves API, sitemap, redirects, and static assets.
- **Redirects:** In worker (e.g. `/guides` → `/iptv-services`, `/firestick` → `/iptv-firestick`, etc.). No Supabase or GitHub config for redirects — they’re in code.
- **Internal links:** Home and footer link to all pillars; pillars cross-link; blog posts should link to pillars and /shop. No separate "link database" — links are in your pages.
- **Sitemap:** Worker-generated at `/sitemap.xml` (static pages + pillars + blog slugs from DB). Google/Bing discover URLs from this.
- **IndexNow:** After every deploy, GitHub Actions runs `indexnow-from-live-sitemap.ts`, which fetches the **live** sitemap and submits every URL to IndexNow so Bing, Yandex, etc. get notified immediately.

This is the correct, elite-ready architecture. No structural change needed — only execution and scaling of what you have.

---

## 3. Flood Search Engines (Legitimate, Elite Approach)

You can’t "hack" rankings, but you can make sure every important URL is **submitted and discoverable** as fast as possible.

### 3.1 Automatic (Already Done or Triggered by Deploy)

| Action | When | What it does |
|--------|------|----------------|
| **Sitemap ping** | Every deploy | Workflow pings Google and Bing with your sitemap URL so they re-crawl it. |
| **IndexNow batch** | Every deploy | New step runs `indexnow-from-live-sitemap.ts`, fetches live sitemap, submits **all** URLs (home, pillars, blog, terms, etc.) to IndexNow. Bing/Yandex/Seznam get notified within hours. |
| **Worker sitemap** | Every request to /sitemap.xml | Returns current list of URLs (including latest blog posts from Supabase). So "all your links" are in one place for engines. |

So: **every time you push to `clean-main`, your full site is re-submitted to search engines.** That’s the "flood" — not spam, but maximum legitimate discovery.

### 3.2 Manual (One-Time or When You Add New Sections)

- **Google Search Console:** Add property for `https://streamstickpro.com`, submit sitemap `https://streamstickpro.com/sitemap.xml`. Use "URL Inspection" for critical pages (home, /shop, each pillar) and request indexing.
- **Bing Webmaster:** Add site, submit same sitemap. Optional: use their URL Submission API if you have keys (see `scripts/submit-to-search-engines.ts`).
- **IndexNow key file:** Must be live at `https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt` with content `59748a36d4494392a7d863abcf2d3b52`. It’s in `client/public/` so it deploys with the site. Verify that URL in the browser.

### 3.3 Tags, Descriptions, Links (What You Need to Do)

- **Titles and meta descriptions:** Every page (home, pillars, blog posts) should have a **unique** title (50–60 chars, keyword + brand) and description (150–160 chars). Your index.html and MainStore set the home page; pillar pages set their own in `useEffect`; blog posts should set them from CMS/data. No "3,400" magic number — just ensure **no duplicate title/description** across important URLs.
- **Internal links:** Every blog post should link to at least 2 pillar pages and to /shop or /free-trial where relevant. Home and footer already link to all pillars. Pillars cross-link. This helps crawlers and rankings.
- **Schema (JSON-LD):** Home has Organization, WebSite, Store, FAQPage, Product. Pillars use BreadcrumbList and FAQ where applicable. Keep this; add Product/Offer schema on /shop if you want rich results for products.

So: **to make the build "more elite" for search engines:**  
(1) Deploy from `clean-main` so IndexNow + sitemap ping run every time.  
(2) Ensure every important page has unique title/description and that blog posts link to pillars and shop.  
(3) Verify GSC and Bing have your sitemap and optionally request indexing for key URLs.

---

## 4. Summary: What You Need to Do

1. **Deploy:** Push to `clean-main`. Confirm GitHub Actions and Cloudflare deploy succeed. No separate "deploy to Supabase" — it’s your backend already.
2. **Verify:** Open site, sitemap, and one redirect. Confirm IndexNow key file is live.
3. **Search consoles:** Submit sitemap in GSC and Bing once; request indexing for home, /shop, and pillar URLs if you want them indexed faster.
4. **Content:** Keep titles/descriptions unique; add internal links from blog to pillars and /shop. After that, every push to `clean-main` will re-submit your full sitemap to IndexNow and ping Google/Bing — that’s the elite, correct way to "flood" search engines with your real pages.

Your workers, redirects, internal links, and architecture are correct. The new deploy step (IndexNow from live sitemap) makes every deploy push all your URLs to Bing/Yandex immediately. Use the checklist above and the playbook for ongoing traffic growth.
