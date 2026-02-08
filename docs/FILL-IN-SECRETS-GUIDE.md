# Fill-In Secrets Guide — Cloudflare + Supabase + GitHub

Use this checklist to add your **Cloudflare** and **Supabase** (and related) credentials in the right places.  
**Where to get each value** is listed so you can paste your own tokens.

---

## 1. GitHub Secrets (for deploy + migrations)

**Go to:** Your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these **exact names** (values are yours):

| Secret name | Where to get the value |
|-------------|------------------------|
| `CLOUDFLARE_API_TOKEN` | **Cloudflare:** Dashboard → My Profile → API Tokens → Create Token → use “Edit Cloudflare Workers” or custom with **Cloudflare Pages: Edit** permission. Copy the token. |
| `CLOUDFLARE_ACCOUNT_ID` | **Cloudflare:** Open any domain or Workers & Pages; in the right sidebar or URL you’ll see **Account ID** (e.g. `a1b2c3d4e5f6...`). |
| `DATABASE_URL` | **Supabase:** Project → Settings → Database → **Connection string** (URI). Use **Transaction** or **Session** mode, include your DB password. Example shape: `postgresql://postgres.[ref]:[YOUR_PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require` |
| `VITE_SUPABASE_URL` | **Supabase:** Project → Settings → API → **Project URL** (e.g. `https://xxxxx.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | **Supabase:** Project → Settings → API → **anon public** key (long JWT). |
| `SUPABASE_SERVICE_KEY` | **Supabase:** Project → Settings → API → **service_role** key (long JWT). Keep secret. |
| `STRIPE_SECRET_KEY` | **Stripe:** Dashboard → Developers → API keys → **Secret key** (e.g. `sk_live_...`). |
| `STRIPE_PUBLISHABLE_KEY` | **Stripe:** Dashboard → Developers → API keys → **Publishable key** (e.g. `pk_live_...`). |
| `RESEND_API_KEY` | **Resend:** resend.com → API Keys → create or copy key (e.g. `re_...`). |
| `SESSION_SECRET` | Any long random string (e.g. 32+ chars). Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

---

## 2. Cloudflare Pages (runtime env for streamerstickpro-live)

**Go to:** **Cloudflare Dashboard** → **Workers & Pages** → **streamerstickpro-live** → **Settings** → **Environment variables** (Production).

Add or confirm (values are yours):

| Variable name | Where to get the value |
|---------------|------------------------|
| `STRIPE_WEBHOOK_SECRET` | **Stripe:** Developers → Webhooks → your endpoint → **Signing secret** (e.g. `whsec_...`). |
| `ADMIN_USERNAME` | Your chosen admin login username. |
| `ADMIN_PASSWORD` | Your chosen admin login password. |
| `SUPABASE_SERVICE_KEY` | Same as in GitHub (Supabase → Settings → API → service_role key). |
| `STRIPE_SECRET_KEY` | Same as in GitHub (Stripe secret key). |
| `STRIPE_PUBLISHABLE_KEY` | Same as in GitHub (Stripe publishable key). |
| `RESEND_API_KEY` | Same as in GitHub (Resend API key). |
| `RESEND_FROM_EMAIL` | e.g. `noreply@streamstickpro.com` (must be verified in Resend). |
| `VITE_SUPABASE_URL` | Same as in GitHub (Supabase project URL). |
| `VITE_SUPABASE_ANON_KEY` | Same as in GitHub (Supabase anon key). |
| `VITE_SECURE_HOSTS` | `secure.streamstickpro.com` (if you use a shadow domain). |
| `VITE_STORAGE_BUCKET_NAME` | `imiges` (your Supabase storage bucket). |
| `SITE_URL` | `https://streamstickpro.com` |
| `NODE_ENV` | `production` |

Optional: `JWT_SECRET`, `SESSION_SECRET`, `GITHUB_TOKEN`, `OPENAI_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (for admin-triggered deploy or AI features).

---

## 3. Supabase (database + API)

- **Migrations:** If `DATABASE_URL` is set in GitHub Secrets, the deploy workflow runs the SEO migrations (schema, 50 location pages, redirects, 300 experts, etc.).  
- **Manual option:** Supabase → **SQL Editor** → run these files in order:  
  `20260207000001_seo_domination_schema.sql` → `000002` → `000003` → `000004` → `000005` → `000006`.

No “access token” is needed inside Supabase for the app; the app uses **Project URL** + **anon** and **service_role** keys (set in GitHub and Cloudflare above).

---

## 4. Quick check after filling

1. **GitHub:** Settings → Secrets and variables → Actions → all names from section 1 present (no typos).  
2. **Cloudflare:** Workers & Pages → streamerstickpro-live → Settings → Environment variables → section 2 variables set for Production.  
3. **Deploy:** Push to `clean-main` (or re-run the “Deploy to Cloudflare Pages” workflow).  
4. If **Run Database Migration** fails: check `DATABASE_URL` (correct URI and password).  
5. If **Deploy to Cloudflare Pages** fails: check `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

---

## Note about tokens from past chats

I don’t have access to earlier conversations (e.g. “the last 11 hours”), so I can’t see any Cloudflare or Supabase tokens you may have shared there. Use the **Where to get the value** columns above and paste your own tokens into **GitHub Secrets** and **Cloudflare Environment variables**. If you had tokens in a previous chat, get them again from Cloudflare and Supabase dashboards and fill them in using this guide.
