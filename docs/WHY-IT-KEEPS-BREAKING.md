# Why Checkout/Trials Keep Breaking Every Time We Try

## Root cause (comparison)

| When it works | When it breaks |
|---------------|----------------|
| A deploy where the **Worker actually gets** STRIPE_SECRET_KEY and RESEND_API_KEY at runtime | A deploy where the Worker runs **without** those secrets (stripe: false, resend: false in `/api/health`) |
| Same code, same workflow — the only difference is **which Cloudflare environment** serves the site | We deploy to branch **clean-main**. Secrets are synced only to **Production**. If the project’s **Production branch** in Cloudflare is **not** clean-main, the live site is a **Preview** deployment and never gets Production secrets. |

So: **it’s not the code or the “SEO fix” or the homepage overhaul.** It’s that the deployment that goes live (clean-main) is often a **Preview** deployment, and we only synced secrets to **Production**.

---

## Why this happens

1. **Workflow** deploys with:
   - `pages deploy dist --project-name=streamerstickpro-live --branch=clean-main`
2. **Sync step** runs:
   - `wrangler pages secret bulk ... --env production`
   - So secrets are only set for the **Production** environment.
3. In Cloudflare Pages:
   - **Production** = the branch you set as “Production branch” in the project (e.g. `main`).
   - **Preview** = every other branch (e.g. `clean-main`).
4. If the **Production branch** in the Dashboard is **main** (or anything other than **clean-main**), then:
   - Pushing to **clean-main** creates a **Preview** deployment.
   - That deployment uses **Preview** environment variables.
   - We never set secrets for Preview → Worker has no Stripe/Resend → checkout and trials break.

So “every time we try” = we push to clean-main → Preview deploy goes live → no secrets in Preview → break. It “worked” before either because (a) Production branch was once set to clean-main, or (b) secrets were manually added in the Dashboard for Preview, or (c) you were looking at a different deployment.

---

## Fix applied in this repo

1. **Sync to both environments**  
   The sync script now runs **twice**: once for `--env production` and once for `--env preview`. So whether the live site is served from Production or Preview (e.g. clean-main), the Worker gets the same secrets.

2. **Dashboard fallback (one-time)**  
   In Cloudflare: **Workers & Pages** → **streamerstickpro-live** → **Settings** → **Variables and Secrets** → add **STRIPE_SECRET_KEY** and **RESEND_API_KEY** for **both Production and Preview**. Then redeploy. That way even if sync ever fails, the Worker still has them.

3. **Smoke test**  
   The workflow already has a step that calls `/api/health` and fails the job if `stripe` or `resend` is false. So if sync or Dashboard is wrong, the run fails instead of shipping a broken site.

---

## Quick check after each deploy

- Open: `https://streamstickpro.com/api/health`
- You want: `"stripe": true`, `"resend": true`, `"supabase": true`, `"status": "ok"`.
- If any binding is false, the Worker is missing that secret for the environment that’s serving the site; fix sync and/or Dashboard as above.
