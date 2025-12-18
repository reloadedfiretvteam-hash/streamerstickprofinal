# GitHub Secrets Configuration

This document lists all the secrets required to run StreamStickPro independently via GitHub Actions, deploying to Cloudflare Pages with Supabase as the database.

## Required Secrets

Add these secrets in your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

### Cloudflare (Deployment)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages permissions | Cloudflare Dashboard → Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Cloudflare Dashboard → any domain → Overview → right sidebar |

### Supabase (Database)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_DATABASE_URL` | Direct PostgreSQL connection string | Supabase Dashboard → Project Settings → Database → Connection string (URI) |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side) | Supabase Dashboard → Project Settings → API → service_role key |

**SUPABASE_DATABASE_URL Format:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Stripe (Payments)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Developers → Webhooks → endpoint → Signing secret |

### Resend (Email)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `RESEND_API_KEY` | Resend API key for sending emails | Resend Dashboard → API Keys |

### Application Security

| Secret Name | Description | Recommended Value |
|-------------|-------------|-------------------|
| `ADMIN_USERNAME` | Admin panel login username | Your choice |
| `ADMIN_PASSWORD` | Admin panel login password | Strong password (16+ chars) |
| `SESSION_SECRET` | Session encryption key | Random 32+ character string |
| `JWT_SECRET` | JWT token signing key | Random 32+ character string |

## Generate Secure Secrets

Run this command to generate random secrets:

```bash
# Generate random secret
openssl rand -base64 32
```

## Verify Setup

After adding all secrets, push to the `clean-main` branch. The GitHub Actions workflow will:

1. Run database migrations on Supabase
2. Build the application
3. Deploy to Cloudflare Pages
4. Sync secrets to Cloudflare Pages environment

## Manual Migration

To run migrations manually:

1. Go to **Actions** tab in GitHub
2. Select **Run Database Migration**
3. Click **Run workflow**

## Architecture

```
GitHub Repository (clean-main branch)
    ↓
GitHub Actions (build + migrate)
    ↓
┌─────────────────────────────────────────┐
│                                         │
│  Cloudflare Pages    ←───→   Supabase   │
│  (Frontend + API)          (PostgreSQL) │
│                                         │
│  Custom Domain:                         │
│  streamstickpro.com                     │
│  secure.streamstickpro.com              │
│                                         │
└─────────────────────────────────────────┘
```

## No Replit Dependencies

This system runs entirely on:
- **GitHub** - Code repository and CI/CD
- **Cloudflare** - Hosting and edge functions
- **Supabase** - PostgreSQL database
- **Stripe** - Payment processing
- **Resend** - Transactional emails

No Replit services are used in production.
