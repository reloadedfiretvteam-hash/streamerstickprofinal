# Deliverable 22: Deployment Checklist & GitHub Actions

## Pre-deploy

1. [ ] Run Supabase migration: `20260207000001_seo_domination_schema.sql` in SQL Editor.
2. [ ] Run seed: `20260207000002_seed_50_location_pages.sql` (in migrations; or use docs seed). Optional: `eeat-experts-seed.sql`.
3. [ ] Branch: deploy only from **clean-main**.
4. [ ] **All pages imported in App.tsx must be committed** (e.g. `client/src/pages/IptvMediaPlayers.tsx`). Missing files cause Cloudflare build ENOENT.
5. [ ] Secrets in Cloudflare: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, Stripe, etc. (see SECRETS_CHECKLIST.md).

## Deploy (GitHub Actions)

1. [ ] Push to `clean-main` → triggers `.github/workflows/deploy-cloudflare.yml`.
2. [ ] Build: `npm ci` (or `npm install --legacy-peer-deps` if needed).
3. [ ] Build client; deploy Worker + Assets to Cloudflare Pages.
4. [ ] Post-deploy: run IndexNow script (`scripts/indexnow-from-live-sitemap.ts` or `npm run seo:indexnow-live` if wired in workflow).

## Post-deploy

1. [ ] Purge Cloudflare cache (Dashboard → Caching → Purge Everything), or purge by URL/tag if configured.
2. [ ] Submit sitemaps:
   - Google Search Console: sitemap.xml (or sitemap-index.xml).
   - Bing Webmaster: sitemap.xml.
   - Yandex Webmaster: sitemap.xml.
3. [ ] Verify: Open https://streamstickpro.com/sitemap.xml and https://streamstickpro.com/l/usa/iptv/houston (after seed).
4. [ ] Verify redirects: /firestick → /iptv-firestick, /jailbreak → /jailbroken-fire-sticks, etc.

## Success metrics (from prompt)

- 250M impressions/month → 5M clicks → 1M trials in 120 days.
- Track in GSC/Bing; use traffic-projection-template.csv.

## GitHub Actions summary

- **Workflow:** deploy-cloudflare.yml on push to clean-main.
- **Steps:** checkout → setup Node → npm ci → build client → deploy to Cloudflare (Pages + Worker).
- **IndexNow:** Run after deploy (script in repo); add as workflow step if not already present.
