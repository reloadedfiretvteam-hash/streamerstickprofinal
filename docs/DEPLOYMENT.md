# Production Deployment Guide

## Overview

This project uses **clean-main** as the production branch. All production deployments are triggered from this branch via GitHub Actions and Cloudflare Pages.

## Deployment Architecture

### Production Branch: clean-main
- **Purpose**: Production-ready code only
- **Deployment Target**: Cloudflare Pages (production environment)
- **URL**: streamerstickpro-live.pages.dev, secure.streamstickpro.com
- **Automatic Deployment**: Push to clean-main triggers production deployment via GitHub Actions

### Development Branch: main
- **Purpose**: Development and staging work
- **Deployment Target**: Preview/staging environments only
- **Merging**: After thorough testing, changes from `main` are merged into `clean-main`

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/cloudflare-deploy.yml`) that:

1. **Triggers on**:
   - Direct pushes to `clean-main` branch
   - Merged pull requests into `clean-main`

2. **Build Process**:
   - Checks out the `clean-main` branch
   - Installs dependencies with `npm ci`
   - Builds the project with `npm run build`
   - Injects required environment variables from GitHub Secrets

3. **Deployment**:
   - Deploys the `dist` folder to Cloudflare Pages
   - Forces production deployment (not preview)
   - Uses branch name `clean-main` to ensure correct environment

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:
**Settings → Secrets and variables → Actions → Repository secrets**

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Stripe Configuration
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_live_xxx for production)

### Cloudflare Configuration
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Your Cloudflare Pages project name

## Cloudflare Pages Configuration

### Dashboard Setup

If you're using Cloudflare Pages GitHub integration (instead of GitHub Actions):

1. Go to Cloudflare Dashboard → Pages
2. Select your project
3. **Production branch**: Set to `clean-main`
4. **Preview branches**: Set to PRs targeting `clean-main`

### Environment Variables

Add these environment variables in Cloudflare Pages dashboard:
**Pages project → Settings → Environment variables → Production**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STORAGE_BUCKET_NAME` (default: super-bass)
- `VITE_SECURE_HOST_RENDER_FULL_APP` (default: false)
- `VITE_SECURE_HOSTS` (e.g., secure.streamstickpro.com)
- `VITE_STRIPE_HOSTS` (e.g., pay.streamstickpro.com)
- `VITE_CONCIERGE_HOSTS` (optional concierge domains)

## Deployment Workflow

### Standard Deployment

1. **Develop and test** on feature branches
2. **Create PR** targeting `main` for review
3. **Merge to main** after approval and testing
4. **Test on staging** if you have a staging environment
5. **Create PR from main to clean-main** with thorough description
6. **Merge to clean-main** - this triggers production deployment automatically
7. **Monitor deployment** in GitHub Actions tab

### Hotfix Deployment

For urgent production fixes:

1. **Create hotfix branch** from `clean-main`
2. **Make minimal fixes** required for the issue
3. **Test locally** with `npm run build`
4. **Create PR** directly to `clean-main`
5. **Review and merge** - deployment happens automatically
6. **Backport to main** if needed

## Secure Domain Routing

The application supports opt-in full-site rendering on secure/concierge domains:

### Default Behavior (VITE_SECURE_HOST_RENDER_FULL_APP=false or unset)
- Secure domains (secure.streamstickpro.com) show **cloaked checkout page only**
- Maintains product name privacy
- Uses Stripe with shadow/cloaked product names

### Full App Rendering (VITE_SECURE_HOST_RENDER_FULL_APP=true)
- Secure domains render the **complete application**
- Shows all products, navigation, and pages
- Useful for testing or special use cases
- **Recommended**: Keep this `false` for production to maintain cloaking

## Build Verification

Before merging to clean-main, always verify:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Build project
npm run build

# Check for build errors
# Build output should be in dist/ folder
ls -la dist/
```

## Troubleshooting

### Build Fails on Deployment
- Check GitHub Actions logs for specific errors
- Verify all required secrets are set correctly
- Ensure environment variables match production needs
- Test build locally with production environment variables

### Deployment Succeeds but Site Broken
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Check Cloudflare Pages environment variables
- Ensure storage bucket name matches your Supabase configuration

### Images Not Loading
- Verify `VITE_STORAGE_BUCKET_NAME` matches your actual Supabase bucket
- Check bucket exists in Supabase Storage
- Verify bucket has public access policies configured
- Check image paths in database match bucket structure

## Rollback Procedure

If a deployment causes issues:

1. **Immediate**: Use Cloudflare Pages dashboard to rollback to previous deployment
2. **Git revert**: Create a revert commit on clean-main
3. **Fix forward**: Preferred - create hotfix PR with the fix

## Monitoring

- **GitHub Actions**: Monitor deployment status in Actions tab
- **Cloudflare Pages**: Check deployment logs in Pages dashboard
- **Production Site**: Test key workflows after each deployment
- **Error Tracking**: Monitor browser console and Supabase logs

## Support

For deployment issues:
1. Check GitHub Actions workflow logs
2. Review Cloudflare Pages deployment logs
3. Verify all environment variables and secrets
4. Test build locally to reproduce issues
