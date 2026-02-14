# Full Audit: Cloudflare + Website Build & SEO

**Date:** 2026-02  
**Site:** StreamStickPro.com  
**Scope:** Cloudflare (via API), website build, SEO, and deployment.

---

## Security notice: Revoke the API token you shared

You pasted a Cloudflare API token in chat. **Revoke it now** and create a new one if you need API access again.

1. Cloudflare Dashboard → **My Profile** → **API Tokens**
2. Find the token you used → **Roll** or **Revoke**
3. Create a new token when needed; store it only in **GitHub Secrets** or local env (never in chat or code).

---

## Part 1: Cloudflare (what we could verify)

We ran the zone check script with your token. Results:

| Check | Result |
|-------|--------|
| **Zone name** | streamstickpro.com |
| **Zone status** | **active** |
| **Zone paused** | **No** (site is not in "development mode" / paused) |
| **SSL/TLS** | Not read (token lacked Zone Settings: Read) |
| **Security level** | Not read (same) |
| **Bot Fight Mode** | Not read (same) |
| **DNS records** | Not read (token lacked DNS: Read) |

**Conclusion:** The zone is **active** and **not paused**, so Cloudflare is not putting the site into a global “off” state.

**To get a fuller Cloudflare audit next time:** Create a new API token with:
- **Zone: Read**
- **Zone Settings: Read**
- **DNS: Read**

Then run (with the new token in env, never in chat):

```bash
npx tsx scripts/check-cloudflare-zone.ts
```

**Manual checks in Cloudflare Dashboard (do these yourself):**

- **Security → Bots:** Bot Fight Mode = **Off**
- **Security → Settings:** Security Level = **Medium** or **Low** (not “I’m Under Attack” or High)
- **SSL/TLS:** Encryption mode = **Full** or **Full (strict)**
- **Rules → Redirect Rules:** No rule that redirects *all* traffic to another domain or “coming soon”
- **Workers & Pages → streamerstickpro-live:** Last build **Success**, custom domains **streamstickpro.com** and **www** **Active**
- **Caching:** After any config change, run **Purge Everything** once (or rely on deploy workflow if `CLOUDFLARE_ZONE_ID` is in GitHub Secrets)

---

## Part 2: Live robots.txt (Cloudflare + your config)

**Fetched:** https://streamstickpro.com/robots.txt

- **Cloudflare Managed** content is prepended (Content-Signal, disallows for Amazonbot, Google-Extended, GPTBot, etc.). That’s expected.
- **Your block** is present: `Allow: /`, `Disallow: /api/`, `/admin`, `/shadow-services`, `/checkout?*`, plus **Sitemap** and crawl-delay for Googlebot/Bingbot/Yandexbot/DuckDuckBot.
- **Sitemap** in live file: `https://streamstickpro.com/sitemap.xml` (single line seen in snippet). Your repo has both `sitemap.xml` and `sitemap-index.xml`; ensure the live merged result still lists the sitemaps you want (sitemap-index is the one the deploy workflow pings).

**Recommendation:** In Cloudflare, if you have a “Custom robots.txt” or transform rule, keep it aligned with your repo so both sitemaps are listed:  
`Sitemap: https://streamstickpro.com/sitemap.xml`  
`Sitemap: https://streamstickpro.com/sitemap-index.xml`

---

## Part 3: Website build & deployment

| Item | Status | Notes |
|------|--------|--------|
| **Deploy branch** | clean-main only | Correct in `.github/workflows/deploy-cloudflare.yml` |
| **Build** | Vite + Worker | `script/build-worker.ts`; output to `dist` |
| **Cloudflare project** | streamerstickpro-live | `wrangler.toml` + workflow `pages deploy dist --project-name=streamerstickpro-live` |
| **Required GitHub Secrets** | Documented | See `docs/GITHUB-SECRETS-CHECKLIST.md`: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, Supabase, Stripe, RESEND, SESSION_SECRET |
| **Optional CLOUDFLARE_ZONE_ID** | Recommended | Enables cache purge after deploy for fresh sitemaps |
| **Worker env at runtime** | Cloudflare Pages → Settings → Environment variables | Must set: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, Stripe, RESEND, ADMIN_*, SESSION_SECRET so API and tracking work |
| **index.html** | Has fallback for crawlers | `<main>` + `<h1>` + short copy inside `#root` so crawlers see content before JS |
| **Canonical + meta** | index.html + CanonicalTag.tsx | Homepage canonical in HTML; other pages get canonical from `CanonicalTag` |
| **hreflang** | index.html + CanonicalTag | en-US, en-CA, en-GB, x-default |

**Wrangler / repo:**  
- `wrangler.toml` contains non-secret vars and **VITE_SUPABASE_ANON_KEY** (Supabase anon key). Anon keys are intended to be public; for stricter hygiene you can move them to env-only and inject at build. Not required for “inactive” or SEO.

---

## Part 4: SEO checklist (codebase + behavior)

| Item | Status | Notes |
|------|--------|--------|
| **Title / meta description** | Set | index.html + per-page where applicable (PillarLayout, LocationPage, etc.) |
| **OG / Twitter** | Set | index.html; per-page can override via `document` / meta tags |
| **Canonical** | Set | index.html for `/`; CanonicalTag for app routes |
| **Robots meta** | index, follow | index.html; noindex on checkout/login/success (in page useEffect) |
| **Schema (JSON-LD)** | Multiple | Organization, WebSite, Store, FAQPage, LocalBusiness, Product, etc. in index.html; SEOSchema.tsx + per-page (Service, ItemList, etc.) |
| **QAPage** | Removed from homepage | Only FAQPage on homepage (avoids GSC “Q&A has issues”) |
| **H1** | Present | Homepage (index + MainStore), PillarLayout, Checkout, LocationPage loading, CustomerLogin, ForgotPassword, Success; Blog listing and post |
| **Sitemaps** | Worker-generated | `/sitemap-index.xml`, `/sitemap-pages.xml`, `/sitemap-posts.xml`, `/sitemap.xml` |
| **STATIC_SITEMAP_PAGES** | Complete | Includes /, /shop, /blog, /36hr-trial, /pricing, pillars, /tutorials, /resources, /terms, /privacy, /refund, /checkout, vs-*, /ultimate-iptv-catalog-2026, /tools/catalog |
| **Redirects** | Worker | Static redirect map (e.g. /firestick → /jailbroken-fire-sticks); no redirect-everything |
| **IndexNow** | Workflow | `scripts/indexnow-from-live-sitemap.ts` after deploy; key file in `client/public/` |
| **Sitemap ping** | Workflow | Google, Bing, Yandex ping with sitemap-index URL after deploy |

---

## Part 5: Gaps and recommendations

### Cloudflare (manual)

1. **Confirm** Bot Fight Mode = **Off**, Security Level = **Medium** or **Low**.
2. **Confirm** no Redirect Rule that sends all traffic away from streamstickpro.com.
3. **Confirm** Workers & Pages → streamerstickpro-live: last build **Success**, custom domain **Active**.
4. **Add CLOUDFLARE_ZONE_ID** to GitHub Secrets so each deploy can purge cache (optional but recommended).

### Build / deploy

- All required secrets in GitHub and Cloudflare env are documented; no code change needed if they’re set.
- After any Cloudflare config change (Security, SSL, Redirect Rules), do one **Purge Everything** or re-run deploy with `CLOUDFLARE_ZONE_ID` set.

### SEO

- Repo and worker sitemap/redirect/h1/canonical/schema are in good shape.
- Keep only **one** sitemap line for sitemap-index in the final robots.txt (Cloudflare merge + your block) so the URL you ping (sitemap-index.xml) is the one crawlers see.

---

## Part 6: One-line summary

**Cloudflare:** Zone is **active**, not paused. Manually confirm Security/Bot Fight/Redirect Rules and Pages build/domain.  
**Site build & SEO:** Build, deploy, canonicals, meta, schema, sitemaps, h1, and redirects are in place; no missing “super base” pieces found. **Revoke the token you pasted** and use a new one only in Secrets or env.
