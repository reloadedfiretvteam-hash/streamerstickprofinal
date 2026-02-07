# Full Build Audit – StreamStickPro

**Date:** 2026-02-07  
**Branch:** clean-main  
**Scope:** Frontend, backend (worker), configs, deploy, SEO, admin, email.

---

## 1. Build status

- **Local build:** `npx tsx script/build-worker.ts` — **PASSES** (client + worker + blog prerender + sitemap + robots).
- **Output:** `dist/` — `_worker.js`, `_routes.json`, `index.html`, `assets/*`, `blog/*`, `sitemap.xml`, `robots.txt`.
- **package-lock.json:** In sync with package.json (react 19.2.0, react-dom 19.2.0 in lock file).

---

## 2. Cloudflare Pages “npm ci” failure fix

If Cloudflare is building from Git (not receiving uploads from GitHub Actions), it runs **npm clean-install** by default. If you see:

`Missing: react@18.3.1 from lock file` or `package.json and package-lock.json are not in sync`:

**Option A – Use GitHub Actions only (recommended)**  
- In Cloudflare: Workers & Pages → streamerstickpro-live → **Settings → Builds & deployments**.  
- Set **Build configuration** to “Direct Upload” or disable “Build from Git” so that only **GitHub Actions** builds and deploys (wrangler `pages deploy dist`). Then the repo’s lock file is used in GitHub, not on Cloudflare.

**Option B – Keep “Build from Git” on Cloudflare**  
- In the same **Build configuration**, set **Install command** to:  
  `npm install --legacy-peer-deps`  
- Leave **Build command** as whatever produces `dist/` (e.g. `npx tsx script/build-worker.ts`).  
- Ensure **Root directory** (if any) matches your repo root.

**.npmrc** in repo is set to `legacy-peer-deps=true` so installs are consistent.

---

## 3. Frontend (client/)

| Item | Status |
|------|--------|
| **Entry** | `client/index.html` → `src/main.tsx` |
| **Routes** | App.tsx: /, /shop, /blog, /blog/:slug, /iptv-services, /iptv-firestick, /jailbroken-fire-sticks, /firestick-devices, /best-iptv-firestick, /checkout, /success, /terms, /privacy, /refund, /admin, /customer-login, /my-account, /forgot-password, /reset-password |
| **Pillar pages** | IptvServices, IptvFirestick, JailbrokenFireSticks, FirestickDevices, BestIptvFirestick (lazy-loaded) |
| **Layout** | PillarLayout (breadcrumbs, nav, CTA), MainStore (home), Shop, Blog |
| **SEO** | index.html: title/description 2026, canonical, OG/Twitter, Organization/WebSite/Store/FAQPage/LocalBusiness/AggregateOffer schema |
| **Nav** | MainStore + MobileNav link to pillar pages and shop/blog |
| **Footer** | MainStore: Guides column (pillar links), StreamStickPro branding, Quick Links, Support |

---

## 4. Backend (worker/)

| Item | Status |
|------|--------|
| **Runtime** | Hono on Cloudflare Workers, bound to Pages assets |
| **API** | /api/auth, /api/products, /api/checkout, /api/orders, /api/admin/*, /api/stripe (webhook), /api/track, /api/customer, /api/free-trial, /api/blog, /api/seo-ads, /api/email-campaigns, /api/ai-assistant, /cron/email-campaigns |
| **Admin** | authMiddleware on /api/admin/*; POST /api/admin/broadcast-email (website reminder to all customers + trials), GET /api/admin/broadcast-email/preview |
| **SEO redirects** | 301: /guides→/iptv-services, /guide→/iptv-services, /firestick→/iptv-firestick, /jailbreak→/jailbroken-fire-sticks, /devices→/firestick-devices |
| **Sitemap** | GET /sitemap.xml (dynamic) includes pillar URLs, blog, shop, terms, privacy, refund, free-trial |
| **Env** | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, STRIPE_*, RESEND_*, SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, STRIPE_WEBHOOK_SECRET (Cloudflare env) |

---

## 5. Config & deploy

| File | Purpose |
|------|--------|
| **wrangler.toml** | name=streamerstickpro-live, pages_build_output_dir=dist, [vars] for NODE_ENV, RESEND_FROM_EMAIL, VITE_SUPABASE_*, VITE_SECURE_HOSTS, VITE_STORAGE_BUCKET_NAME, SITE_URL |
| **.github/workflows/deploy-cloudflare.yml** | On push to clean-main: checkout → install → migrate (optional) → build (script/build-worker.ts with secrets) → Cloudflare pages deploy (dist) → warm sitemap + ping Bing/Google |
| **.npmrc** | production=false, legacy-peer-deps=true, engine-strict=false |

Secrets used in workflow: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, SESSION_SECRET. See **docs/SECRETS_CHECKLIST.md**.

---

## 6. Supabase

- **URL/keys** in wrangler.toml (vars) and passed in workflow for build.
- **Runtime** worker uses VITE_SUPABASE_URL + SUPABASE_SERVICE_KEY (or anon) for storage, blog, campaigns, visitors, admin.
- **Migrations** optional in workflow via scripts/run-supabase-migration.ts when DATABASE_URL is set.

---

## 7. SEO & content

- **Pillar URLs** in sitemap and robots.txt: /iptv-services, /iptv-firestick, /jailbroken-fire-sticks, /firestick-devices, /best-iptv-firestick.
- **Keywords** seo/keywords-streamstickpro-100.csv; architecture seo/docs/SEO_ARCHITECTURE.md; 30-day plan seo/docs/SEO_30_DAY_ACTION_PLAN.md.
- **Breadcrumbs** on pillar pages (PillarLayout + BreadcrumbSchema); FAQ schema on pillar pages.

---

## 8. Admin & email

- **Admin** at /admin; Settings includes Email Broadcast (preview count + send website reminder to all).
- **Broadcast** collects emails from customers, orders, email_campaigns; sends one reminder per address with 250ms delay; uses Resend.
- **Cron** /cron/email-campaigns for scheduled campaign emails (configure trigger in Cloudflare).

---

## 9. Checklist before “done”

- [x] Build passes locally (`npx tsx script/build-worker.ts`).
- [x] package-lock.json present and includes react/react-dom.
- [x] .npmrc has legacy-peer-deps=true.
- [ ] **You:** In Cloudflare, either use “Direct Upload” (GitHub Actions deploys) or set Install command to `npm install --legacy-peer-deps` if building from Git.
- [ ] **You:** GitHub Secrets set per docs/SECRETS_CHECKLIST.md.
- [ ] **You:** Cloudflare Pages env has STRIPE_WEBHOOK_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET.
- [ ] **You:** Push to clean-main and confirm deploy (GitHub Actions or Cloudflare build) succeeds.
- [ ] **You:** Submit sitemap in GSC and Bing (docs/DEPLOY_AND_UPDATE.md).

---

## 10. Summary

- **Frontend:** All routes and pillar pages wired; homepage 2026, footer guides, StreamStickPro branding.
- **Backend:** Worker and API routes consistent; broadcast email and SEO redirects in place.
- **Deploy:** Workflow and wrangler.toml aligned; Cloudflare “npm ci” issue fixable via Install command or Direct Upload.
- **Secrets/docs:** SECRETS_CHECKLIST.md and DEPLOY_AND_UPDATE.md cover GitHub and Cloudflare config.

Audit complete. After you set Cloudflare install command (or use Direct Upload) and push, the full build is in order and ready for production.
