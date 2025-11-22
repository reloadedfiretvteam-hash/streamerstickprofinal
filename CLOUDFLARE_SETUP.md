# Cloudflare Pages Setup Guide

## ✅ Your Code is Ready on GitHub
- **Repository**: `evandelamarter-max/streamstickpro`
- **Branch**: `main`
- **Status**: 🟢 Production Ready

---

## 🚀 Automatic Deployment Setup

### Step 1: Access Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com/
2. Log in with: **starevan11@gmail.com**

### Step 2: Create Pages Project
1. Click **"Workers & Pages"** in the left sidebar
2. Click **"Create application"** button
3. Click **"Pages"** tab
4. Click **"Connect to Git"**

### Step 3: Connect GitHub
1. Click **"Connect GitHub"**
2. Authorize Cloudflare to access your repositories
3. Select: **`evandelamarter-max/streamstickpro`**
4. Click **"Begin setup"**

### Step 4: Configure Build Settings
```
Project name: streamstickpro
Production branch: main
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 18 or higher
```

### Step 5: Environment Variables
Click **"Add variable"** for each:

```bash
VITE_SUPABASE_URL
Value: https://tqecnmygspkrijovrbah.supabase.co

VITE_SUPABASE_ANON_KEY
Value: [Your Supabase Anon Key from .env file]
```

**⚠️ IMPORTANT**: Get your actual anon key from your local `.env` file.

### Step 6: Deploy
1. Click **"Save and Deploy"**
2. Wait 2-3 minutes for first build
3. Cloudflare will assign you a URL: `streamstickpro.pages.dev`

---

## 🔄 Automatic Updates

Once connected, **every GitHub push automatically deploys**!

To deploy changes:
```bash
./deploy.sh
```

This script will:
- ✅ Build your project
- ✅ Run tests
- ✅ Commit changes
- ✅ Push to GitHub
- 🚀 Cloudflare auto-deploys from GitHub

---

## 🌐 Custom Domain Setup (Optional)

### Add Your Own Domain
1. In Cloudflare Pages, go to your project
2. Click **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Enter your domain (e.g., `streamstickpro.com`)
5. Follow DNS configuration instructions
6. Wait 5-10 minutes for SSL certificate

---

## 📊 What's Already Configured

### ✅ Database (Supabase)
- Products: **7 active**
- Blog Posts: **77 published**
- Edge Functions: **3 deployed**
- Payment Gateways: **Configured**

### ✅ Build Configuration
- Bundle Size: **322.80 kB (gzipped: 63.49 kB)**
- TypeScript: **0 critical errors**
- Code Splitting: **Optimized**
- Images: **18 clean files**

### ✅ SEO Optimized
- robots.txt ✅
- sitemap.xml ✅
- Meta tags ✅
- Schema.org markup ✅
- Open Graph ✅

### ✅ Security Headers
- HTTPS enforcement ✅
- CSP (Content Security Policy) ✅
- XSS Protection ✅
- Frame Protection ✅

---

## 🔧 Troubleshooting

### Build Fails on Cloudflare
**Check Build Logs**: Look for missing environment variables

**Solution**: Make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Site Loads But Features Don't Work
**Issue**: Environment variables not set correctly

**Solution**:
1. Go to Cloudflare Pages → Your Project → Settings
2. Click **"Environment variables"**
3. Verify both variables are present
4. Click **"Redeploy"**

### Automatic Deployment Not Working
**Issue**: GitHub not connected

**Solution**:
1. Go to Cloudflare Pages → Your Project → Settings
2. Check **"Builds & deployments"**
3. Verify GitHub connection
4. Click **"Retry deployment"**

---

## 📞 Support

**Email**: reloadedfiretvteam@gmail.com

**GitHub Repo**: https://github.com/evandelamarter-max/streamstickpro

**Supabase Dashboard**: https://supabase.com/dashboard/project/tqecnmygspkrijovrbah

---

## 🎯 Next Steps After Deployment

1. ✅ Test checkout flow
2. ✅ Verify product images load
3. ✅ Test blog post pages
4. ✅ Check admin dashboard access
5. ✅ Configure payment gateway API keys (if using Bitcoin)
6. ✅ Test email notifications (requires email service)

---

## 💡 Pro Tips

### Deploy Faster
```bash
# Quick deploy (skips some checks)
npm run build && git add -A && git commit -m "Quick update" && git push
```

### Check Build Locally
```bash
npm run build && npm run preview
```
Then visit: http://localhost:4173

### Monitor Performance
- Use Cloudflare Analytics in dashboard
- Check Web Vitals
- Monitor bandwidth usage
