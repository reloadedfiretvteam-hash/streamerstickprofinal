# Fix 25K URLs – All Approaches

Use this when the sitemap has only ~292 URLs instead of 25K+. Try approaches in order until one works.

---

## Root cause (short)

Location pages live in Supabase table **`seo_architecture`**. The sitemap is built from that table (plus static + blog). If the **25K seed** never ran or failed, the table has only the 50 rows from migrations → sitemap stays small.

---

## Approach 1: GitHub Actions (recommended)

**What:** Let the deploy workflow run the seed in CI. Deployment is **clean-main only**.

**Steps:**

1. **Set GitHub Secrets** (repo → Settings → Secrets and variables → Actions):
   - **Option A (easiest):**  
     - `SUPABASE_DATABASE_URL` = Supabase → Project Settings → Database → Connection string (URI).  
     - Same value as you use for migrations.
   - **Option B:**  
     - `VITE_SUPABASE_URL` = Supabase → Project Settings → API → Project URL  
     - `SUPABASE_SERVICE_KEY` = Supabase → Project Settings → API → **service_role** (secret) key (not anon).

2. **Trigger the workflow:**
   - Push to **clean-main**, or  
   - Actions → **Deploy to Cloudflare Pages** → **Run workflow** (branch: `clean-main`).

3. **Check the run:**
   - Open the **“Verify secrets for 25K seed”** step: it logs (without values) whether URL, key, and DATABASE_URL are set.
   - Open **“Seed 25K location pages”**: you should see either “Running 25K seed (DATABASE_URL)” or “Running 25K seed (Supabase client)” and then “25K seed finished”. If it says **SKIPPED**, the missing secret is listed there.

4. **Retries:** The workflow runs the seed up to **2 times** with a 10s delay if the first attempt fails.

---

## Approach 2: Run seed locally (DATABASE_URL)

**When:** You have the DB connection string locally and want to seed without pushing.

**Steps:**

1. Put in `.env.local` (or env):
   - `SUPABASE_DATABASE_URL` or `DATABASE_URL` = same connection string as Supabase migrations (Project Settings → Database → Connection string URI).

2. Run:
   ```bash
   npm run seed:25k:db
   ```
   or
   ```bash
   npx tsx scripts/seed-25k-via-database-url.ts
   ```

3. You should see “Existing rows before seed”, “Upserted …”, “Total rows after seed”, “Done (via DATABASE_URL)”.

---

## Approach 3: Run seed locally (Supabase client)

**When:** You have the project URL and **service_role** key (not anon).

**Steps:**

1. In `.env.local` or env:
   - `VITE_SUPABASE_URL` = Project URL  
   - `SUPABASE_SERVICE_KEY` = service_role key  

2. Run:
   ```bash
   npm run seed:25k
   ```
   or
   ```bash
   npx tsx scripts/seed-25k-location-pages.ts
   ```

---

## Approach 4: Supabase SQL Editor (no CLI / no CI)

**When:** CI and local scripts are not an option; you can only use the Supabase dashboard.

**Steps:**

1. **Generate a SQL file** (on your machine):
   ```bash
   npm run seed:25k:sql
   ```
   Default: 1000 rows → `docs/seed-25k-inserts.sql`. For more rows:
   ```bash
   npx tsx scripts/generate-25k-seed-sql.ts 2000 200
   ```
   (2000 rows, 200 per INSERT.)

2. **Run in Supabase:**  
   Dashboard → SQL Editor → New query → paste the contents of `docs/seed-25k-inserts.sql` → Run.

3. **If it times out:**  
   Add at the top of the script:
   ```sql
   SET statement_timeout = '300s';
   ```
   Or run the file in chunks (e.g. first 500 rows, then next 500).

4. **Full 25K:**  
   For all ~24K rows, use Approach 1 or 2; the SQL file is meant as a fallback for a smaller batch (e.g. 1K–2K).

---

## Approach 5: Supabase Table Editor + CSV (advanced)

**When:** You want to use Table Editor import.

**Steps:**

1. The table must have columns: `page_type`, `country`, `region`, `location`, `slug`, `target_keyword`, `title`, `meta_description`, `h1`, `p1_snippet`, `pillar_url`, `internal_links` (JSONB), `content_blocks` (JSONB), `faq_json` (JSONB), `published`.

2. CSV import has size limits (~100MB in dashboard). For 25K rows with JSON columns, prefer Approach 1 or 2. For a small test (e.g. 100 rows), you can export a CSV from the script (add a small script that writes `getSeedRows().slice(0, 100)` to CSV) and import in Table Editor.

---

## Approach 6: External DB client (TablePlus, pgAdmin, DBeaver)

**When:** You have the Postgres connection string and prefer a desktop client.

**Steps:**

1. Connect using **SUPABASE_DATABASE_URL** (Project Settings → Database → Connection string URI).

2. Run the same SQL as in Approach 4, or run the **seed script** locally with `DATABASE_URL` (Approach 2). The client is just another way to run SQL or to inspect `seo_architecture` after seeding.

---

## Verification (all approaches)

1. **Supabase:** Table Editor → `seo_architecture` → row count should be **~24K+** (or 50 + number of new rows you added).
2. **Sitemap:** Open https://streamstickpro.com/sitemap.xml and count `<loc>` (or run: `curl -sSf "https://streamstickpro.com/sitemap.xml" | grep -o '<loc>' | wc -l`). Expect thousands.
3. **Sample URLs:** Try e.g.  
   - https://streamstickpro.com/l/usa/iptv/houston  
   - https://streamstickpro.com/l/usa/jailbreak/los-angeles  

---

## Where secrets come from (Supabase)

| Secret / need | Where in Supabase |
|---------------|-------------------|
| **Project URL** | Project Settings → API → Project URL |
| **Anon key** | Project Settings → API → anon public |
| **service_role key** | Project Settings → API → service_role (secret) |
| **Database URL** | Project Settings → Database → Connection string → URI (use the one that includes the password) |

Use **service_role** (or Database URL) for the seed; the Worker can read with anon key once rows exist (RLS allows `SELECT` where `published = true`).

---

## If the workflow says “Workflow does not have workflow_dispatch”

The workflow is defined on **clean-main**. If the repo default branch is **main**, the API may still use the workflow file from **main**. Ensure the same workflow file (with `workflow_dispatch` and optional `inputs`) exists on **main** (e.g. merge clean-main into main and push), or trigger the workflow by **pushing to clean-main** so the run uses the correct workflow.

---

## Summary

| Approach | Best when |
|----------|-----------|
| 1. GitHub Actions | You can set repo secrets and push or run workflow |
| 2. Local DATABASE_URL | You have the DB URL and run scripts locally |
| 3. Local Supabase client | You have project URL + service_role key |
| 4. SQL Editor | You only have dashboard access, need a quick 1K–2K rows |
| 5. Table Editor CSV | Small manual test; not for full 25K |
| 6. External client | You use TablePlus/pgAdmin and run SQL or scripts |

For full 25K URLs, use **1** or **2** (or **3**). Use **4** for a smaller backup when CI/local isn’t possible.
