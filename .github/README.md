# GitHub Configuration

## Workflows

### `cloudflare-deploy.yml`
Automatically deploys the `clean-main` branch to Cloudflare Pages production.

**Triggers**:
- Push to `clean-main` branch
- Pull request merged to `clean-main`

**Requirements**:
- GitHub Secrets configured (see `CLOUDFLARE_PRODUCTION_SETUP.md`)
- Cloudflare API token with Pages:Edit permission
- Project name and account ID

**What it does**:
1. Checks out `clean-main` branch
2. Installs dependencies
3. Builds the project with production environment variables
4. Deploys to Cloudflare Pages as production deployment
5. Reports deployment URL in GitHub Actions summary

## Setup Instructions

See: `CLOUDFLARE_PRODUCTION_SETUP.md` in the root directory for complete setup guide.

### Quick Setup:

1. Add GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PROJECT_NAME`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

2. Merge PR to `clean-main` or push directly

3. Check Actions tab for deployment status

## Files

- `workflows/cloudflare-deploy.yml` - Automatic Cloudflare deployment workflow
- `CLOUDFLARE_PRODUCTION_SETUP.md` - Complete setup and troubleshooting guide

