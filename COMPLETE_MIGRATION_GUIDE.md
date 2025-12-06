# StreamStickPro - Complete Migration Guide
## Running Your Site Without Replit

This guide covers everything needed to run StreamStickPro on GitHub + Supabase + Cloudflare.

---

## Current Status: FULLY CONFIGURED

| Component | Status | Notes |
|-----------|--------|-------|
| GitHub Repository | Connected | reloadedfiretvteam-hash/streamerstickprofinal |
| Cloudflare Pages | Configured | streamerstickpro-live.pages.dev |
| Supabase Database | Connected | 7 products, schema complete |
| All Environment Variables | Set | 17 variables configured |
| Custom Domains | Configured | streamstickpro.com, secure.streamstickpro.com |

---

## 1. CLOUDFLARE PAGES ENVIRONMENT VARIABLES

All these variables are already set in your Cloudflare project:

### Production Environment (17 Variables Set)

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | Secret | Supabase PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Secret | Stripe live secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret |
| `RESEND_API_KEY` | Secret | Resend email API key |
| `RESEND_FROM_EMAIL` | Plain | noreply@streamstickpro.com |
| `SESSION_SECRET` | Secret | Session encryption key |
| `NODE_ENV` | Plain | production |
| `VITE_SUPABASE_URL` | Plain | https://emlqlmfzqsnqokrqvmcm.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Plain | Supabase anonymous key |
| `VITE_STORAGE_BUCKET_NAME` | Plain | images |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Plain | Stripe publishable key |
| `VITE_STRIPE_HOSTS` | Plain | pay.streamstickpro.com |
| `VITE_SECURE_HOSTS` | Plain | secure.streamstickpro.com |
| `VITE_ADMIN_DEFAULT_USER` | Plain | admin |
| `VITE_ADMIN_DEFAULT_PASSWORD` | Plain | admin123 |
| `VITE_ADMIN_DEFAULT_EMAIL` | Plain | reloadedfirestvteam@gmail.com |
| `VITE_DEFAULT_ADMIN_USER` | Plain | admin |

---

## 2. SUPABASE DATABASE

### Connection Details
- **Project URL**: https://emlqlmfzqsnqokrqvmcm.supabase.co
- **Database**: PostgreSQL

### Tables
| Table | Purpose |
|-------|---------|
| `users` | Admin user authentication |
| `orders` | Customer order tracking |
| `real_products` | Product catalog (Fire Sticks, IPTV) |

### Products (7 Total)
| Product | Category | Price |
|---------|----------|-------|
| Fire Stick HD | firestick | $140 |
| Fire Stick 4K | firestick | $150 |
| Fire Stick 4K Max | firestick | $160 |
| IPTV Monthly | iptv | $15 |
| IPTV Quarterly | iptv | $25 |
| 6 Month IPTV | iptv | $50 |
| IPTV Annual | iptv | $75 |

### Storage Bucket
- **Bucket Name**: imiges (PUBLIC)
- Contains: Product images, hero backgrounds, sports carousel images

---

## 3. GITHUB REPOSITORY

### Repository
- **Owner**: reloadedfiretvteam-hash
- **Repo**: streamerstickprofinal
- **Production Branch**: clean-main

### Key Files Updated for Cloudflare
- `server/stripeClient.ts` - Works on both Replit and Cloudflare
- `server/resendClient.ts` - Works on both Replit and Cloudflare
- `server/github.ts` - Works on both Replit and Cloudflare
- `.env.example` - Template with all required variables

---

## 4. STRIPE CONFIGURATION

### Webhook Endpoint
Your Stripe webhook should point to:
```
https://streamstickpro.com/api/stripe/webhook
```

### Events to Listen For
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Shadow Products Mapping
| Real Product | Shadow Product (Stripe Display) |
|--------------|--------------------------------|
| Fire Stick HD | Web Design Basic |
| Fire Stick 4K | Web Design Pro |
| Fire Stick 4K Max | Web Design Enterprise |
| IPTV Monthly | SEO Monthly |
| IPTV Quarterly | SEO Quarterly |
| IPTV 6 Month | SEO 6 Month |
| IPTV Annual | SEO Annual |

---

## 5. CUSTOM DOMAINS

### Configured in Cloudflare
| Domain | Purpose |
|--------|---------|
| streamstickpro.com | Main store |
| secure.streamstickpro.com | Shadow store (Stripe display) |
| streamerstickpro-live.pages.dev | Cloudflare Pages default |

### DNS Configuration (Cloudflare)
Make sure your DNS records point to Cloudflare Pages.

---

## 6. HOW THE CODE WORKS WITHOUT REPLIT

The updated client files (`stripeClient.ts`, `resendClient.ts`, `github.ts`) now check for the environment:

```javascript
function isReplitEnvironment(): boolean {
  return !!(process.env.REPLIT_CONNECTORS_HOSTNAME && 
    (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL));
}

async function getCredentials() {
  if (isReplitEnvironment()) {
    return getReplitCredentials(); // Use Replit connectors
  }
  return getEnvCredentials(); // Use environment variables directly
}
```

This means:
- **On Replit**: Uses Replit's connector system
- **On Cloudflare**: Uses environment variables directly

---

## 7. DEPLOYMENT WORKFLOW

### Automatic Deployments
1. Push code to `clean-main` branch on GitHub
2. Cloudflare Pages automatically detects the push
3. Runs `npm run build`
4. Deploys to production

### Manual Deployment
If needed, go to Cloudflare Dashboard → Pages → streamerstickpro-live → Deployments → Create deployment

---

## 8. TROUBLESHOOTING

### Common Issues

**Build Fails**
- Check Cloudflare build logs
- Ensure all environment variables are set
- Verify Node.js version is compatible (use v20)

**Database Connection Issues**
- Verify DATABASE_URL has `?sslmode=require` at the end
- Check Supabase is not in maintenance mode
- Verify password is URL-encoded (special chars like $ become %24)

**Stripe Webhooks Not Working**
- Verify webhook endpoint URL
- Check STRIPE_WEBHOOK_SECRET is correct
- Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

**Emails Not Sending**
- Verify RESEND_API_KEY is correct
- Check domain is verified in Resend dashboard
- Verify RESEND_FROM_EMAIL matches your verified domain

---

## 9. SECURITY REMINDERS

1. **Never commit secrets to GitHub** - Use Cloudflare environment variables
2. **Rotate API keys periodically** - Update in Cloudflare when you do
3. **Use encrypted secrets** - Mark sensitive variables as "encrypted" in Cloudflare
4. **Change admin password** - Update VITE_ADMIN_DEFAULT_PASSWORD to something secure

---

## 10. SUMMARY

Your StreamStickPro site is fully configured to run without Replit:

- **All code** is in GitHub
- **All secrets** are in Cloudflare
- **Database and images** are in Supabase
- **Payments** work through Stripe
- **Emails** work through Resend
- **Auto-deploys** happen on every push to clean-main

You can now manage everything from:
- **GitHub** - Code changes
- **Cloudflare Dashboard** - Environment variables, deployments, domains
- **Supabase Dashboard** - Database, storage, images
- **Stripe Dashboard** - Payments, products, webhooks
- **Resend Dashboard** - Email logs, API keys

Your site will continue working exactly the same as on Replit!
