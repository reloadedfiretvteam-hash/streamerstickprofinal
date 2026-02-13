# Niche Domination Strategy – IPTV, Jailbroken & Unlocked Fire Sticks, ONN Google TV

How we scale to **tens of thousands of unique meta tags and descriptions** and use **backlink magnets** to own the niche. Deploy to GitHub, Supabase, and Cloudflare with your access key.

---

## 1. Scale: 40,000+ unique URLs and meta

- **5 page types per location** (was 3):  
  **iptv** · **jailbreak** · **google** · **unlocked** · **onn**
- **~8,316 locations** × 5 = **~41,580 rows** in `seo_architecture`, each with:
  - Unique **title** (e.g. `Houston Unlocked Fire Stick & Streaming Device 2026 | StreamStickPro`)
  - Unique **meta description** (from 4 templates per type, chosen by hash of slug so no duplicates)
  - Unique **H1**, **p1_snippet**, **faq_json**, **internal_links**
- **Meta variety:** 4 description templates per page type (e.g. IPTV, jailbreak, google, unlocked, ONN). Template index = `hash(slug) % 4` so descriptions are spread and not repeated.
- **Keywords covered:** IPTV service, jailbroken Fire Stick, unlocked Fire Stick, Google TV IPTV, ONN Google TV, jailbroken ONN, unlocked streaming device, by city/region (USA, Canada, UK).

**Result:** Tens of thousands of indexable URLs, each with a unique title and meta description, so you can dominate long-tail and local searches without duplicate-content issues.

---

## 2. Backlink magnets

| Asset | URL | Purpose |
|-------|-----|--------|
| **Catalog API & “Link to us”** | `/tools/catalog` | Page for webmasters: use our 93K catalog stats, link to us, call `/api/catalog-summary`. Clear “link to this page” copy and suggested anchor text. |
| **Ultimate IPTV Catalog** | `/ultimate-iptv-catalog-2026` | 93K catalog hub; Dataset schema, “Explore 93K Catalog” CTA. Link target for “IPTV channel list”, “catalog” queries. |
| **Resources hub** | `/resources` | Channel directory, setup encyclopedia, app comparison, **Explore by location** (internal links to 16+ location pages), and link to **Tools: Catalog API**. |
| **Vs competitor pages** | `/vs-iptvstronger`, `/vs-troypoint`, … | Comparison pages that rank and attract links for “X alternative”, “X vs Y”. |

**Ideas to add later:**  
- “State of IPTV 2026” report (PDF + long page) for links.  
- Simple “channel list checker” or “device compatibility” tool.  
- More comparison pages (vs Roku, vs Apple TV).

---

## 3. Internal linking (no dead ends)

- **Resources:** “Explore by location” section with 16+ links to `/l/:country/:pageType/:slug` (Houston, New York, LA, Chicago, Toronto, London, etc.) so link equity flows into 40K+ location pages.
- **Homepage, pillar pages, blog:** Already link to shop, trial, catalog, blog; blog articles link back to Home, Shop, Free Trial, Back to Blog.
- **Location pages:** Each has “Related guides” (internal_links from seed) and pillar links (IPTV Services, Jailbroken Fire Sticks, ONN Google TV, etc.).

---

## 4. Deploy: GitHub, Supabase, Cloudflare

**Supabase (your access key):**

1. **Service role key** (or anon if you use RLS):  
   Supabase Dashboard → Project Settings → API → `service_role` (or anon).  
   Add as **GitHub Secret**: `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`).  
   Add in **Cloudflare Pages** → your project → Settings → Environment variables:  
   `SUPABASE_SERVICE_KEY` (and optionally `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` for client).
2. **Database URL** (optional, for migrations + DB-based seed):  
   Supabase → Project Settings → Database → Connection string (URI).  
   Add as GitHub Secret: `SUPABASE_DATABASE_URL` or `DATABASE_URL`.
3. **Run migrations:**  
   GitHub Actions (on push to `clean-main`) runs `scripts/run-supabase-migration.ts` if `DATABASE_URL` or `SUPABASE_DATABASE_URL` is set.
4. **Seed 40K+ rows:**  
   - **Option A:** If `SUPABASE_SERVICE_KEY` + `VITE_SUPABASE_URL` are set in GitHub Secrets, the workflow runs the Supabase client seed: `scripts/seed-25k-location-pages.ts` (which now outputs ~41K rows).  
   - **Option B:** If only `SUPABASE_DATABASE_URL` (or `DATABASE_URL`) is set, the workflow runs `scripts/seed-25k-via-database-url.ts`, which uses `getSeedRows()` from the same seed script (same ~41K rows) and inserts via Postgres.  
   So with **one** access key (service role **or** database URL) you can run migrations and the 40K seed.

**GitHub:**

- Push to **`clean-main`** triggers the deploy workflow.
- Workflow: checkout → run migrations → run seed (Supabase or DB) → build client + worker → deploy to Cloudflare Pages → verify sitemap → ping search engines.

**Cloudflare:**

- Pages project connected to the same repo; build command and output dir as in the workflow.
- Env vars (Supabase URL, service key, Stripe, etc.) set in Cloudflare Pages → Settings → Environment variables so the worker and optional client config have access.

**After deploy:**

- Sitemap: `https://streamstickpro.com/sitemap-pages.xml` should list **40K+** URLs (static + location pages from DB, or from `location-pages.json` if build generated it and DB seed didn’t run).
- Backlink magnet: `https://streamstickpro.com/tools/catalog`
- Sample location: `https://streamstickpro.com/l/usa/unlocked/houston`, `https://streamstickpro.com/l/usa/onn/los-angeles`

---

## 5. Campaigns and advertising (optional)

- **IndexNow:** Workflow pings IndexNow for new/changed URLs when you deploy.
- **Google/Bing/Yandex:** Sitemap index is submitted after deploy.
- **Paid:** Use the same money pages (/36hr-trial, /jailbroken-fire-sticks, /shop) as landing pages; meta and titles are already unique and on-brand.
- **Structured data:** FAQPage, Product, Organization, BreadcrumbList, WebPage, Dataset (catalog) already in place for rich results and AEO.

---

## 6. Summary

| Lever | What we did |
|-------|-------------|
| **Tens of thousands of meta** | 5 page types (iptv, jailbreak, google, unlocked, onn) × ~8,316 locations = ~41,580 unique titles + meta descriptions; 4 templates per type for variety. |
| **Backlink magnets** | `/tools/catalog` (API + “link to us”), `/ultimate-iptv-catalog-2026`, `/resources` with “Explore by location” and Tools link. |
| **Internal linking** | Resources “Explore by location” links to 16+ location pages; pillar and blog link to shop, trial, catalog; no dead ends. |
| **Deploy** | One Supabase access key (service role or DB URL) in GitHub Secrets + Cloudflare env; push to `clean-main` runs migrations, seed, build, deploy. |

Use your Supabase access key in GitHub Secrets (and optionally in Cloudflare env), push to **clean-main**, and the pipeline will run migrations, seed ~41K rows, and deploy to Cloudflare so you can dominate the niche at scale.
