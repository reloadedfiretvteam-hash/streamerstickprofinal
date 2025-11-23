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
- **Value**: *your Cloudflare API token from the Cloudflare dashboard*
- Click **"Add secret"**

#### Secret 2: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: *your Cloudflare account ID from the Cloudflare dashboard*
- Click **"Add secret"**

#### Secret 3: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: *your Supabase project URL (from the Supabase dashboard)*
- Click **"Add secret"**

#### Secret 4: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: *your Supabase anonymous public key (from the Supabase dashboard)*
- Click **\"Add secret\"**

### Step 3: Trigger Deployment
After adding all 4 secrets, go to:
- https://github.com/evandelamarter-max/streamstickpro/actions
- Click on the failed workflow
- Click **"Re-run all jobs"**

## Or Use This One-Command Fix (If You Have GitHub CLI)

```bash
# Example using GitHub CLI – replace values with your own tokens/URLs/keys
gh secret set CLOUDFLARE_API_TOKEN     -b"<your-cloudflare-api-token>"      -R <your-username>/<your-repo>
gh secret set CLOUDFLARE_ACCOUNT_ID    -b"<your-cloudflare-account-id>"     -R <your-username>/<your-repo>
gh secret set VITE_SUPABASE_URL        -b"<your-supabase-url>"              -R <your-username>/<your-repo>
gh secret set VITE_SUPABASE_ANON_KEY   -b"<your-supabase-anon-key>"         -R <your-username>/<your-repo>
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
