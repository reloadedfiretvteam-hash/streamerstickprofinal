# StreamStickPro - Deployment Secrets & Variables Guide

## Current Status: All Systems Working ✅

### Database Tables (PostgreSQL)
| Schema | Table | Status |
|--------|-------|--------|
| public | users | ✅ Ready |
| public | orders | ✅ Ready |
| public | real_products | ✅ Ready (6 products mapped) |
| stripe | products, prices, customers, etc. | ✅ Synced automatically |

### Real Products ↔ Shadow Products Mapping
| Real Product | Price | Shadow Product | Shadow Price |
|--------------|-------|----------------|--------------|
| Fire Stick HD | $140 | Web Design Basic | prod_TYEEobMjXf5B3d |
| Fire Stick 4K | $150 | Web Design Pro | prod_TYEEFruD8obUE7 |
| Fire Stick 4K Max | $160 | Web Design Enterprise | prod_TYEEeLmZMqrUxh |
| IPTV Monthly | $15 | SEO Monthly | prod_TYEEGWfwMr7GaA |
| IPTV Quarterly | $25 | SEO Quarterly | prod_TYEEL2hzSw0Irp |
| IPTV Annual | $75 | SEO Annual | prod_TYEEsyjzYv7Iwp |

---

## 🚨 IMPORTANT: Replit vs Cloudflare Deployment

### Option 1: Deploy on Replit (RECOMMENDED)
The app currently uses **Replit Connectors** which automatically manage:
- Stripe API keys (test in dev, live in production)
- Resend email API keys
- GitHub integration

**With Replit deployment, you need NO additional setup** - it just works!

### Option 2: Deploy on Cloudflare Pages/Workers
If deploying to Cloudflare, the code needs modification because Replit Connectors won't work there.

---

## Secrets Required for Cloudflare Deployment

⚠️ **SECURITY WARNING**: Never commit secrets to GitHub or expose them in code!

If you choose Cloudflare, you'll need to set these secrets in **Cloudflare Dashboard → Workers & Pages → Your Project → Settings → Environment Variables**:

### 🔐 Security Best Practices for Cloudflare Secrets
1. **Use "Encrypt" option** - Always mark secrets as encrypted in Cloudflare
2. **Never commit to Git** - Secrets should only exist in Cloudflare dashboard
3. **Separate environments** - Use different secrets for Preview vs Production
4. **Rotate regularly** - Change API keys periodically
5. **Limit permissions** - Use API keys with minimal required scopes

### 1. Database (PostgreSQL) - ENCRYPTED
```
DATABASE_URL = [encrypted] postgresql://user:password@host:port/database
```
**Security:** Use a hosted PostgreSQL with SSL/TLS (Neon, Supabase, Railway)
**Setup:** Create restricted database user with only needed permissions

### 2. Stripe (Payment Processing) - ENCRYPTED
```
STRIPE_SECRET_KEY = [encrypted] sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY = pk_live_xxxxxxxxxxxxx (can be public)
STRIPE_WEBHOOK_SECRET = [encrypted] whsec_xxxxxxxxxxxxx
```
**Get from:** https://dashboard.stripe.com/apikeys
**Security:** 
- Secret key must NEVER be exposed to client/browser
- Create a restricted API key with only needed permissions
- Webhook secret validates Stripe is the real sender

### 3. Resend (Email) - ENCRYPTED
```
RESEND_API_KEY = [encrypted] re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL = noreply@yourdomain.com
```
**Get from:** https://resend.com/api-keys
**Security:** Use API key with sending-only permission, no read access

### 4. Supabase (Image Storage)
```
VITE_SUPABASE_URL = https://emlqlmfzqsnqokrqvmcm.supabase.co (public)
VITE_SUPABASE_ANON_KEY = eyJ... (public - limited permissions)
SUPABASE_SERVICE_KEY = [encrypted] eyJ... (NEVER expose!)
VITE_STORAGE_BUCKET_NAME = imiges
```
**Security:** 
- Anon key is safe for client-side (limited by RLS policies)
- Service key has FULL access - keep encrypted, server-only

### 5. Application Configuration
```
NODE_ENV = production
```

---

## Current Replit Environment Variables ✅

### Shared Environment Variables (Already Set)
| Variable | Value | Status |
|----------|-------|--------|
| VITE_SUPABASE_URL | https://emlqlmfzqsnqokrqvmcm.supabase.co | ✅ |
| VITE_SUPABASE_ANON_KEY | eyJ... (set) | ✅ |
| VITE_STORAGE_BUCKET_NAME | imiges | ✅ |
| VITE_SECURE_HOSTS | secure.streamstickpro.com | ✅ |

### Secrets (Already Set)
| Secret | Status |
|--------|--------|
| SESSION_SECRET | ✅ Exists |
| SUPABASE_SERVICE_KEY | ✅ Exists |
| STRIPE_LIVE_PUBLISHABLE_KEY | ✅ Exists |
| STRIPE_LIVE_SECRET_KEY | ✅ Exists |
| DATABASE_URL | ✅ Exists (managed by Replit) |

### Replit Connectors (Auto-managed)
| Service | Connection Status |
|---------|-------------------|
| Stripe | ✅ Connected (auto switches test/live) |
| Resend | ✅ Connected |
| GitHub | ✅ Connected |

---

## Code Changes Required for Cloudflare

If deploying to Cloudflare, you'd need to modify these files to use direct environment variables instead of Replit Connectors:

1. **server/stripeClient.ts** - Change from connector API to `process.env.STRIPE_SECRET_KEY`
2. **server/resendClient.ts** - Change from connector API to `process.env.RESEND_API_KEY`
3. **server/github.ts** - Change from connector API to `process.env.GITHUB_TOKEN`

---

## Recommendation

**Deploy on Replit** - Your app is already configured and working. Just click publish and it will:
- Automatically use production Stripe keys
- Handle webhooks correctly
- Manage all secrets securely
- Provide SSL and custom domain support

If you need Cloudflare for CDN/caching, you can:
1. Deploy on Replit
2. Use Cloudflare as a proxy/CDN in front of your Replit app
3. Point your custom domain through Cloudflare to Replit

This gives you the best of both worlds without code changes!
