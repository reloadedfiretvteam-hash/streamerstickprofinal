# GitHub Secrets Checklist – Deploy & 25K URLs (clean-main only)

**Use this after you rotate/revoke any keys.** Add these in **GitHub → repo → Settings → Secrets and variables → Actions**. No values go in this doc or in code.

## Required for build & deploy

| Secret | Where to get it | Used for |
|--------|------------------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Edit Cloudflare Workers, Read account) | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar or Workers & Pages → overview | Deploy to Cloudflare Pages |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Build + 25K seed (Supabase client) |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public | Build (client env) |
| `SUPABASE_SERVICE_KEY` **or** `SUPABASE_SERVICE_ROLE_KEY` **or** `SUPABASE_SERVICE_ROLL_KEY` | Supabase → Project Settings → API → service_role (secret) | 25K seed (writes to `seo_architecture`) |
| `SUPABASE_DATABASE_URL` **or** `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI, include password) | Migrations + optional 25K seed (DB script) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | Checkout / webhooks |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys | Build (client) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → signing secret | Webhook verification |
| `RESEND_API_KEY` | Resend.com → API Keys | Email (trial, etc.) |
| `SESSION_SECRET` | Any long random string (e.g. `openssl rand -hex 32`) | Admin/auth sessions |

## Optional but recommended

| Secret | Where to get it | Used for |
|--------|------------------|----------|
| `CLOUDFLARE_ZONE_ID` | Cloudflare → your domain (streamstickpro.com) → Overview → Zone ID | Cache purge after deploy (fresh sitemap/location pages) |

## 25K seed behavior

- If **VITE_SUPABASE_URL** + **SUPABASE_SERVICE_KEY** (or ROLE_KEY or ROLL_KEY) are set → workflow runs **Supabase client** 25K seed.
- Else if **SUPABASE_DATABASE_URL** or **DATABASE_URL** is set → workflow runs **DB script** 25K seed (`seed-25k-via-database-url.ts`).
- If none of the above → seed step is skipped (sitemap still works via build-time `location-pages.json` if present).

## Deployment

- **Branch:** Only **clean-main** triggers deploy. Push to `clean-main` to run the workflow.
- **After adding/rotating secrets:** Push an empty commit or re-run the workflow from Actions tab so the new keys are used.
