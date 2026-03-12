# Working Rollback (20fb10e) vs Current — Exact Comparison

You showed the **working rollback** = commit **20fb10e** (“Remove debug endpoints from marketing routes”). This doc compares that state to **current** so we see exactly what’s different.

---

## 1. Workflow: deploy-cloudflare.yml

| | **Working rollback (20fb10e)** | **Current** |
|---|-------------------------------|-------------|
| After “Build for Cloudflare Workers” | Next step is **“Deploy to Cloudflare Pages”** | New steps in between: **“Sync secrets to Cloudflare Pages”**, **“List Cloudflare Pages secrets”**, then **“Deploy to Cloudflare Pages”** |
| Sync secrets | **None** — no sync step | `node scripts/sync-secrets-to-cloudflare-pages.mjs` (pushes to production + preview) |
| List secrets | **None** | Lists production + preview secrets (continue-on-error) |
| After deploy | Purge cache, etc. | **“Wait for deploy”** (15s), then **“Smoke test – verify Worker has Stripe, Resend, Supabase”** (calls `/api/health`, fails job if any binding false) |
| Deploy command | Same | Same: `pages deploy dist --project-name=streamerstickpro-live --branch=clean-main` |

So the **only** workflow differences between working rollback and current are: we **added** sync, list-secrets, and smoke test. We did **not** change the deploy command or the build.

---

## 2. Scripts

| | **Working rollback (20fb10e)** | **Current** |
|---|-------------------------------|-------------|
| `scripts/sync-secrets-to-cloudflare-pages.mjs` | **Did not exist** | Exists; pushes same secrets to **production** and **preview** |

At 20fb10e there was no sync script in the workflow. Other scripts (e.g. `push-secrets-to-cloudflare.mjs`, `setup-cloudflare-secrets.mjs`) existed but were **not** run by the deploy workflow.

---

## 3. Why 20fb10e worked

At 20fb10e the workflow does **not** push secrets to Cloudflare. So for checkout/trials to work on that deploy, the Worker had to get STRIPE_SECRET_KEY and RESEND_API_KEY from somewhere else:

- **Cloudflare Dashboard** — they were (or still are) set under **Workers & Pages → streamerstickpro-live → Settings → Variables and Secrets** for the environment that serves the site (Production or Preview for branch clean-main).

So the working rollback didn’t work because of the workflow; it worked because **Dashboard already had those secrets** for the deployment that was live.

---

## 4. Why “every time we try” breaks now

- If we **only** sync to **production** and the live site is served from **preview** (e.g. branch clean-main when Production branch is main), the Worker never gets the synced secrets → health shows stripe/resend false → smoke test fails or site is broken.
- If the **sync step fails** (e.g. missing GitHub secret), the job fails before deploy (we don’t use continue-on-error on sync).
- If sync **succeeds** but only for one env, the deploy can still go out without secrets in the env that actually serves the request → breaks.

So the comparison is: **working rollback = no sync in pipeline, secrets from Dashboard**. Current = we **added** sync (and smoke test). To stop it breaking we need the Worker to have secrets in the **environment that serves the live site** — either by syncing to **both** production and preview (which we now do) or by keeping them set in the Dashboard for that project/env.

---

## 5. Summary

| Item | Working rollback (20fb10e) | Current |
|------|----------------------------|---------|
| Sync secrets in workflow | No | Yes (production + preview) |
| List secrets step | No | Yes |
| Smoke test after deploy | No | Yes (fail if stripe/resend/supabase missing) |
| Worker gets Stripe/Resend from | Dashboard only | Sync + Dashboard (if you set them there) |
| Deploy command / build | Same | Same |

So we’re **not** comparing two different rollbacks; we’re comparing **the rollback you said worked (20fb10e)** to **current**. The only structural difference is: we added sync + list + smoke test. The fix so it doesn’t keep breaking is: sync to **both** envs (done) and/or set STRIPE_SECRET_KEY and RESEND_API_KEY in the Dashboard for **streamerstickpro-live** (Production and Preview) so the Worker always has them.
