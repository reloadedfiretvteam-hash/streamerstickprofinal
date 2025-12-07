# StreamStickPro - Complete System Credentials & Access Guide

## Admin Panel Access

**URL:** https://your-domain.com/admin  
**Username:** `admin`  
**Password:** `admin123`

---

## Supabase (Image Storage)

**Dashboard:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm  
**Project URL:** https://emlqlmfzqsnqokrqvmcm.supabase.co  
**Storage Bucket:** `imiges`

### Current Products in Database:
- 3 Fire Stick products (all have images)
- 24 IPTV subscription products (all have images)

---

## GitHub Repository

**Repository:** reloadedfiretvteam-hash/streamerstickprofinal  
**Branch:** clean-main  
**Latest Commit:** d9afbf9aa790189372b882f869a646b913179cc8  
**URL:** https://github.com/reloadedfiretvteam-hash/streamerstickprofinal

---

## Cloudflare Pages (Live Deployment)

**Project Name:** streamerstickpro-live  
**Live Domain:** streamstickpro.com  
**Deployment:** Automatic from GitHub (clean-main branch)

### Required Environment Variables in Cloudflare:
Check these in Cloudflare Dashboard > Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe live secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe live publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `RESEND_API_KEY` | Email sending API key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

**IMPORTANT:** If `ADMIN_PASSWORD_HASH` exists in Cloudflare env vars, DELETE IT so the default admin credentials work.

---

## Stripe (Payments)

**Dashboard:** https://dashboard.stripe.com

### Webhook Endpoint:
**URL:** https://streamstickpro.com/api/stripe/webhook  
**Events to listen for:**
- `checkout.session.completed`
- `payment_intent.succeeded`

---

## Resend (Email)

**Dashboard:** https://resend.com/overview

Email templates are built into the application code:
- Order confirmation (sent immediately)
- Credentials email (sent 5 minutes after purchase)

---

## IPTV Portal (Customer Access)

**Portal URL:** http://ky-tv.cc  
**Setup Video:** https://www.youtube.com/watch?v=f2clKKw2HZ8

Customers receive credentials via email after purchase.

---

## Replit Environment Variables

These are already configured in your Replit project:

### Public Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SECURE_HOSTS`
- `VITE_STORAGE_BUCKET_NAME`

### Secrets (Values Hidden):
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_LIVE_SECRET_KEY`
- `STRIPE_LIVE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_KEY`
- `GITHUB_PERSONAL_ACCESS_TOKEN`
- Database: `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

---

## Quick Troubleshooting

### Admin Login Not Working?
1. Check if `ADMIN_PASSWORD_HASH` exists in environment
2. If it does, delete it - the default password will then work
3. Default: admin / StreamStick2024!

### Images Not Loading?
1. Check Supabase bucket is public
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Bucket name should be `imiges`

### Payments Not Processing?
1. Verify Stripe keys are for LIVE mode (not test)
2. Check webhook secret matches Stripe dashboard
3. Ensure webhook endpoint is accessible

### Emails Not Sending?
1. Verify `RESEND_API_KEY` is set
2. Check Resend dashboard for delivery status
3. Verify sender domain is configured

---

## Support

For technical issues with the platform code, refer to:
- `replit.md` - Technical architecture documentation
- `README.md` - Setup instructions
