# 🚀 Cloudflare Pages Production Deployment Setup

## The Problem

**Your last 5-7 pull requests went to Cloudflare PREVIEW instead of PRODUCTION**, even though they were merged to `clean-main` (your production branch).

## Why This Happened

Cloudflare Pages has two deployment types:
1. **Production Deployments** - From your configured production branch
2. **Preview Deployments** - From PRs and other branches

Your Cloudflare project is likely configured to use `main` as the production branch, but your actual production branch is `clean-main`.

## The Solution

We've created a comprehensive fix with multiple approaches:

---

## ✅ Option 1: GitHub Actions Workflow (RECOMMENDED)

We've added `.github/workflows/cloudflare-deploy.yml` that automatically deploys `clean-main` to production.

### Setup Steps:

1. **Add GitHub Secrets** (in your repository settings):
   - Go to: `https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/settings/secrets/actions`
   - Add these secrets:

   ```
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   CLOUDFLARE_ACCOUNT_ID=f1d6fdedf801e39f184a19ae201e8be1
   CLOUDFLARE_PROJECT_NAME=your_project_name
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

2. **Get Cloudflare API Token**:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Add these permissions:
     - Account - Cloudflare Pages: Edit
   - Copy the token and add it as `CLOUDFLARE_API_TOKEN` secret

3. **Find Your Project Name**:
   - Go to: https://dash.cloudflare.com/
   - Workers & Pages → Your Project
   - The name is at the top (e.g., "streamerstickpro-live" or similar)

4. **Test It**:
   - Merge a PR to `clean-main` or push directly
   - Go to Actions tab: `https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/actions`
   - You'll see the workflow run
   - Check the summary for your production URL

---

## ✅ Option 2: Fix Cloudflare Dashboard Settings (ALTERNATIVE)

If you prefer to use Cloudflare's automatic GitHub integration:

### Step 1: Change Production Branch

1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → Your Project → Settings
3. Find "Builds & deployments" section
4. Under "Production branch", **change from `main` to `clean-main`**
5. Click "Save"

### Step 2: Verify Configuration

1. Still in Settings, check:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or blank)
2. Ensure environment variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

### Step 3: Trigger Production Deployment

**Option A - Redeploy from Dashboard**:
1. Go to: Deployments tab
2. Find latest `clean-main` deployment
3. Click "..." menu → "Retry deployment"

**Option B - Push to clean-main**:
```bash
git checkout clean-main
git commit --allow-empty -m "Trigger production deployment"
git push origin clean-main
```

---

## 🔍 How to Verify It's Working

### Check 1: Deployment Type
1. Go to Cloudflare Dashboard → Your Project → Deployments
2. Look for deployments with:
   - ✅ **Branch: clean-main**
   - ✅ **Type: Production** (not "Preview")
   - ✅ **Status: Active**

### Check 2: URL
- Production URL should be your main domain (e.g., `streamstickpro.com`)
- Preview URLs look like: `abc123.streamerstickprofinal.pages.dev`

### Check 3: GitHub Actions
If using Option 1:
- Go to: `https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/actions`
- Successful workflow = Production deployment complete

---

## 📋 What About Previous PRs?

### To Deploy Last 5-7 PRs to Production:

Since they're already merged to `clean-main`, you just need to trigger a new production deployment:

**Method 1 - Using GitHub Actions** (if Option 1 setup is complete):
```bash
git checkout clean-main
git pull origin clean-main
git commit --allow-empty -m "Deploy all merged PRs to production"
git push origin clean-main
```

**Method 2 - Using Cloudflare Dashboard**:
1. Go to Cloudflare → Your Project → Deployments
2. Click "Create deployment" button
3. Select branch: **clean-main**
4. Click "Deploy"

**Method 3 - Using PowerShell Script**:
```powershell
.\trigger-cloudflare-deploy.ps1 -CloudflareToken "YOUR_TOKEN" -ProjectName "YOUR_PROJECT_NAME"
```

---

## ⚙️ Cloudflare Pages Configuration Reference

### Recommended Settings

**Build Configuration**:
```
Build command: npm run build
Build output directory: /dist
Root directory: (leave blank or /)
```

**Environment Variables** (Production):
```
NODE_VERSION=20
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STORAGE_BUCKET_NAME=images
VITE_STRIPE_HOSTS=pay.streamstickpro.com
```

**Branch Configuration**:
```
Production branch: clean-main
Preview branches: All branches except clean-main
```

**Build Settings**:
```
Framework preset: Vite
Node version: 20
```

---

## 🚨 Common Issues & Solutions

### Issue: "Still seeing preview deployments"
**Solution**: 
1. Verify production branch is set to `clean-main` in Cloudflare
2. Check that you're merging PRs to `clean-main`, not `main`
3. Look for the "Production" badge in Cloudflare deployments

### Issue: "Build failing in GitHub Actions"
**Solution**:
1. Check all secrets are set correctly
2. Verify `CLOUDFLARE_PROJECT_NAME` matches exactly
3. Check Actions logs for specific error

### Issue: "Changes not appearing on live site"
**Solution**:
1. Verify deployment actually went to production (not preview)
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Cloudflare deployment logs for errors

### Issue: "Multiple deployments showing"
**Solution**:
- This is normal! Cloudflare creates one deployment per push/PR
- Look for the one with "Production" badge on `clean-main` branch
- Previous preview deployments don't affect production

---

## 🔐 Security Notes

- Never commit API tokens to the repository
- Use GitHub Secrets for all sensitive data
- Rotate Cloudflare API tokens periodically
- Use scoped tokens (only Cloudflare Pages permissions)

---

## 📊 Monitoring Your Deployments

### GitHub
- Actions tab: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/actions
- Check workflow runs for deployment status

### Cloudflare
- Dashboard: https://dash.cloudflare.com/
- Workers & Pages → Your Project → Deployments
- Real-time build logs available

### Production URL
- Main site: Check your custom domain
- Logs: Cloudflare → Analytics → Web Analytics

---

## ✅ Success Checklist

After following this guide, verify:

- [ ] GitHub secrets are configured (Option 1) OR Cloudflare branch is set to `clean-main` (Option 2)
- [ ] Latest commit to `clean-main` triggered a production deployment
- [ ] Cloudflare shows deployment as "Production" (not "Preview")
- [ ] Production URL shows your latest changes
- [ ] All previous merged PRs are included in production build

---

## 💡 Best Practices Going Forward

1. **Always merge to `clean-main`** for production changes
2. **Check deployment status** after merging PRs
3. **Use preview deployments** to test PRs before merging
4. **Monitor Cloudflare analytics** for issues
5. **Keep environment variables in sync** between Cloudflare and GitHub Secrets

---

## 🆘 Still Having Issues?

If you've followed all steps and deployments still go to preview:

1. **Check GitHub default branch**:
   - Go to: Repository Settings → Default branch
   - Should be set to `clean-main`

2. **Verify Cloudflare connection**:
   - Cloudflare → Your Project → Settings → Git
   - Should show connected to `reloadedfiretvteam-hash/streamerstickprofinal`
   - Production branch should be `clean-main`

3. **Try manual deployment**:
   - Use "Create deployment" button in Cloudflare
   - Explicitly select `clean-main` branch
   - This forces a production deployment

4. **Contact Cloudflare Support**:
   - Sometimes project settings need to be reset
   - Support can verify your production branch configuration

---

**Last Updated**: December 4, 2024  
**Status**: ✅ Ready to deploy

