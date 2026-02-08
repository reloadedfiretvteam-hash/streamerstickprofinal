# Emergency 25K URL Status + Force Seed Guide

**Purpose:** Diagnose why the sitemap has ~292 URLs instead of 25K and **force** the seed to run so all location pages exist.

---

## STEP 1: Answers to the 10 Status Questions

| # | Question | Answer (from this codebase + live checks) |
|---|----------|--------------------------------------------|
| **1** | Current total number of pages on streamstickpro.com? | **Unknown from here** (fetch timed out). Check live: open https://streamstickpro.com/sitemap.xml and count `<loc>` tags, or run: `curl -sSf "https://streamstickpro.com/sitemap.xml" \| grep -o '<loc>' \| wc -l` |
| **2** | Does sitemap.xml exist? How many URLs? | **Yes.** Sitemap exists at https://streamstickpro.com/sitemap.xml. URL count = number of rows in Supabase `seo_architecture` (published) + static pages + blog. If seed never ran successfully, count stays ~292 (static + blog only). |
| **3** | Can you access Supabase with secret variables/role key? | **In CI:** Seed runs only if one of these is set: `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLL_KEY`, **or** `SUPABASE_DATABASE_URL` / `DATABASE_URL`. The repo does not have access to your secrets; GitHub Actions does. If the "Seed 25K" step was **SKIPPED** in the workflow log, add the correct secret (see Step 2 below). |
| **4** | What error messages appeared when running previous prompts? | **Root cause already fixed:** The workflow was skipping the seed when only `DATABASE_URL` was set (it only checked `SUPABASE_SERVICE_KEY`). Now it runs `seed-25k-via-database-url.ts` when `SUPABASE_DATABASE_URL` or `DATABASE_URL` is set, so **no service_role key is required** for the seed. |
| **5** | Is GitHub repository updated with new pages? | **Pages are not files in the repo.** Location pages are **database rows** in Supabase `seo_architecture`. The Worker serves them at `/l/{country}/{pageType}/{slug}` (e.g. `/l/usa/iptv/houston`). The repo has the seed script and workflow; the **deploy** step pushes the Worker to Cloudflare. |
| **6** | Are Cloudflare Workers deployed? | **Yes** – the workflow deploys to Cloudflare Pages (project `streamerstickpro-live`, branch `clean-main`). The Worker serves the site, sitemap, and `/l/` location pages. |
| **7** | Current page generation limit in your system? | **No hard limit.** Seed script produces **24,344 rows** (locations + extras). Worker sitemap fetches up to **25,000** rows (paginated 1,000 per request). Sitemap spec allows 50K URLs per file. |
| **8** | Did secret variables load correctly? | **Check in GitHub Actions:** Open the last "Deploy to Cloudflare Pages" run → "Seed 25K location pages" step. Look for: `Seed env: VITE_SUPABASE_URL=1, service_key_any=..., DATABASE_URL_any=...`. If `DATABASE_URL_any=1` or `service_key_any=1`, the seed **should** have run. If it says "SKIPPED", the listed secrets are missing. |
| **9** | Is domain streamstickpro.com writable? Test write 1 test page. | **You don’t “write” files to the domain.** The site is generated from (1) static assets, (2) Supabase data. Adding a row to `seo_architecture` (via the seed) makes a new page at `/l/usa/iptv/slug`. **Test:** After seed runs, open `https://streamstickpro.com/l/usa/iptv/houston` (or any slug from the seed). |
| **10** | MAX page generation capacity per prompt? | **24,344 pages** in one seed run (script `getSeedRows()`). No per-prompt cap; batching is 200 rows per INSERT. |

---

## STEP 2: If Any Answer Shows a Problem – Fix It

| If… | Do this |
|-----|--------|
| **Supabase connection failed** | In GitHub: Settings → Secrets and variables → Actions. Ensure **one of**: `SUPABASE_DATABASE_URL` or `DATABASE_URL` (same as migrations), **or** `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`). Re-run the workflow. |
| **Seed step SKIPPED** | Add secret `SUPABASE_DATABASE_URL` (Supabase → Project Settings → Database → Connection string URI). Then run the workflow (push to `main`/`clean-main` or use "Run workflow" in Actions). |
| **Sitemap still ~292 after seed** | 1) Confirm in the workflow log that "Running 25K seed (DATABASE_URL)" or "Running 25K seed (Supabase client)" ran and finished. 2) In Supabase Table Editor, open `seo_architecture` and check row count. 3) Worker uses **anon or service key** to read `seo_architecture`; RLS allows public read when `published = true`. |
| **GitHub not updating** | You don’t need new commits for “new pages.” Pages come from the **database** after the seed runs. Ensure the **Deploy to Cloudflare Pages** workflow ran (triggered by push or manually). |
| **Cloudflare blocking** | Unrelated to the seed. The Worker is deployed by the same workflow that runs the seed. |

---

## STEP 3: Force Generate 25K Pages (No New Code Needed)

The seed **does not** create URLs like `/iptv-new-york` or `/jailbroken-fire-stick-los-angeles`. It creates rows that the Worker exposes at:

- **URL pattern:** `https://streamstickpro.com/l/{country}/{pageType}/{slug}`
- **Examples:** `/l/usa/iptv/houston`, `/l/usa/jailbreak/los-angeles`, `/l/ca/iptv/toronto`

**To force the seed to run:**

1. **Option A – Re-run the workflow (recommended)**  
   - GitHub → **Actions** → **Deploy to Cloudflare Pages** → **Run workflow** (branch: `main` or `clean-main`).  
   - This runs migrations, **then the 25K seed** (Supabase client if service key + URL set, else DATABASE_URL seed), then build and deploy.

2. **Option B – Run the seed locally**  
   - You need `SUPABASE_DATABASE_URL` or `DATABASE_URL` in `.env.local` (or env).  
   - Run:  
     `npx tsx scripts/seed-25k-via-database-url.ts`  
   - Or with Supabase client: set `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, then:  
     `npx tsx scripts/seed-25k-location-pages.ts`

3. **Option C – Wait for the daily run**  
   - The workflow runs on a schedule at **02:00 UTC** every day. If secrets are set, the seed will run then.

---

## STEP 4: Proof of Work – What to Check After the Seed

1. **Workflow summary**  
   - In the run, open the step **"Seed 25K location pages"**. You should see either "Running 25K seed (DATABASE_URL)" or "Running 25K seed (Supabase client)" and then "25K seed finished."

2. **Supabase**  
   - Table `seo_architecture`: row count should be **~24K+** (or 292 + inserted).

3. **Sitemap**  
   - Open https://streamstickpro.com/sitemap.xml and count `<loc>` (or run the `curl` command from question 1). Expect **thousands** of URLs.

4. **Sample live URLs** (use your real slugs from the seed):  
   - `https://streamstickpro.com/l/usa/iptv/houston`  
   - `https://streamstickpro.com/l/usa/jailbreak/los-angeles`  
   - `https://streamstickpro.com/l/ca/iptv/toronto`

---

## STEP 5: Technical Verification (Already in the Workflow)

- The workflow **pings Google/Bing/Yandex** with the sitemap URL after deploy.
- **robots.txt** already has `Allow: /` and `Sitemap: https://streamstickpro.com/sitemap.xml`.
- **Sitemap** is built in the Worker from `seo_architecture` (paginated, up to 25K URLs).

---

## If You Hit Limits

- **Supabase:** Default limits are enough for 25K rows. The seed uses batches of 200 and `ON CONFLICT DO NOTHING`.
- **Worker:** Sitemap fetches in chunks of 1,000; no 25K limit in code.
- **Emergency:** To get **at least 1,000 pages** quickly, the same seed script runs; it inserts all 24K+ rows (no 1K-only mode). If the seed step fails, the workflow log will show the error (e.g. connection or table missing). Fix the secret or run migrations, then re-run the workflow.

---

## Summary

| Item | Status |
|------|--------|
| Sitemap exists | ✅ https://streamstickpro.com/sitemap.xml |
| robots.txt | ✅ Allow: /, Sitemap set |
| Seed script (Supabase client) | ✅ `scripts/seed-25k-location-pages.ts` |
| Seed script (DATABASE_URL) | ✅ `scripts/seed-25k-via-database-url.ts` |
| Workflow runs seed when | ✅ Service key + URL **or** DATABASE_URL set |
| Location page URL pattern | `/l/{country}/{pageType}/{slug}` (not /iptv-city) |
| Force run | GitHub Actions → Deploy to Cloudflare Pages → Run workflow |

**Do not paste this into “Superbase AI Builder.”** This project uses **Supabase + Cloudflare Workers + GitHub Actions**; the seed and sitemap are already implemented. Ensure the right **GitHub Secrets** are set and **re-run the workflow** to force the 25K seed.
