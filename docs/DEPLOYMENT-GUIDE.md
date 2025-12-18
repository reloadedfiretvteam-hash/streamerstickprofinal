# StreamStickPro Deployment Guide
## Complete Independence from Replit

This guide sets up StreamStickPro to run entirely on:
- **GitHub** - Code repository
- **Cloudflare Pages** - Hosting and serverless functions
- **Supabase** - Database and storage

---

## Step 1: Supabase Setup

### 1.1 Run the Complete SQL Setup

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `scripts/supabase-complete-setup.sql`
4. Click **Run** to execute

This creates all required tables:
- `blog_posts` - 81 SEO blog articles
- `real_products` - 27 products (Fire Sticks + IPTV)
- `orders` - Order tracking
- `customers` - Customer management
- `users` - Admin authentication
- `visitors` - Analytics
- `page_edits` - CMS functionality

### 1.2 Verify Setup

Run this query to confirm:
```sql
SELECT 
  (SELECT count(*) FROM real_products) as products,
  (SELECT count(*) FROM blog_posts WHERE is_published = true) as blogs;
```

Expected: `products: 27, blogs: 81`

---

## Step 2: Cloudflare Pages Setup

### 2.1 Connect GitHub Repository

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

### 2.2 Set Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Build-time Variables (for both Production & Preview):

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |
| `VITE_SUPABASE_URL` | `https://emlqlmfzqsnqokrqvmcm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_SECURE_HOSTS` | `secure.streamstickpro.com` |
| `VITE_STORAGE_BUCKET_NAME` | `imiges` |

#### Runtime Secrets (Production only, mark as "Encrypt"):

| Secret | Description |
|--------|-------------|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `SESSION_SECRET` | Random 32+ character string |

### 2.3 Custom Domains

1. Go to **Custom domains**
2. Add `streamstickpro.com` (main site)
3. Add `secure.streamstickpro.com` (shadow/checkout domain)

---

## Step 3: GitHub Setup

### 3.1 Repository Secrets (for Actions)

If using GitHub Actions for CI/CD, add these secrets:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages permissions |

### 3.2 Push Latest Code

```bash
git add .
git commit -m "Complete Supabase migration for Replit independence"
git push origin main
```

---

## Step 4: Verify Deployment

After Cloudflare builds and deploys:

1. **Check main site:** https://streamstickpro.com
2. **Check blog:** https://streamstickpro.com/blog
3. **Check sitemap:** https://streamstickpro.com/sitemap.xml
4. **Verify static HTML:** View source on any blog post - should see full content, not empty div

---

## Step 5: Submit to Search Engines

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property for `streamstickpro.com`
3. Submit sitemap: `https://streamstickpro.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap: `https://streamstickpro.com/sitemap.xml`

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│   GitHub    │────▶│ Cloudflare Pages │────▶│   Supabase    │
│ Repository  │     │  (Build + Host)  │     │  (Database)   │
└─────────────┘     └──────────────────┘     └───────────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │    Static HTML + Worker   │
              │  - Pre-rendered blogs     │
              │  - API routes via Worker  │
              │  - Stripe checkout        │
              └──────────────────────────┘
```

**Build Process:**
1. Vite builds React app to static HTML/JS
2. `prerender-blog.ts` fetches 81 posts from Supabase
3. Generates static HTML for each blog post (SEO-friendly)
4. Generates sitemap.xml with all URLs
5. Worker handles API routes at runtime

---

## Troubleshooting

### Blog posts not showing
- Verify `blog_posts` table exists in Supabase
- Check RLS policy allows public read: `is_published = true`

### Products not loading
- Verify `real_products` table has data
- Check Supabase connection in browser console

### Build fails
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Cloudflare
- Check build logs for specific errors

### Checkout not working
- Verify Stripe secrets are set in Cloudflare
- Check webhook URL is configured in Stripe Dashboard
