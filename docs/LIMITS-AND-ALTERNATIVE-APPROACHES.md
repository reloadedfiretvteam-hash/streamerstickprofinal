# Limits research + other approaches to get 25K URLs

## 1. Limit research (is there a limit issue?)

| Layer | Limit | Our setup | Verdict |
|-------|--------|-----------|---------|
| **Supabase SELECT (PostgREST)** | **1,000 rows per query** (default). You can store millions of rows; the cap is per request. | Worker uses **pagination**: `.range(from, to)` in chunks of 1,000, so we can read 25K rows. | ✅ **No limit issue** – pagination is implemented. |
| **Supabase bulk INSERT** | ~10K rows per single request (plan-dependent); payload size and **timeouts** for long runs. | Seed uses **200 rows per batch** (small batches). | ✅ **No limit issue** – well under 10K per request. |
| **Google sitemap.xml** | **50,000 URLs per file** max; **50 MB** uncompressed per file. | Single sitemap with 25K URLs. | ✅ **No limit issue** – under 50K and small size. |
| **Cloudflare Worker response** | No hard body limit that blocks a few MB. CDN cache limits are much larger (e.g. 512 MB). | 25K URLs in XML ≈ few MB. | ✅ **No limit issue**. |
| **Supabase free tier** | 500 MB DB, unlimited API requests. No row-count limit. | 25K rows is tiny. | ✅ **No limit issue**. |

**Conclusion:** There is **no limit** that blocks 25K URLs in sitemap or 25K rows in the DB. The worker paginates correctly; the seed uses small batches. The problem has been **the seed not running** (workflow skip logic), not limits.

---

## 2. Alternative approaches to fix the issue

If the GitHub Actions seed keeps failing or skipping, you can get 25K URLs in other ways.

### A. Seed via SQL migration (same as DB migrations)

- **Idea:** Insert 25K rows using **SQL** run by the existing migration step (which uses `DATABASE_URL` / `SUPABASE_DATABASE_URL`), not the Node seed script (which uses `VITE_SUPABASE_URL` + service_role).
- **Pros:** One set of secrets (`DATABASE_URL`); no dependency on `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` in the seed step.
- **Cons:** 25K rows as SQL is a very large migration file; or you generate it once and commit. Slower to change city lists later.
- **How:** Add a migration that either (1) runs a generated `.sql` with many `INSERT ... ON CONFLICT DO NOTHING`, or (2) reads a CSV and runs INSERTs from `run-supabase-migration.ts` (if you add CSV support there).

### B. Seed via Supabase Dashboard + CSV

- **Idea:** Export a CSV of 25K rows (from a script or spreadsheet), then use Supabase Dashboard → Table Editor → Import CSV into `seo_architecture`.
- **Pros:** No CI secrets for seed; you control when it runs.
- **Cons:** Manual; need to ensure columns and UNIQUE (page_type, country, slug) are respected (e.g. “Insert or update” or pre-clean).

### C. Separate “seed only” job with DATABASE_URL

- **Idea:** A small Node script that uses **only** `DATABASE_URL` (same as migrations) and the `postgres` or `pg` client to run raw INSERTs in batches. Run that script in a dedicated workflow step (or a separate workflow) that only needs `DATABASE_URL`.
- **Pros:** Same secret as migrations; no service_role key needed for the seed step.
- **Cons:** Requires the script and possibly a new workflow or step.

### D. Sitemap index + multiple sitemaps (best practice at scale)

- **Idea:** Instead of one `/sitemap.xml` with 25K URLs, serve a **sitemap index** (e.g. `/sitemap-index.xml`) that points to:
  - `/sitemap-static.xml` (static + blog)
  - `/sitemap-location-1.xml` (URLs 1–50,000)
  - (if you grow past 50K) `/sitemap-location-2.xml`, etc.
- **Pros:** Aligns with [Google’s large sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps); no single response size concern.
- **Cons:** Slightly more worker logic; still need 25K rows in the DB (seed must run one way or another).

### E. Supabase Edge Function or cron

- **Idea:** A Supabase Edge Function (or DB cron job) that inserts batches into `seo_architecture` on a schedule or on-demand.
- **Pros:** No GitHub Actions secrets for seed; runs inside Supabase.
- **Cons:** Need to build and deploy the function; key/credentials still required inside Supabase.

---

## 3. Recommended order

1. **Keep the current fix:** Skip seed only when **all three** key secrets are empty; ensure at least one of `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLL_KEY` is set. Re-run the workflow and confirm “Seed env check” and “Total inserted” in the log.
2. **If seed still doesn’t run:** Use **approach C** (seed script using only `DATABASE_URL`) so the same secret as migrations runs the seed.
3. **If you outgrow 50K location URLs:** Use **approach D** (sitemap index + multiple sitemaps).

---

## 4. Quick reference: limits that matter

- **PostgREST (Supabase) SELECT:** 1,000 rows per request → **paginate** (we do).
- **Google sitemap:** 50,000 URLs per file, 50 MB → we’re under both.
- **Supabase insert:** Batch in the hundreds/low thousands to avoid timeouts → we use 200.
- **Worker/sitemap:** No limit that blocks 25K URLs in one response.

No limit is blocking 25K URLs; the blocker has been the seed step not running in CI.
