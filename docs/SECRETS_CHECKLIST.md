# GitHub Actions & Cloudflare Secrets Checklist

Use this to verify **Settings → Secrets and variables → Actions** (and Cloudflare Pages env) for the `clean-main` deploy.

---

## Required for workflow (GitHub repo secrets)

These **exact names** are used in `.github/workflows/deploy-cloudflare.yml`. Add or fix in **GitHub → Your repo → Settings → Secrets and variables → Actions**.

| Secret name | Used in workflow step | What to set |
|-------------|------------------------|-------------|
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages | Cloudflare API token with **Account** read + **Workers Scripts** edit (or **Cloudflare Pages** edit). Create at: Dashboard → My Profile → API Tokens → Create Token → “Edit Cloudflare Workers” or custom with Pages permissions. |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy to Cloudflare Pages | In Cloudflare Dashboard, open any domain or Workers; the URL or Overview page shows **Account ID**. |
| `VITE_SUPABASE_URL` | Build for Cloudflare Workers | Your Supabase project URL, e.g. `https://xxxxx.supabase.co`. Same as in `wrangler.toml` vars. |
| `VITE_SUPABASE_ANON_KEY` | Build for Cloudflare Workers | Supabase **anon** (public) key from Project Settings → API. Safe to be in build (client bundle). |
| `SUPABASE_SERVICE_KEY` | Build for Cloudflare Workers | Supabase **service_role** key from Project Settings → API. Keep secret; used by worker for admin/DB. |
| `DATABASE_URL` | Run Database Migration + Build | Supabase direct Postgres URL: Project Settings → Database → Connection string (URI). Use “Session mode” or “Transaction” URI with password. Needed for `scripts/run-supabase-migration.ts` and build if migration runs. |
| `STRIPE_SECRET_KEY` | Build for Cloudflare Workers | Stripe **Secret key** (starts with `sk_live_` or `sk_test_`). Dashboard → Developers → API keys. |
| `STRIPE_PUBLISHABLE_KEY` | Build for Cloudflare Workers | Stripe **Publishable key** (starts with `pk_live_` or `pk_test_`). |
| `RESEND_API_KEY` | Build for Cloudflare Workers | Resend API key from resend.com (API Keys). Used for order/trial/broadcast emails. |
| `SESSION_SECRET` | Build for Cloudflare Workers | Any long random string (e.g. 32+ chars) for admin session signing. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

---

## Not in workflow but required at runtime (Cloudflare Pages)

Set these in **Cloudflare Dashboard → Workers & Pages → streamerstickpro-live → Settings → Environment variables** (production and optionally preview). The build does not pass these; they must be in Cloudflare.

| Variable name | Required | What to set |
|---------------|----------|-------------|
| `STRIPE_WEBHOOK_SECRET` | Yes (for Stripe webhooks) | Stripe webhook **Signing secret** (starts with `whsec_`). Created when you add an endpoint in Stripe → Developers → Webhooks. |
| `ADMIN_USERNAME` | Recommended | Admin panel login username. |
| `ADMIN_PASSWORD` | Recommended | Admin panel login password. |
| `JWT_SECRET` | Recommended | Same idea as SESSION_SECRET; used for JWT signing. Can reuse a long random string. |
| `RESEND_FROM_EMAIL` | Optional override | e.g. `noreply@streamstickpro.com`. Already in `wrangler.toml` as var; override here if needed. |

---

## Optional (for extra features)

| Name | Where | Purpose |
|------|--------|--------|
| `GITHUB_TOKEN` or `GITHUB_ACCESS_TOKEN` | Cloudflare env | Admin “push to GitHub” / AI assistant GitHub actions. |
| `OPENAI_API_KEY` | Cloudflare env | AI assistant features. |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Cloudflare env | Only if admin triggers deploy from UI; workflow already uses GitHub Secrets. |

---

## Quick verification

1. **GitHub**  
   - Repo → **Settings → Secrets and variables → Actions**.  
   - Confirm every name in the first table exists (no typos: e.g. `VITE_SUPABASE_URL` not `VITE_SUPABASE_UR`).

2. **Values**  
   - **Supabase:** Same URL/keys as in Supabase Dashboard and in `wrangler.toml` vars.  
   - **Stripe:** Keys from the same Stripe account (and same live/test mode) you use for the site.  
   - **Cloudflare:** Token has Pages (or Workers) deploy permission; Account ID matches the account that owns the Pages project.

3. **Cloudflare Pages env**  
   - **Workers & Pages → streamerstickpro-live → Settings → Environment variables.**  
   - Ensure `STRIPE_WEBHOOK_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and optionally `JWT_SECRET` are set for production.

4. **After a deploy**  
   - If the workflow fails on “Run Database Migration”, check `DATABASE_URL` (correct URI and password).  
   - If it fails on “Deploy to Cloudflare Pages”, check `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.  
   - If the site loads but checkout or webhooks fail, check Stripe keys and `STRIPE_WEBHOOK_SECRET` in Cloudflare.

---

## Reference: workflow secret usage

```yaml
# Migration (optional, continue-on-error)
SUPABASE_DATABASE_URL: ${{ secrets.DATABASE_URL }}

# Build
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SECURE_HOSTS, VITE_STORAGE_BUCKET_NAME,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, SUPABASE_SERVICE_KEY, DATABASE_URL,
RESEND_API_KEY, SESSION_SECRET

# Deploy
apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

No other secret names are used in the workflow file.
