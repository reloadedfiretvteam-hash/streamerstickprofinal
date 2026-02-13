# Supabase + Cloudflare Verification (No Secrets in This Doc)

Use this checklist to confirm Supabase and Cloudflare are updated and working with your system. **Never paste real keys or URLs here.**

---

## 1. Supabase – What & Where

| What | Where to set | Used by |
|------|----------------|--------|
| **Project URL** | GitHub Secrets: `VITE_SUPABASE_URL`; Cloudflare Pages env: `VITE_SUPABASE_URL` or `SUPABASE_URL` | Build, Worker, seed scripts |
| **Anon key** | GitHub Secrets: `VITE_SUPABASE_ANON_KEY`; optional in Cloudflare if client-only | Build (client), public API |
| **Service role key** | GitHub Secrets: `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`); Cloudflare env: same | Migrations, 25K seed, blog seed, Worker (admin, track-visit, blog CRUD) |
| **Database URL** | GitHub Secrets: `SUPABASE_DATABASE_URL` or `DATABASE_URL` | `run-supabase-migration.ts`, optional DB seed |

**Where to get values:** Supabase Dashboard → your project → **Project Settings** → **API** (URL, anon, service_role) and **Database** (connection string).

---

## 2. Cloudflare – What & Where

| What | Where to set | Used by |
|------|----------------|--------|
| **Deploy** | GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions deploy workflow |
| **Worker env at runtime** | Cloudflare Pages → your project → **Settings** → **Environment variables** (Production) | Worker: Supabase, Stripe, Resend, admin, etc. |

**Required in Cloudflare env for Worker:** `VITE_SUPABASE_URL` (or `SUPABASE_URL`), `SUPABASE_SERVICE_KEY` (or service role key). Without these, `/api/track-visit`, `/api/admin/*`, and blog API will fail.

---

## 3. Migrations (Blog + SEO + Visitor)

- **Branch:** Deploy runs only from **clean-main**.
- **Migrations run by workflow:** `run-supabase-migration.ts` runs SQL files matching `20260207*`, `20260208*`, `20260209*`, `20260212*`, **20260213*** (blog_posts worker columns).
- **20260213** ensures `blog_posts` has: `is_published`, `category`, `featured`, `keywords`, `meta_description`, `published_at` (adds if missing). Required for Worker blog APIs and seed scripts.

If you run migrations locally, use `SUPABASE_DATABASE_URL` or `DATABASE_URL` and run the same script the workflow uses (or apply the same SQL in Supabase SQL Editor).

---

## 4. How to Verify Supabase + Cloudflare

1. **After deploy (clean-main):**
   - Open your site and visit `/blog`. Blog posts should load (Worker → Supabase `blog_posts` where `is_published = true`).
   - Open an individual post URL (e.g. `/blog/jailbroken-fire-stick-california-guide`). Page should render.

2. **Worker ↔ Supabase:**
   - If `/blog` or `/api/blog/posts` returns data, the Worker can read from Supabase.
   - If admin blog CRUD works (create/edit/delete posts), the Worker has write access (service key in Cloudflare env).

3. **Visitor tracking:**
   - Visit a few pages; then in admin check live visitors (if you have that UI). That uses Supabase RPCs from the Worker; confirms Supabase URL + service key in Cloudflare.

4. **Local seed (thousands of blogs):**
   - Run: `VITE_SUPABASE_URL=<url> SUPABASE_SERVICE_KEY=<key> npx tsx scripts/seed-thousands-seo-blogs.ts`
   - Then reload `/blog` and confirm new posts appear.

---

## 5. Quick Checklist

- [ ] GitHub Secrets include `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, and (for migrations) `SUPABASE_DATABASE_URL` or `DATABASE_URL`.
- [ ] Cloudflare Pages project has Production env vars: `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (and any other Worker secrets from wrangler.toml / ARCHITECTURE-AND-SECRETS.md).
- [ ] Deploy is triggered from **clean-main** only; workflow runs migrations (including 20260213) and build.
- [ ] `/blog` and a sample post load; admin blog and visitor features work as expected.

For full secret names and deploy steps, see **GITHUB-SECRETS-CHECKLIST.md** and **ARCHITECTURE-AND-SECRETS.md**.
