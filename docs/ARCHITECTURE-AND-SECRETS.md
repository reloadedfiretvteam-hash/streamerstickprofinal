# Website Architecture & Secrets (Where to Configure What)

**No secret values belong in this repo or in code.** This doc describes structure and where to set keys (GitHub, Cloudflare, Supabase, local/Cursor).

---

## 1. Deployment & Branch

- **Deploy branch:** `clean-main` only. Pushing to `clean-main` triggers: migrations, 25K seed (if secrets set), build, deploy to Cloudflare Pages, cache purge, sitemap ping, IndexNow.
- **Repo:** Code and config only. No `STRIPE_SECRET_KEY`, no `SUPABASE_SERVICE_KEY`, no `CLOUDFLARE_API_TOKEN`, no passwords.

---

## 2. GitHub (Secrets and Variables → Actions)

Set in **Settings → Secrets and variables → Actions**:

| Name | Purpose |
|------|--------|
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for deploy |
| `VITE_SUPABASE_URL` | Supabase project URL (build + optional seed) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (build) |
| `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | Migrations + 25K seed + worker runtime needs |
| `SUPABASE_DATABASE_URL` or `DATABASE_URL` | Run SQL migrations (and optional DB seed) |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout and webhooks |
| `RESEND_API_KEY` | Email (trial, campaigns) |
| `SESSION_SECRET` | Admin/auth sessions |
| `CLOUDFLARE_ZONE_ID` | Optional; cache purge after deploy |

**Cursor / local:** Use the same names in `.env` or `.env.local` for running migrations, seed, or debug. Never commit `.env` or paste keys into code.

---

## 3. Cloudflare (Pages → Project → Settings → Environment variables)

**Production (and Preview if desired):**

- Same as above where the **Worker** needs them at request time: `VITE_SUPABASE_URL` (or `SUPABASE_URL`), `SUPABASE_SERVICE_KEY` (or service role key), Stripe, Resend, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, etc.
- Visitor tracking (`/api/track-visit`, `/api/admin/visitors/live`) and email/checkout need Supabase URL + service key in Cloudflare env.

**No keys in wrangler.toml** – only variable names and comments. Values go in Cloudflare dashboard or `wrangler secret` for local dev.

---

## 4. Supabase

- **Project URL & anon key:** Used in client (build) and optionally in worker; from Supabase → Project Settings → API.
- **Service role key:** For migrations, 25K seed, and worker RPCs; from same API page. Stored only in GitHub Secrets and Cloudflare env.
- **Database URL:** For migration scripts and optional DB seed; from Project Settings → Database. Stored only in GitHub Secrets (and locally in `.env` if you run scripts yourself).

---

## 5. Cursor / Local Development

- **Purpose:** Run migrations, seed, debug, and run scripts. Use `.env` or `.env.local` with the same variable names. Add to `.gitignore`; never commit.
- **Supabase access for Cursor:** Use only in local env. Production uses GitHub Secrets + Cloudflare env only.

---

## 6. Site Structure (No Secrets)

- **Frontend:** React (Vite), wouter, static pages + location pages `/l/:country/:pageType/:slug`.
- **Worker:** Hono on Cloudflare; handles API, redirects, sitemap, crawler HTML for location pages, static redirects.
- **Sitemap:** `sitemap-index.xml` (pages, posts, full); `sitemap.xml` = static + blog + location (DB or `location-pages.json`).
- **Redirects:** DB `redirect_map` first, then `SEO_REDIRECTS_STATIC` in worker.
- **25K/40K location pages:** Seed writes to `seo_architecture`; build can emit `location-pages.json` for sitemap and meta fallback.

---

**Summary:** All keys live in GitHub Secrets, Cloudflare env, Supabase dashboard, or local `.env`. Repo and this doc describe architecture and variable names only; no secret values are stored in code or docs.
