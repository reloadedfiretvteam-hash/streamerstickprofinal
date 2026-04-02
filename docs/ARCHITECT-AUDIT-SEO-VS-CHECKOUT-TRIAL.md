# Architect Audit: Why SEO Deploys Break Trial & Checkout (and the one fix)

**Conclusion:** SEO code does **not** run in the path of checkout or trial. Trial/checkout fail only when the **deployment** that serves your domain does not have **Environment Variables** set in Cloudflare for that deployment’s **environment** (Production vs Preview). The fix is to set the same variables for **both** environments once.

---

## 1. How checkout and trial work (request flow)

| Step | What happens |
|------|----------------|
| **Checkout** | Client POSTs to `/api/checkout`. Worker `createCheckoutRoutes()` runs. Uses `c.env.STRIPE_SECRET_KEY`, `getStorage(c.env)`. Creates Stripe session, returns URL. |
| **Trial** | Client POSTs to `/api/free-trial`. Worker `createTrialRoutes()` runs. Uses `c.env.RESEND_FROM_EMAIL`, Resend API (`c.env.RESEND_API_KEY`), `getStorage(c.env)`. Sends email. |
| **Env source** | `c.env` is injected by **Cloudflare** at request time. It comes from the **Pages project** → **Environment variables** (Production or Preview). The Worker bundle does **not** bake in secrets; build only sets `process.env.NODE_ENV`. |

So if `c.env.STRIPE_SECRET_KEY` or `c.env.RESEND_API_KEY` (or Supabase vars) are missing for the Worker that handles the request, checkout/trial fail. There is no other way for them to fail from code.

---

## 2. Every “SEO” change and whether it touches that flow

### Client

| File | Change | In request path for /api/checkout or /api/free-trial? |
|------|--------|--------------------------------------------------------|
| index.html | Meta, og, schema | No. Only affects HTML. API calls are fetch() to /api/*. |
| robots.txt | Sitemaps | No. Not in API path. |
| LocationPage.tsx | setMeta(og:image:*) | No. Runs on location pages only. Checkout/trial are other routes. |
| Blog.tsx | setMetaTag(og:image:*) | No. Same. |

### Worker (when we had added SEO here)

| Change | What it does | In request path for /api/checkout or /api/free-trial? |
|--------|--------------|--------------------------------------------------------|
| Trailing slash redirect | Inside `app.get('*', ...)`. Only runs for **GET** requests that **did not match** any other route. | No. POST /api/checkout and POST /api/free-trial are matched by `app.route('/api/checkout', ...)` and `app.route('/api/free-trial', ...)` **before** the catch-all. |
| /cancel noindex | PAGE_META and noindexPaths. Only used when injecting meta into HTML for **page** requests. | No. Not used for /api/*. |
| Breadcrumb / 503 / location OG | Same: only for page routes or /l/*, /api/seo-page. | No. /api/checkout and /api/free-trial are separate route modules. |

**Verdict:** No SEO change (client or worker) runs in the path of `/api/checkout` or `/api/free-trial`. So **SEO does not sabotage checkout or trial by code.**

---

## 3. Why it breaks: Cloudflare Production vs Preview

- Your workflow runs on **clean-main** and runs:  
  `pages deploy dist --project-name=streamerstickpro-live --branch=clean-main`
- In Cloudflare Pages, **one branch** is the “Production” branch (e.g. **main** or **clean-main**). All other branches are **Preview**.
- Each deployment gets env from **one** of:
  - **Production** (only for the Production branch),
  - **Preview** (for every other branch).
- If **clean-main** is **not** the Production branch, then **every** deploy from your workflow is a **Preview** deployment and uses **Preview** environment variables.
- If you only ever set variables under **Production**, then **Preview** has no (or different) vars → the new deployment has no Stripe/Resend/Supabase → trial and checkout fail.
- When you **roll back** to 4a86d30c, you are serving a **previous** deployment. That deployment might have been created when the project still had different settings (e.g. clean-main was Production, or Preview had been set once). So the old deployment “works” and the new one doesn’t, even though the code path for checkout/trial is unchanged.

So the failure is **which environment the new deployment uses (Production vs Preview) and that environment not having the vars**. Not the SEO changes themselves.

---

## 4. The one fix (do this once)

Do this in **Cloudflare Dashboard** so **every** deployment (Production or Preview) has the same vars:

1. Open **Cloudflare Dashboard** → **Workers & Pages** → **streamerstickpro-live** → **Settings** → **Environment variables**.
2. You’ll see **Production** and **Preview** (and possibly “Edit variables” per environment).
3. For **Production**: add (or confirm) every variable the Worker needs:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (e.g. `noreply@streamstickpro.com`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_ROLL_KEY` if that’s what you use)
   - `SESSION_SECRET`
4. **Do the same list for Preview** (same names, same values). So both environments have identical vars.
5. Save.

After that, **any** new deployment (whether it’s treated as Production or Preview) will have the vars. Checkout and trial will keep working when you add SEO and deploy.

---

## 5. Checklist before you deploy again

- [ ] In Cloudflare: **streamerstickpro-live** → **Settings** → **Environment variables**.
- [ ] **Production**: all of the vars in §4 are set and saved.
- [ ] **Preview**: the **same** vars are set and saved.
- [ ] Then push to **clean-main** (or run the deploy workflow). New deployment will have env; trial and checkout should work with your SEO changes.

No code change is required for trial/checkout to work. The only requirement is that the deployment’s environment (Production or Preview) has the variables set in Cloudflare.
