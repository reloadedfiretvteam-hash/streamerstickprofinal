# Supabase + Cloudflare – SEO & Deploy (clean-main)

Use this so **Supabase** and **Cloudflare** have the right information for SEO, indexing, and deploy. Push to **clean-main** only.

---

## 1. GitHub Secrets (required for build + deploy)

Add in **GitHub → repo → Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL (build + worker) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (build) |
| `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | Service role key (migrations, 25K seed, worker RPCs) |
| `SUPABASE_DATABASE_URL` or `DATABASE_URL` | Postgres connection URI (migrations) |
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout |
| `RESEND_API_KEY` | Email |
| `SESSION_SECRET` | Admin auth |

Optional: `CLOUDFLARE_ZONE_ID` for cache purge after deploy.

---

## 2. Cloudflare Pages (Worker runtime)

In **Cloudflare Dashboard → Workers & Pages → streamerstickpro-live → Settings → Environment variables (Production)** set:

- **VITE_SUPABASE_URL** – same as GitHub
- **SUPABASE_SERVICE_KEY** (or **SUPABASE_SERVICE_ROLE_KEY**) – same as GitHub (worker needs this for visitor tracking, SEO tables, blog)
- **STRIPE_***, **RESEND_***, **ADMIN_USERNAME**, **ADMIN_PASSWORD**, **SESSION_SECRET** – same as GitHub

So: **Supabase URL + service key** (and other secrets) are in **both** GitHub (build) and Cloudflare (request-time). SEO (sitemap, redirects, OG) and visitor tracking use these at runtime.

---

## 3. Supabase (SEO data)

- **Migrations:** Run automatically on deploy when `SUPABASE_DATABASE_URL` or `DATABASE_URL` is set. Includes visitor tracking (20260212) and SEO tables.
- **25K location pages:** Seed runs when `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (or role key) are set. Thousands of URLs go into sitemap + IndexNow.

---

## 4. IndexNow + Bing / Yahoo / Google

- **IndexNow:** Every deploy runs `scripts/indexnow-from-live-sitemap.ts`. It fetches the **live** sitemap and submits **all URLs** (thousands) to IndexNow (Bing, Yandex, Seznam).
- **Sitemap ping:** Workflow pings **Google**, **Bing** (Yahoo uses Bing), **Yandex** with sitemap-index.xml.
- **Bing Webmaster Tools:** Add property streamstickpro.com, verify (meta tag in index.html). Submit sitemap: https://streamstickpro.com/sitemap-index.xml.
- **IndexNow key file:** Must be live at https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt (in client/public/). Deploy serves it.

---

## 5. SEO best practice (titles and descriptions)

- **Title:** 50–60 characters. Primary keyword first. Brand at end.
- **Meta description:** 140–160 characters. Keyword, benefit, CTA.
- **Canonical:** Every page has canonical. og:url matches canonical.

---

## 6. Push to clean-main

```bash
git add -A
git status
git commit -m "SEO: nuclear push, IndexNow, meta best practice, Supabase/Cloudflare checklist"
git push origin clean-main
```

After push: workflow runs migrate, seed (if secrets set), build, deploy, ping Google/Bing/Yandex, IndexNow. In Bing Webmaster Tools confirm sitemap; in GSC request indexing for top URLs.

---

## 7. Checklist before deploy

- [ ] GitHub Secrets set (Supabase URL, keys, Cloudflare, Stripe, Resend, SESSION_SECRET).
- [ ] Cloudflare env set for Production (same Supabase URL + service key).
- [ ] IndexNow key file in client/public/59748a36d4494392a7d863abcf2d3b52.txt.
- [ ] robots.txt allows / and has Sitemap; sitemap-index.xml live after deploy.
- [ ] Titles 50–60 chars; meta descriptions 140–160 chars on key pages.
