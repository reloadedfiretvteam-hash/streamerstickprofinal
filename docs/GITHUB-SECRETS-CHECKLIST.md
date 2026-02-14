# GitHub Secrets Checklist – Deploy & 25K URLs (clean-main only)

**Use this after you rotate/revoke any keys.** Add these in **GitHub → repo → Settings → Secrets and variables → Actions**. No values go in this doc or in code.

## Deploy branch: clean-main only

- **Only the `clean-main` branch** triggers the deploy workflow. Push to **clean-main** to build, run migrations (including visitor tracking), seed 25K location pages, deploy to Cloudflare Pages, purge cache, and ping sitemaps.
- Do not add `main` or other branches to the workflow; deployment is **clean-main** only.

## Supabase access key: Cursor / local only (write code only)

- **Your Supabase access key is for you and Cursor only**—use it locally to run migrations, seed, or debug. **Never commit it to the repo or paste it into code.**
- **Production** uses **GitHub Secrets** (and Cloudflare Pages env) only. The codebase only reads from **environment variables** (`process.env.SUPABASE_SERVICE_KEY`, `secrets.SUPABASE_SERVICE_KEY`, etc.); the actual key is added in GitHub and/or Cloudflare, not in source.
- Add the same key as **GitHub Secret** `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) so the workflow can run migrations and seed. That way Cursor writes code only; deploy uses the key from Secrets.

## Required for build & deploy

| Secret | Where to get it | Used for |
|--------|------------------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Edit Cloudflare Workers, Read account) | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar or Workers & Pages → overview | Deploy to Cloudflare Pages |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Build + 25K seed (Supabase client) |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public | Build (client env) |
| `SUPABASE_SERVICE_KEY` **or** `SUPABASE_SERVICE_ROLE_KEY` **or** `SUPABASE_SERVICE_ROLL_KEY` | Supabase → Project Settings → API → service_role (secret) | 25K seed (writes to `seo_architecture`) |
| `SUPABASE_DATABASE_URL` **or** `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI, include password) | Migrations + optional 25K seed (DB script) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | Checkout / webhooks |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys | Build (client) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → signing secret | Webhook verification |
| `RESEND_API_KEY` | Resend.com → API Keys | Email (trial, etc.) |
| `SESSION_SECRET` | Any long random string (e.g. `openssl rand -hex 32`) | Admin/auth sessions |

## Optional but recommended

| Secret | Where to get it | Used for |
|--------|------------------|----------|
| `CLOUDFLARE_ZONE_ID` | Cloudflare → your domain (streamstickpro.com) → Overview → Zone ID | Cache purge after deploy (fresh sitemap/location pages) |

## Visitor tracking (Supabase + Cloudflare)

- **Migrations**: The deploy workflow runs all `20260212*` SQL migrations, including **visitor dedup & live stats** (`visitors` ip_hash, `get_live_visitors`, `upsert_visitor_visit`). No extra step needed if `SUPABASE_DATABASE_URL` or `DATABASE_URL` is set.
- **Worker runtime**: Set **every** variable the Worker reads in **Cloudflare Pages → your project → Settings → Environment variables (Production)**. Full list (SEO + Supabase + GitHub + deploy):
  - **Supabase:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLL_KEY`) — required for sitemaps, redirects, /l/ pages, track-visit, admin, blog, orders.
  - **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - **Auth/email:** `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (vars in wrangler.toml; override in Cloudflare if needed)
  - **Optional:** `JWT_SECRET`, `GITHUB_TOKEN`, `OPENAI_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NODE_ENV`
  - Without Supabase URL + service key, sitemaps and location pages still work (static + location-pages.json fallback), but blog/redirects from DB and track-visit will fail.
- **GitHub Secrets** are used at **build** time; **Cloudflare env** is used at **request** time by the Worker. Ensure both Supabase URL and service key are in Cloudflare so visitor tracking works after deploy.

## 25K seed behavior

- If **VITE_SUPABASE_URL** + **SUPABASE_SERVICE_KEY** (or ROLE_KEY or ROLL_KEY) are set → workflow runs **Supabase client** 25K seed.
- Else if **SUPABASE_DATABASE_URL** or **DATABASE_URL** is set → workflow runs **DB script** 25K seed (`seed-25k-via-database-url.ts`).
- If none of the above → seed step is skipped (sitemap still works via build-time `location-pages.json` if present).

## Deployment (push to GitHub → deploy)

- **Branch:** Only **clean-main** triggers deploy. **Push to `clean-main`** to run the workflow (build, deploy to Cloudflare, run migrations including visitor tracking + seed if secrets are set).
- **To deploy a clean main branch:**
  1. Commit all changes locally.
  2. Push to `clean-main`:  
     `git push origin clean-main`  
     (If the branch doesn’t exist: `git checkout -b clean-main` then push, or rename/maintain your main branch as `clean-main` and push.)
  3. GitHub Actions will run: migrations (Supabase SEO + visitor 20260212), 25K seed (if secrets set), build, deploy to Cloudflare Pages, cache purge, sitemap ping.
- **After adding/rotating secrets:** Push an empty commit to `clean-main` or re-run the workflow from the Actions tab so the new keys are used.
- **Cloudflare Worker env:** After deploy, ensure **Cloudflare Pages → project → Settings → Environment variables** has Supabase URL + service key (and other secrets) so `/api/track-visit` and admin live visitors work at runtime.

## After deploy: IndexNow, Google, Bing, Yandex, Yahoo

- The workflow **pings** your sitemap to **Google**, **Bing**, and **Yandex**.
- **Yahoo** uses Bing’s index; pinging Bing covers Yahoo.
- The workflow then runs **IndexNow** (live sitemap URLs submitted to IndexNow API → **Bing, Yandex, Seznam**). So every deploy pushes your URLs to IndexNow, Google (ping), Bing (ping + IndexNow), Yandex (ping + IndexNow). No extra step needed; just push to **clean-main**.
