# Line-by-line audit: 25K SEO URLs — issues and solutions

This doc audits every part of the pipeline, lists **known issues people hit** (from research), and the **fix** for each. Use it to get 25,000 URLs live and stable.

---

## ROOT CAUSE (why seed never ran)

**The workflow skipped the seed whenever `SUPABASE_SERVICE_KEY` was empty.** If you only added `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLL_KEY`, the step still saw `SUPABASE_SERVICE_KEY` as empty and exited 0 (skip) **before** running the script. The script itself already reads any of the three from `process.env`; the bug was only in the **skip condition**. **Fix:** Skip only when **all three** key secrets are empty, and add a one-line log: `Seed env check: VITE_SUPABASE_URL=1, service_key_any=1` so you can see in the run that env is set.

---

## 1. GitHub Actions workflow (deploy-cloudflare.yml)

| Line / area | Issue (what goes wrong) | Research / others’ experience | Solution (done or to do) |
|-------------|-------------------------|--------------------------------|---------------------------|
| **Trigger: only `clean-main`** | Pushes to `main` never run the workflow; seed never runs. | Repos often use `main` as default; workflow doesn’t run. | **Done:** Trigger added for both `main` and `clean-main`. |
| **Trigger: no schedule** | After adding/fixing secrets, nothing runs until next push. | Secrets fixed but no re-run; seed still skipped in practice. | **Done:** `schedule: cron: '0 2 * * *'` added so workflow runs daily at 2 AM UTC. |
| **Secrets: only `SUPABASE_SERVICE_KEY`** | User creates secret as `SUPABASE_SERVICE_ROLE_KEY` (Supabase docs); workflow passes empty key; seed skips. | [GitHub Actions + Supabase](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions): secret name must match exactly. | **Done:** Workflow now passes all three key names. **ROOT CAUSE FIX:** Skip condition was `if [ -z "$SUPABASE_SERVICE_KEY" ]` so we skipped whenever that one was empty—even when `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLL_KEY` were set. The script already reads any of the three from env; we now skip only when **all three** are empty. |
| **Secrets: typo `SUPABASE_SERVICE_ROLL_KEY`** | User types ROLL instead of ROLE; secret exists but under wrong name; script never sees it. | N/A (typo). | **Done:** Workflow and seed script both accept `SUPABASE_SERVICE_ROLL_KEY`. |
| **Bash: `[ -z "$VAR" ]` with secrets** | In GHA, unset secrets are empty string; `-z` works. Masked value is still passed to the process. | [Stack Overflow](https://stackoverflow.com/questions/70249519): use `${{ secrets.NAME != '' }}` in `if:`; in bash, `-z "$VAR"` is correct. | **Done:** No change needed; logic is correct. |
| **Seed step: no failure when 0 inserted** | Seed runs but inserts 0 (wrong key, RLS, etc.); step succeeds; deploy goes ahead with ~292 URLs. | N/A. | **Done:** Seed script now `process.exit(1)` if expected to insert >1000 rows but inserted 0. |
| **Build step: only `SUPABASE_SERVICE_KEY`** | If user only has `SUPABASE_SERVICE_ROLE_KEY`, build step gets empty key (worker still works with anon for read). | N/A. | **Done:** Build step env now includes `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SERVICE_ROLL_KEY` for consistency. |

---

## 2. Seed script (scripts/seed-25k-location-pages.ts)

| Line / area | Issue | Research / others | Solution |
|-------------|--------|-------------------|----------|
| **Env: only `SUPABASE_SERVICE_KEY`** | Script checks only that; user has `SUPABASE_SERVICE_ROLE_KEY` or typo. | Script must accept same names as workflow passes. | **Done:** Script reads `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLL_KEY`, `SERVICE_ROLE_KEY`. |
| **.env.local in CI** | In GitHub Actions there is no .env.local; script relies on workflow `env:`. | GHA does not load .env by default; vars must come from workflow. | **Done:** Workflow passes all needed vars; script still loads .env.local when present (local runs). |
| **Bulk insert: 25K in one go** | Supabase/PostgREST timeouts and row limits (e.g. ~10K per request); single big insert can fail. | [Supabase bulk insert](https://massokineortho.com/blog/supabase-bulk-insert-limits-what): batch 1K–5K; [timeout](https://supabase.com/docs/guides/troubleshooting/canceling-statement-due-to-statement-timeout-581wFv). | **Done:** Script uses batches of 500; safe under typical limits. |
| **RLS: anon key** | If script gets anon key by mistake, RLS blocks INSERT; 0 rows inserted. | service_role bypasses RLS; anon does not. | **Done:** Script requires service key; exits 1 if 0 inserted when >1000 expected. |
| **Upsert: `ignoreDuplicates: true`** | With `ignoreDuplicates`, duplicate rows don’t insert; `data` length can be 0 for that batch; we count `data?.length` as “inserted” for that batch. | [Supabase upsert](https://supabase.com/docs/reference/javascript/upsert): with ignoreDuplicates, only new rows returned. | **Done:** Logic is correct: `inserted += data?.length ?? 0`; total inserted is tracked. |
| **Unique constraint (page_type, country, slug)** | Duplicate slug in same country+page_type causes conflict; row skipped. | UNIQUE in schema. | **Done:** Seed builds unique slugs (e.g. city-state); extra rows use unique `streamstickpro-coverage-{n}`. |

---

## 3. Worker: sitemap (worker/storage.ts — getSeoPagesForSitemap)

| Line / area | Issue | Research / others | Solution |
|-------------|--------|-------------------|----------|
| **Single .limit(25000)** | PostgREST/Supabase default max ~1000 rows per request; `.limit(25000)` only returns 1000. | [Supabase 1000-row limit](https://optimumnames.com/blog/supabase-unveiling-the-1000-row-limit-and-how-to-navigate-it-1764797995); use pagination/range. | **Done:** Replaced with paginated loop using `.range(from, to)` in chunks of 1000. |
| **.range(from, to)** | PostgREST uses 0-based inclusive range; wrong math returns wrong rows. | [PostgREST pagination](https://docs.postgrest.org/en/stable/references/api/pagination_count.html): 0-based, both ends inclusive. | **Done:** `to = offset + PAGE_SIZE - 1`; e.g. (0, 999) = 1000 rows. |
| **.order('id')** | Stable ordering required for pagination; without it, pages can overlap or skip. | Best practice for offset/range pagination. | **Done:** `.order('id', { ascending: true })`. |
| **catch → return []** | On any error we return []; sitemap shows 0 location URLs and no error. | N/A. | **Optional:** Log error in worker (e.g. console.error) before returning []; keep return [] to avoid breaking sitemap. |

---

## 4. Worker: runtime config (worker/helpers.ts)

| Line / area | Issue | Research / others | Solution |
|-------------|--------|-------------------|----------|
| **supabaseKey: SERVICE_KEY \|\| ANON** | Sitemap only reads `seo_architecture`; RLS allows public read; anon is enough. | N/A. | **Done:** No change; worker can use anon for sitemap. For 25K URLs, only the DB must be populated (seed). |
| **Cloudflare Pages env** | If only `SUPABASE_SERVICE_ROLE_KEY` is set in Pages (not `SUPABASE_SERVICE_KEY`), worker uses anon. | N/A. | **Done:** Sitemap doesn’t need service key; anon is enough for SELECT. |

---

## 5. Supabase: schema and RLS

| Item | Issue | Research / others | Solution |
|------|--------|-------------------|----------|
| **seo_architecture RLS** | Policy is SELECT for public; INSERT/UPDATE need service_role or a policy that allows insert. | service_role bypasses RLS; used in seed. | **Done:** Seed uses service_role; no change needed. |
| **statement_timeout** | Very long-running seed (many batches) could hit DB timeout. | [Supabase timeout](https://supabase.com/docs/guides/troubleshooting/canceling-statement-due-to-statement-timeout-581wFv): increase per role if needed. | **Done:** 500-row batches keep each request short. If timeouts appear, increase `statement_timeout` in Supabase or reduce batch size. |

---

## 6. Checklist: “Why do I still see 292 URLs?”

Use this in order:

1. **Secrets in GitHub (repo Settings → Secrets and variables → Actions)**  
   - `VITE_SUPABASE_URL` = Supabase project URL  
   - One of: `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `SUPABASE_SERVICE_ROLL_KEY` = **service_role** key (not anon)

2. **Trigger a run**  
   - Push to `main` or `clean-main`, or  
   - Actions → “Deploy to Cloudflare Pages” → Run workflow, or  
   - Wait for the daily schedule (2 AM UTC)

3. **In the run, open “Seed 25K location pages”**  
   - If it says **SKIPPED** in the job summary: fix the secret name/value (step 1).  
   - If it **RUN**s: check the log for “Total inserted” and “Total rows in seo_architecture after seed”.  
   - If “Total inserted” is 0 and the step failed: seed script now exits 1 (wrong key or RLS).

4. **After a successful seed**  
   - Sitemap is built from DB on each request; no redeploy needed for count.  
   - If you had cache: purge (workflow does it if `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN` are set), or wait for cache TTL.  
   - Open `https://streamstickpro.com/sitemap.xml` and count `<loc>` (or use the “Verify sitemap” step in the same run).

5. **If seed ran but sitemap still ~292**  
   - Confirm “Total rows in seo_architecture after seed” in the log is ~25,000.  
   - If DB has 25K but sitemap doesn’t: worker pagination or Supabase read might be failing (check worker logs / add logging in `getSeoPagesForSitemap`).

---

## 7. One-line summary

**Issues found and addressed:** (1) Workflow only on `clean-main` → added `main` + schedule. (2) Only one secret name for service key → accept SERVICE_KEY, SERVICE_ROLE_KEY, SERVICE_ROLL_KEY. (3) Sitemap capped at 1000 rows → paginate with `.range()`. (4) Seed “succeeds” with 0 inserted → exit 1 when expected insert >1000 but inserted 0. (5) Seed script didn’t accept ROLL_KEY → added. **Remaining requirement:** Correct GitHub secrets and at least one workflow run (push, manual, or schedule) so the seed executes.
