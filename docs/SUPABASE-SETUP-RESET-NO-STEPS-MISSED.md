# Supabase Setup & Reset – No Steps Missed

Use this checklist to set up or reset Supabase for streamstickpro.com (SEO tables, 25K location pages, redirects). Follow every step in order.

---

## STEP 1: Get Supabase credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. **Project URL (API):**
   - **Project Settings** → **API** → **Project URL**  
   - Copy. This is `VITE_SUPABASE_URL`.
3. **Anon key (API):**
   - Same **API** page → **Project API keys** → **anon** **public**  
   - Copy. This is `VITE_SUPABASE_ANON_KEY`.
4. **Service role key (API):**
   - Same page → **service_role** **secret**  
   - Copy. This is `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`).  
   - Do not expose in frontend; use only in CI or server.
5. **Database connection string:**
   - **Project Settings** → **Database** → **Connection string** → **URI**  
   - Use the URI that includes the database password. This is `SUPABASE_DATABASE_URL` or `DATABASE_URL`.

---

## STEP 2: Set GitHub Secrets

1. Repo → **Settings** → **Secrets and variables** → **Actions**.
2. Add (or update) these secrets. Names must match exactly.

| Secret name | Where you got it | Used for |
|-------------|------------------|----------|
| `VITE_SUPABASE_URL` | Step 1 – Project URL | Worker + frontend; sitemap & location pages |
| `VITE_SUPABASE_ANON_KEY` | Step 1 – anon key | Worker + frontend (read public data) |
| `SUPABASE_DATABASE_URL` or `DATABASE_URL` | Step 1 – Database URI | Migrations + 25K seed (no service key needed) |
| `SUPABASE_SERVICE_KEY` (optional) | Step 1 – service_role key | Alternative for 25K seed if you prefer over DATABASE_URL |

- For **migrations:** at least one of `SUPABASE_DATABASE_URL` or `DATABASE_URL`.
- For **25K seed in CI:** either `SUPABASE_DATABASE_URL` (or `DATABASE_URL`) **or** `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_KEY`.
- For **live site (Worker):** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (required).

---

## STEP 3: Run migrations (create tables)

Migrations run automatically in the **Deploy to Cloudflare Pages** workflow. They can also be run locally.

**Option A – Via GitHub Actions (recommended)**  
- Push to **clean-main**.  
- In the run, the step **Run Database Migration** uses `SUPABASE_DATABASE_URL` / `DATABASE_URL` and runs:
  - Core tables (customers, orders, etc.)
  - All **20260207\*** and **20260208\*** SQL files from `supabase/migrations/` in sorted order.

**Option B – Locally**  
```bash
# In project root; set env first
export SUPABASE_DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
npx tsx scripts/run-supabase-migration.ts
```

**What gets created/updated (SEO):**  
- `seo_architecture` – location pages (25K target)  
- `redirect_map` – 301 redirects (e.g. /pricing → /shop, /trial → /)  
- `content_clusters`, `seo_experts` – optional SEO  
- RLS policies so anon can read public rows  

**Migration order (20260207* + 20260208*):**  
1. `20260207000001_seo_domination_schema.sql` – tables + first redirects  
2. `20260207000002_seed_50_location_pages.sql` – 50 location rows  
3. `20260207000003_fix_firestick_redirect.sql`  
4. `20260207000004_*` – content_blocks, etc.  
5. … (all 20260207* then 20260208* in sort order)  
6. `20260208100000_add_trial_redirect.sql` – /trial → /

---

## STEP 4: Seed 25K location pages (optional but recommended)

If you skip this, the site still has **24K+ URLs** and meta via the build-time `location-pages.json` (static fallback). To have the same data in Supabase (and sitemap from DB):

**Option A – In CI (no extra step)**  
- Ensure **SUPABASE_DATABASE_URL** or **DATABASE_URL** is set (or **VITE_SUPABASE_URL** + **SUPABASE_SERVICE_KEY**).  
- Push to **clean-main**; the workflow runs the seed after migrations.

**Option B – Locally**  
```bash
# Using database URL (same as migrations)
export SUPABASE_DATABASE_URL="postgresql://..."
npx tsx scripts/seed-25k-via-database-url.ts
# or
npm run seed:25k:db
```

```bash
# Using Supabase client (service role)
export VITE_SUPABASE_URL="https://[project-ref].supabase.co"
export SUPABASE_SERVICE_KEY="eyJ..."
npx tsx scripts/seed-25k-location-pages.ts
# or
npm run seed:25k
```

---

## STEP 5: Cloudflare Worker (live site) env

So the live site can read Supabase:

1. **Cloudflare Dashboard** → your Pages project (e.g. streamerstickpro-live) → **Settings** → **Environment variables**.
2. For **Production** (and Preview if you use it) set:
   - `VITE_SUPABASE_URL` = Project URL  
   - `VITE_SUPABASE_ANON_KEY` = anon key  

(Deploy workflow usually injects these from GitHub Secrets; if you deploy another way, set them in Cloudflare.)

---

## STEP 6: Verify

1. **Supabase Table Editor**  
   - Open `seo_architecture` → row count should be 50 (migrations only) or 24K+ (after seed).  
   - Open `redirect_map` → should have rows for /pricing, /trial, /guides, /firestick, etc.

2. **Live sitemap**  
   - Open https://streamstickpro.com/sitemap.xml (or sitemap-pages.xml).  
   - Count `<loc>` tags: expect thousands (from DB or from static fallback).

3. **Sample location page**  
   - Open https://streamstickpro.com/l/usa/iptv/houston  
   - Should load with title/meta (from DB or static fallback).

---

## RESET: Clear location data and re-seed

Use this only if you want to **wipe location pages and re-run the 25K seed** (e.g. after a bad run or schema change).

**1. In Supabase SQL Editor run:**

```sql
-- Optional: reset only location pages (keeps redirect_map, content_clusters, etc.)
TRUNCATE TABLE seo_architecture RESTART IDENTITY;
```

**2. Re-run the seed**  
- Push to **clean-main** (CI will run the seed again), or  
- Run locally: `npm run seed:25k:db` or `npm run seed:25k` with env set.

**Full reset of SEO tables (use with care):**

```sql
-- Drops and recreates SEO tables (run only if you want a clean slate)
TRUNCATE TABLE seo_architecture RESTART IDENTITY;
-- redirect_map: uncomment to clear and rely on migration to re-insert
-- TRUNCATE TABLE redirect_map RESTART IDENTITY;
```

After that, run **migrations** again (e.g. push to clean-main or run `npx tsx scripts/run-supabase-migration.ts`), then run the **seed** again.

---

## Checklist summary

- [ ] **Step 1:** Got Project URL, anon key, service_role key, Database URI from Supabase.
- [ ] **Step 2:** Set GitHub Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_DATABASE_URL` (or `DATABASE_URL`), and optionally `SUPABASE_SERVICE_KEY`.
- [ ] **Step 3:** Migrations ran (push to clean-main or run `npx tsx scripts/run-supabase-migration.ts`).
- [ ] **Step 4:** Seed ran (CI or local `npm run seed:25k:db` / `npm run seed:25k`).
- [ ] **Step 5:** Cloudflare env has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **Step 6:** Verified `seo_architecture` row count, redirect_map, sitemap URL count, and a sample /l/ page.

If any step fails, see [FIX-25K-URLS-ALL-APPROACHES.md](./FIX-25K-URLS-ALL-APPROACHES.md) and [EMERGENCY-25K-STATUS-AND-FORCE-SEED.md](./EMERGENCY-25K-STATUS-AND-FORCE-SEED.md).
