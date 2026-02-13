# SEO URL audit – sitemap

**Audit date:** Based on live sitemap check.

---

## Current (live)

| Source | Count |
|--------|--------|
| **Total URLs in sitemap** | **292** |
| Static pages (home, shop, blog, pillars, terms, etc.) | 14 |
| Location pages (`/l/...` from `seo_architecture`) | ~278 |
| Blog posts | 0 or included in total above |

So the sitemap currently has **292** URLs. Almost all of the gap vs target is from **location pages** (you have hundreds, not thousands).

---

## Target (full SEO setup)

| Source | Expected count |
|--------|----------------|
| Static pages | 14 |
| Location pages | **25,000** |
| Blog posts | (however many you publish) |
| **Total (min)** | **25,014 + blog** |

So you’re aiming for **at least ~25,014** URLs (and more as you add blog posts).

---

## Gap

- **Current:** 292 URLs  
- **Target:** 25,014+ URLs  
- **Missing:** ~24,722 location page URLs  

Those missing URLs are the **25K location pages** that come from the seed script. Until that script runs successfully and fills `seo_architecture`, the sitemap will stay in the hundreds.

---

## Line-by-line: what was missed vs the original prompt

| # | Prompt requirement | Implemented? | What was wrong / fix |
|---|--------------------|--------------|----------------------|
| 1 | **25,000 location pages** (8K IPTV + 10K Jailbreak + 7K Google) | Script exists, **not run in practice** | CI step **skips** when `VITE_SUPABASE_URL` or `SUPABASE_SERVICE_KEY` are missing. No failure, so deploy stays green and you never see “thousands of URLs.” **Fix:** Add those two GitHub Secrets and re-run the workflow (or run `npm run seed:25k` locally with env set). |
| 2 | **Sitemap includes all 25K URLs** | Worker called `getSeoPagesForSitemap(25000)` | Supabase/PostgREST returns **max 1000 rows per request**. Worker only fetched one request → sitemap capped at 1000 location URLs even if DB had 25K. **Fix:** Worker’s `getSeoPagesForSitemap` now **paginates** (1000 per request) so all 25K rows can appear in the sitemap. |
| 3 | **Seed runs in CI after migrations** | Step present in `deploy-cloudflare.yml` | When secrets are missing, step exits 0 and only logs a warning; easy to miss. **Fix:** Workflow now writes a **“25K location pages seed”** section to the job summary so you see either “SKIPPED (add secrets)” or “RUN” with a note to check the log. |
| 4 | USA 1200+ / CA 400+ / UK 200+ cities | Seed uses 50 states × 100 cities (USA), 13 regions × 155 cities (CA), 4 × 334 (UK) | Data is sufficient to build 8316+ locations × 3 page types ≈ 25K rows. No change needed for URL count. |
| 5 | 50 pillar pages, 30 H2 / 20 lists / 15 tables, content_clusters, 25K redirects | Partial or optional | See [SEO-DOMINATION-IMPLEMENTED-VS-NOT.md](./SEO-DOMINATION-IMPLEMENTED-VS-NOT.md). These affect content depth and redirects, not the **number** of URLs. |

So: **you don’t have thousands of extra URLs because (1) the 25K seed never ran in CI (missing secrets), and (2) the sitemap would have been capped at 1000 location URLs even if the DB had 25K.** Both are now addressed in code and workflow.

---

## Checklist to get thousands of URLs

- [ ] **GitHub Secrets:** In the repo → Settings → Secrets and variables → Actions, add:
  - `VITE_SUPABASE_URL` = your Supabase project URL
  - `SUPABASE_SERVICE_KEY` = your Supabase **service_role** key (Dashboard → Project Settings → API)
- [ ] **Re-run deploy:** Push to `clean-main` or run the “Deploy to Cloudflare Pages” workflow manually. In the job summary, confirm the **“25K location pages seed”** section shows “RUN” (not “SKIPPED”).
- [ ] **Optional local run:** If you prefer to seed once from your machine: set `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env.local`, then run `npm run seed:25k`. Then trigger a deploy so the Worker’s sitemap picks up the new rows.
- [ ] **Verify:** After deploy, open `https://streamstickpro.com/sitemap.xml` and count `<loc>` (or check the “Verify sitemap” step in the workflow). You should see **25,000+** location URLs (plus static + blog).

---

## How to get to 25K+ URLs

1. **Run the 25K seed** so `seo_architecture` has ~25,000 rows:
   - **Option A:** Add **VITE_SUPABASE_URL** and **SUPABASE_SERVICE_KEY** in GitHub → Settings → Secrets → Actions, then push or re-run the “Deploy to Cloudflare Pages” workflow.
   - **Option B:** Run locally once: set those two env vars, then `npm run seed:25k` (see [SEED-25K-LOCATION-PAGES.md](./SEED-25K-LOCATION-PAGES.md)).
2. **Redeploy** (or let the next deploy run) so the Worker’s sitemap reads the new rows (worker now paginates and can return all 25K).
3. **Check again:** Open `https://streamstickpro.com/sitemap.xml` and count `<loc>` (or check the “Verify sitemap” step in the latest Actions run). You should see **25,000+** location URLs.

---

## Quick check commands

- **Count URLs in live sitemap (PowerShell):**  
  `(Invoke-WebRequest -Uri 'https://streamstickpro.com/sitemap.xml' -UseBasicParsing).Content` then count `<loc>`.
- **Admin panel:** Infrastructure & SEO → “X / 25,000 location pages” shows how many rows are in the DB right now.
