# SEO Deploy: What We Did, What Might Happen, and If It Breaks

**Assumption:** Your env vars, API keys, and secrets are set correctly (e.g. in Cloudflare Dashboard). We are not changing, touching, or syncing them. This doc records only what **code and workflow** were changed for SEO, so if something breaks you know what was done and where to look.

---

## 1. What we did (every change)

### Workflow (`.github/workflows/deploy-cloudflare.yml`)

- **Removed:** The step that ran `sync-secrets-to-cloudflare-pages.mjs` (it pushed GitHub Secrets to Cloudflare). That step could overwrite or change what’s in Cloudflare. It is no longer in the workflow.
- **Added:** A short comment that Worker env comes only from Cloudflare Dashboard; this workflow does not sync or overwrite it.
- **Unchanged:** Build steps, Deploy to Cloudflare Pages (wrangler pages deploy), cache purge, sitemap ping. Build still receives env only for **build-time** (Vite, etc.). The **Worker at runtime** gets env only from **Cloudflare Pages → streamerstickpro-live → Environment variables** (Dashboard). We do not write to that from the workflow.

### Client (no payment / no API keys)

| File | Change |
|------|--------|
| `client/index.html` | og:image width/height/alt, twitter:image:alt, BreadcrumbList, WebPage primaryImageOfPage + dateModified. |
| `client/public/robots.txt` | Both sitemaps listed (sitemap-index.xml, sitemap.xml). |
| `client/src/pages/LocationPage.tsx` | setMeta for og:image:width, og:image:height, og:image:alt, twitter:image:alt. |
| `client/src/pages/Blog.tsx` | setMetaTag for og:image:width, og:image:height, twitter:image:alt. |

None of these read or set any env, API keys, or secrets.

### Worker (`worker/index.ts`)

| Change | What it does | Touches env/secrets? |
|--------|--------------|----------------------|
| `/cancel` in PAGE_META and noindexPaths | Sends noindex for `/cancel`. | No. |
| Breadcrumb schema | Normalizes URL (no trailing slash) in BreadcrumbList JSON-LD. | No. |
| `/api/seo-page` on error | Returns 503 + Retry-After instead of 500. | No. |
| `/l/:country/:pageType/:slug` crawler on throw | Returns 503 + Retry-After HTML instead of calling next(). | No. |
| Location crawler HTML | Added og:image:width, og:image:height, og:image:alt, twitter:image:alt. | No. |
| Catch-all `*` | If path has trailing slash (except `/`), 301 redirect to non–trailing slash. | No. |

We did **not** change: `worker/routes/checkout.ts`, `worker/routes/trial.ts`, `worker/routes/webhook.ts`, or how the Worker mounts `/api/checkout`, `/api/stripe`, `/api/free-trial`. We did not add or remove any `c.env.*` usage for Stripe, Resend, or Supabase.

---

## 2. What the deploy does

1. Checkout `clean-main`, install deps, run migrations/seeds (if configured), build with Vite + worker.
2. **Deploy** `dist` to Cloudflare Pages project `streamerstickpro-live`, branch `clean-main`.
3. Purge cache (if `CLOUDFLARE_ZONE_ID` is set), wait, ping sitemaps.

The Worker on Cloudflare runs with **only** the Environment variables (and Secrets) you set in **Cloudflare Dashboard → Pages → streamerstickpro-live → Environment variables** for the environment that serves the request (Production/Preview). This workflow does **not** run any script that updates those variables or secrets.

---

## 3. What might happen

- **Normal:** New deployment goes live with the SEO changes. Checkout and trial keep working if the **same** env is still set in Cloudflare for that project/environment (we didn’t change it).
- **Checkout or trial fails after this deploy:** Then the cause is not “we changed your env” (we don’t touch it). Possible causes:
  1. **Different deployment or environment** – The domain might be pointing at a different deployment or env (e.g. Preview vs Production) that doesn’t have the same env set in the Dashboard.
  2. **Cloudflare env not set for this deploy** – Sometimes a new deployment can inherit from a different env set. Check that the deployment that is “live” (the one your domain uses) has the correct Environment variables in the Dashboard for that environment.
  3. **Code path** – Unlikely, but if we ever changed a route or how the Worker loads, a bug could prevent env from being read. We did not change checkout/trial/webhook routes or their `c.env` usage.

---

## 4. If something breaks: where it went wrong and how to fix it

| Symptom | Where to look | What to do |
|--------|----------------|------------|
| Checkout or trial fails right after this SEO deploy | Which deployment is live (Cloudflare Pages → Deployments) and which env that deployment uses (Production vs Preview). | 1) In Cloudflare, open that deployment’s environment and confirm all required vars (Stripe, Resend, Supabase, SESSION_SECRET) are set. 2) If you want to revert immediately: roll back to the last known-good deployment (e.g. **4a86d30c**). |
| `/api/health` shows stripe/resend/supabase false | Worker for the current deployment is not seeing those env vars. | Check **Pages → streamerstickpro-live → Settings → Environment variables** for the environment that serves your domain. Add or fix the vars there. No code change needed. |
| Site looks wrong or 404s | Build or deploy artifact. | Check the GitHub Actions build log for the deploy; confirm `dist` and Worker build succeeded. Redeploy from the same branch if needed. |
| Sitemaps or SEO behavior wrong | Worker or client SEO changes (sitemap routes, redirects, meta). | See “What we did” above; we can revert specific Worker/client SEO edits if you want to isolate. |

**Rollback (instant):** In Cloudflare Pages → streamerstickpro-live → Deployments, open the deployment **4a86d30c** (commit 635a725) and use “Rollback to this deployment” (or equivalent). That restores the previous working state without touching your env.

---

## 5. Summary

- **We did not add or remove any step that writes to your env or secrets.** The sync-secrets step was removed so the workflow never overwrites Cloudflare env.
- **All SEO changes** are in client (meta, robots, LocationPage, Blog) and Worker (noindex, 503, 301, OG tags, breadcrumb). No changes to checkout/trial/webhook code or to how env is read.
- **If something breaks:** It’s not because we “changed or misplaced” your env. Check which deployment is live and that its environment has the right vars in the Dashboard; roll back to **4a86d30c** if you need the previous working state immediately.
