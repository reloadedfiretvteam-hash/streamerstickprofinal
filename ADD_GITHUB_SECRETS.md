# Add GitHub Secrets - Quick Fix

## The Problem
Your GitHub Actions deployment is failing with "input required API token" because the repository secrets are missing.

## The Solution (Takes 2 Minutes)

### Step 1: Go to GitHub Settings
1. Visit: https://github.com/evandelamarter-max/streamstickpro/settings/secrets/actions
2. Click **"New repository secret"** button

### Step 2: Add These 4 Secrets

#### Secret 1: CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: `4-C5HtCVpwO7fKGcxJXdd76X9l09avZuMVTdi2S0`
- Click **"Add secret"**

#### Secret 2: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: `f1d6fdedf801e39f184a19ae201e8be1`
- Click **"Add secret"**

#### Secret 3: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://tqecnmygspkrijovrbah.supabase.co`
- Click **"Add secret"**

#### Secret 4: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZWNubXlnc3Brcmlqb3ZyYmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTMwMDAsImV4cCI6MjA3Nzk2OTAwMH0.GYZQIZyGQKneze-My5VEsU-Ik25gvA1Cm3iC0Sq8uxs`
- Click **"Add secret"**

### Step 3: Trigger Deployment
After adding all 4 secrets, go to:
- https://github.com/evandelamarter-max/streamstickpro/actions
- Click on the failed workflow
- Click **"Re-run all jobs"**

## Or Use This One-Command Fix (If You Have GitHub CLI)

```bash
gh secret set CLOUDFLARE_API_TOKEN -b"4-C5HtCVpwO7fKGcxJXdd76X9l09avZuMVTdi2S0" -R evandelamarter-max/streamstickpro
gh secret set CLOUDFLARE_ACCOUNT_ID -b"f1d6fdedf801e39f184a19ae201e8be1" -R evandelamarter-max/streamstickpro
gh secret set VITE_SUPABASE_URL -b"https://tqecnmygspkrijovrbah.supabase.co" -R evandelamarter-max/streamstickpro
gh secret set VITE_SUPABASE_ANON_KEY -b"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZWNubXlnc3Brcmlqb3ZyYmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTMwMDAsImV4cCI6MjA3Nzk2OTAwMH0.GYZQIZyGQKneze-My5VEsU-Ik25gvA1Cm3iC0Sq8uxs" -R evandelamarter-max/streamstickpro
```

## What Happens Next?

Once you add these secrets:
1. ✅ GitHub Actions will have access to Cloudflare
2. ✅ Every push to `main` will auto-deploy
3. ✅ Your site will be live at: `streamstickpro.pages.dev`
4. ✅ No more "input required API token" errors

## Current Deployment Status
- ❌ Missing secrets (that's why it's failing)
- ⏳ Waiting for secrets to be added
- 🚀 Will auto-deploy once secrets are set
