# Working Deployment Evaluation + SEO Safe Rollout

**Purpose:** Roll back to a working state, then add SEO fixes/updates **without** breaking checkout or free trial. If something fails, you know exactly why and how to fix it.

---

## 1. Current good deployment (confirmed)

This is the deployment that is **live and working** (checkout + trial). Use it as the rollback target if a future deploy fails.

| Item | Value |
|------|--------|
| **Deploy URL** | **https://4a86d30c.streamerstickpro-live.pages.dev** |
| **Aliases** | streamstickpro.com, secure.streamstickpro.com |
| **Commit** | **635a725** – "Add activation time notice (1-3 hrs, usually 15 min during business hours) to trial email" |
| **Branch** | clean-main |
| **Repo** | reloadedfiretvteam-hash/streamerstickprofinal |
| **Deployed** | 11:13 PM February 18, 2026 · Duration 58s · Status Success |
| **Project** | Cloudflare Pages **streamerstickpro-live** |

**What “working” means:** Stripe checkout completes; free trial form submits and trial email is sent. This deployment has the correct **Environment variables** set in Cloudflare for the Worker (Stripe, Resend, Supabase).

**How to confirm your live deployment is working**

1. Open **https://streamstickpro.com/api/health** (or your live URL). You should see something like `stripe: true`, `resend: true`, `supabase: true`.
2. **Checkout:** Add a product → checkout → pay with test card. Should redirect to success.
3. **Trial:** Open **https://streamstickpro.com/36hr-trial** → submit with a real email. Trial email should arrive.

If all three pass, that **deployment** (and its env) is your working state. The **code** in the repo can be ahead of that deployment; what matters for “working” is that the **deployed Worker has the right env**.

---

## 2. Why deployments “fail” (so you always know why)

Failures are **not** caused by SEO or layout code. They are caused by:

| Cause | What happens | How to fix |
|-------|----------------|------------|
| **Worker missing env for the live deploy** | New deploy goes out, but the **environment** (Production or Preview) that serves streamstickpro.com does not have `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, or Supabase vars. Checkout and/or trial fail. | Set **Variables and Secrets** in Cloudflare: **Pages → streamerstickpro-live → Settings → Environment variables**. Add the same vars for **Production** (and **Preview** if your live branch uses it). Then redeploy or roll back to a deploy that already had them. |
| **Sync-secrets step didn’t run or failed** | The workflow step “Sync secrets to Cloudflare Pages” uses GitHub Secrets. If a secret is missing, the script exits 1; the step has `continue-on-error: true`, so the deploy still runs but **without** pushing new secrets. The new deploy can then run with old or empty env. | In **GitHub → repo → Settings → Secrets and variables → Actions**, add every secret the workflow and `sync-secrets-to-cloudflare-pages.mjs` need (see list below). Re-run the workflow so the sync step runs successfully. |
| **Wrong branch / Preview vs Production** | If the live site is served from a **Preview** deployment (e.g. branch `clean-main`), that Preview environment must have the same secrets as Production. | In Cloudflare Pages → streamerstickpro-live → **Environment variables**, configure **Preview** as well as **Production** with the same keys. |

**Required env for checkout + trial (Worker must have these at runtime)**

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (and optionally `RESEND_FROM_EMAIL`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (or equivalent service role)
- `SESSION_SECRET`

These are the same vars the sync script pushes. If the Worker has them, checkout and trial work. If not, they fail.

---

## 3. SEO-only changes (safe to deploy)

These changes **do not** touch payment or trial logic. They only affect meta, redirects, status codes, and noindex.

### Client (no Worker/payment code)

| File | Change |
|------|--------|
| **client/index.html** | og:image width/height/alt, twitter:image:alt, BreadcrumbList, WebPage primaryImageOfPage + dateModified. |
| **client/public/robots.txt** | Both sitemaps: sitemap-index.xml and sitemap.xml. |
| **client/src/pages/LocationPage.tsx** | og:image:width, og:image:height, og:image:alt, twitter:image:alt. |
| **client/src/pages/Blog.tsx** | og:image:width, og:image:height, twitter:image:alt (and existing og:image:alt). |

### Worker (SEO behavior only; checkout/trial routes unchanged)

| Change | What it does |
|--------|----------------|
| **/cancel noindex** | PAGE_META + noindexPaths include `/cancel` so GSC doesn’t index the Stripe cancel URL. |
| **BreadcrumbList URL** | Schema URLs normalized (no trailing slash) to match canonical. |
| **/api/seo-page** | On error returns **503** with **Retry-After: 60** instead of 500 (GSC retries). |
| **/l/* crawler** | On throw returns **503** with Retry-After instead of falling through to SPA (fewer 5xx). |
| **Location OG** | Crawler HTML for `/l/*` gets og:image:width, og:image:height, og:image:alt, twitter:image:alt. |
| **Trailing slash** | Any path with trailing slash (except `/`) gets **301** to non-trailing URL (e.g. `/blog/` → `/blog`). |

**Verified:** Worker still mounts `/api/checkout`, `/api/stripe`, `/api/free-trial` the same way. No changes to `worker/routes/checkout.ts`, `worker/routes/trial.ts`, or `worker/routes/webhook.ts` in this SEO pass.

---

## 4. Pre-deploy checklist (avoid failure)

Before you push and deploy (or run the workflow):

1. **Cloudflare (recommended)**  
   In **Cloudflare Dashboard → Pages → streamerstickpro-live → Settings → Environment variables**, ensure **Production** (and **Preview** if the live site uses it) has:
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
   - `SESSION_SECRET`  
   Then any new deploy will have secrets even if the sync step fails.

2. **GitHub Secrets (for sync step)**  
   In **GitHub → repo → Settings → Secrets and variables → Actions**, ensure:
   - `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
   - Same Stripe, Resend, Supabase, and `SESSION_SECRET` as above  

   So the “Sync secrets to Cloudflare Pages” step can push them to both Production and Preview.

3. **Deploy**  
   Push to `clean-main` (or run the workflow). The build will include the SEO changes; the Worker will use whatever env is in Cloudflare for that deployment.

---

## 5. Post-deploy verification (confirm nothing failed)

Right after deploy:

1. **Health**  
   Open **https://streamstickpro.com/api/health**. Expect `stripe: true`, `resend: true`, `supabase: true`. If any is `false`, that env var is missing for **this** deployment → fix in Cloudflare (and/or re-run sync).

2. **Checkout**  
   Add product → checkout → complete (test card). Should redirect to success.

3. **Trial**  
   Open **https://streamstickpro.com/36hr-trial**, submit with a real email. Trial email should arrive.

If any of these fail, the cause is **env for the deployment that’s live** (see §2). Fix env in Cloudflare (and GitHub Secrets if you use sync), then redeploy or roll back in Cloudflare to the last working deployment.

---

## 6. Summary

- **Working deployment** = the Cloudflare Pages deployment that currently serves your site and has the env vars above set for its environment (Production/Preview).
- **SEO updates** in this doc are limited to client meta/robots and Worker SEO behavior; they do not change checkout or trial code.
- **If the site “fails” after a deploy**, it’s because the Worker for that deploy is missing Stripe/Resend/Supabase env. Fix by setting Variables and Secrets in Cloudflare (and optionally fixing GitHub Secrets and re-running the sync step), then redeploy or roll back.
