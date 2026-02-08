# SEO Build: Supabase + GitHub + Cloudflare Working Together

The SEO domination stack only works when all three are configured and connected. This doc is the single checklist.

---

## How they connect

```
GitHub (push to clean-main)
    │
    ├─► Run migrations  ──────►  SUPABASE (Postgres)
    │   (SUPABASE_DATABASE_URL      Tables: seo_architecture, redirect_map,
    │    or DATABASE_URL)           content_clusters, seo_experts
    │
    ├─► Build (Vite + Worker)  ─►  dist/ (_worker.js, _routes.json, client assets)
    │   (VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, etc. from GitHub Secrets)
    │
    └─► Deploy  ──────────────►  CLOUDFLARE (Pages + Worker)
        (CLOUDFLARE_API_TOKEN,      Worker runs at streamstickpro.com
         CLOUDFLARE_ACCOUNT_ID)     and reads/writes Supabase at runtime
                                         │
                                         └─► SUPABASE (API: anon + service key)
                                             Same tables; Worker uses
                                             SUPABASE_SERVICE_KEY from
                                             Cloudflare env
```

- **Supabase** = database (SEO tables + app data). Migrations run from **GitHub**. The live site (**Cloudflare Worker**) reads/writes Supabase at runtime.
- **GitHub** = runs migrations (against Supabase), builds the app, deploys to Cloudflare. Needs secrets for Supabase + Cloudflare.
- **Cloudflare** = hosts the site and Worker. Worker needs Supabase URL + service key (from Cloudflare env) to serve `/api/seo-page`, sitemap, redirects, admin SEO.

---

## 1. Supabase (must be done first)

| What | Where | Value / action |
|------|--------|----------------|
| Project URL | Supabase Dashboard → Project Settings → API | `https://xxxxx.supabase.co` |
| Anon (public) key | Same → Project API | Long string; safe for client |
| Service role key | Same → Project API | Long string; **secret** (server only) |
| Database URL (Postgres) | Project Settings → Database → Connection string → URI | `postgresql://postgres.[ref]:[password]@[host]:5432/postgres` |

**Tables for SEO (created by migrations run from GitHub):**

- `seo_architecture` – location pages (25K target)
- `redirect_map` – 301 redirects
- `content_clusters` – pillar → cluster mapping
- `seo_experts` – author bios

Migrations are in `supabase/migrations/` (all `20260207*.sql`). They run when the GitHub workflow runs (on push to `clean-main`), **only if** the workflow has the database URL.

---

## 2. GitHub (secrets + workflow)

**Repo:** Your repo. **Branch that deploys:** `clean-main` (push triggers deploy).

**Secrets** (Repo → Settings → Secrets and variables → Actions). Add these so the SEO build and deploy work:

| Secret | Used by | Get value from |
|--------|--------|----------------|
| `SUPABASE_DATABASE_URL` or `DATABASE_URL` | Migration step | Supabase → Settings → Database → Connection string (URI) |
| `VITE_SUPABASE_URL` | Build + Worker | Supabase → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Build + Worker | Supabase → API → anon public |
| `SUPABASE_SERVICE_KEY` | Build (Worker env) | Supabase → API → service_role (secret) |
| `CLOUDFLARE_API_TOKEN` | Deploy + cache purge | Cloudflare → My Profile → API Tokens → Create (Pages: Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy | Cloudflare → any domain/Worker → right sidebar |
| `CLOUDFLARE_ZONE_ID` | Cache purge (optional) | Cloudflare → your domain (streamstickpro.com) → Overview → Zone ID |
| (Plus Stripe, Resend, SESSION_SECRET, etc. for the rest of the app) |

**Workflow:** `.github/workflows/deploy-cloudflare.yml`

1. Checkout, install, then **Run Database Migration** (needs `SUPABASE_DATABASE_URL` or `DATABASE_URL`).
2. **Build** (needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, etc.).
3. **Deploy to Cloudflare Pages** (needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
4. Purge cache (if `CLOUDFLARE_ZONE_ID` is set), warm sitemap, ping search engines, IndexNow.

If migration or deploy fails, check the Actions run and the secrets above.

---

## 3. Cloudflare (Pages + Worker env)

**Project:** Cloudflare Dashboard → Workers & Pages → your Pages project (e.g. `streamerstickpro-live`). Branch: `clean-main`.

**How the Worker gets Supabase:**  
The Worker is bundled in the build; at **runtime** it needs Supabase URL and **service role** key. Set them in Cloudflare so the Worker can read/write:

**Cloudflare Pages project → Settings → Environment variables (Production):**

| Variable | Type | Value |
|----------|------|--------|
| `VITE_SUPABASE_URL` | Encrypted (or plain) | Same as GitHub: `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Encrypted | Same as GitHub (anon key) |
| `SUPABASE_SERVICE_KEY` | **Encrypted** | Supabase service_role key |
| `ADMIN_USERNAME` | Encrypted | Admin login |
| `ADMIN_PASSWORD` | Encrypted | Admin password |
| (Plus `STRIPE_*`, `RESEND_API_KEY`, `SESSION_SECRET`, etc.) |

**Why both GitHub and Cloudflare?**  
GitHub secrets are used **at build time** (and for migration in CI). Cloudflare env is what the **Worker sees at runtime** when handling requests. So Supabase URL and keys must be set in **both** (same values) for the SEO build to work end-to-end.

**Optional:** Under your **domain** (e.g. streamstickpro.com), add **Caching → Configuration** and/or **Speed** settings as needed. Cache purge after deploy is done by the workflow if `CLOUDFLARE_ZONE_ID` is in GitHub Secrets.

---

## 4. Quick checklist (all three working together)

- [ ] **Supabase:** Project exists; you have Project URL, anon key, service_role key, and Database URI.
- [ ] **GitHub:** Repo has secrets set: `SUPABASE_DATABASE_URL` (or `DATABASE_URL`), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- [ ] **Cloudflare:** Pages project exists; Production env has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` (and other app secrets).
- [ ] **Push to `clean-main`:** Migration runs (creates/updates SEO tables in Supabase), build runs, deploy to Cloudflare runs.
- [ ] **Live check:** `https://streamstickpro.com/sitemap.xml` loads; `https://streamstickpro.com/api/seo-page/usa/iptv/houston` returns JSON; admin Infrastructure & SEO works (redirects, location pages).

When all three are set up like this, the SEO work build (migrations, Worker, sitemap, location pages, redirects) runs correctly together.
