# Finish – Verification Checklist

Use this to confirm everything from the conversation is live and working.

## Deploy

- **Branch:** Push to `clean-main` only. GitHub Actions runs: migrations (SEO + visitor 20260212*), 25K seed (if secrets set), build, deploy to Cloudflare Pages, cache purge, sitemap ping, IndexNow.
- **Verify:** GitHub → Actions → last workflow run for `clean-main` → green. Then check live site.

## Live site checks

1. **Homepage** – https://streamstickpro.com/  
   - Title: "IPTV Fire Stick 2026 | 18K+ Channels, No Buffer | StreamStick Pro"  
   - Meta description ~140 chars. Page loads.

2. **robots.txt** – https://streamstickpro.com/robots.txt  
   - If Cloudflare "Managed" rules are on, the live file may differ from repo. Repo has: Allow /, Disallow admin/api/checkout/success/cancel, two Sitemaps. Adjust in Cloudflare Dashboard if you want repo to win.

3. **Sitemaps** – https://streamstickpro.com/sitemap-index.xml and https://streamstickpro.com/sitemap.xml  
   - Return XML with `<loc>` URLs (static + blog + location pages).

4. **IndexNow key** – https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt  
   - Must return body: `59748a36d4494392a7d863abcf2d3b52` (no extra content). File is in `client/public/`.

5. **Visitor tracking** – Open site, check Network tab: POST to `/api/track-visit` (may need refresh). Admin → Live Visitors by Location (requires auth).

6. **Redirects** – Visit https://streamstickpro.com/firestick → 301 to /jailbroken-fire-sticks. Same for /iptv-canada → /iptv-services, /trial → /.

7. **Pillar pages** – /iptv-services, /jailbroken-fire-sticks, /tivimate, /iptv-smarters-pro, /36hr-trial, /shop load with correct titles and meta.

## Code/docs (already done)

- Visitor tracking: migration, worker `/api/track-visit`, frontend script in index.html, admin panel.
- Email: first email on campaign create, backfill, test email endpoint.
- SEO: meta 50–60 / 140–160 where set, 60+ redirects, HowTo on TiviMate + Smarters Pro, master audit + nuclear outreach + architecture docs.
- Secrets: only in GitHub Secrets / Cloudflare env / Supabase; no keys in repo.

## If something fails live

- **robots.txt wrong:** Cloudflare Dashboard → your domain or Pages → check for "Custom robots.txt" or managed rules; align with repo or leave managed.
- **IndexNow 404:** Ensure `client/public/59748a36d4494392a7d863abcf2d3b52.txt` is in the built assets (Cloudflare Pages serves from build output).
- **track-visit 404/500:** Worker needs Supabase URL + service key in Cloudflare env; redeploy after setting.
- **Sitemap empty for locations:** 25K seed needs VITE_SUPABASE_URL + SUPABASE_SERVICE_KEY in GitHub Secrets (and run); or build-time `location-pages.json` from generate-location-pages-json.

---

**Summary:** Push to `clean-main` → workflow deploys. Then run the live site checks above. All conversation deliverables are in code and docs; this checklist confirms they are deployed and working.
