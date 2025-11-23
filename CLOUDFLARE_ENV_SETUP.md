# Cloudflare Environment Variables Setup Guide

Quick reference for setting up environment variables and API tokens for Cloudflare integration.

## Required Secrets

### 1. Get Cloudflare API Token

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Pages** template
5. Configure:
   - **Permissions**: 
     - Account - Cloudflare Pages (Edit)
   - **Account Resources**: 
     - Include - Your Account
   - **Zone Resources**: 
     - Include - All zones
6. Click **Continue to summary** → **Create Token**
7. **Copy the token** (you won't see it again!)

**Add to GitHub:**
```
Name: CLOUDFLARE_API_TOKEN
Value: [Your token from step 7]
```

### 2. Get Cloudflare Account ID

1. In [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **Workers & Pages** from the left menu
3. On the right sidebar, find **Account ID**
4. Click to copy the Account ID

**Add to GitHub:**
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: [Your 32-character Account ID]
```

### 3. Supabase Environment Variables

From your [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api):

1. Go to **Project Settings** → **API**
2. Copy the **Project URL**
3. Copy the **anon/public** key

**Add to GitHub:**
```
Name: VITE_SUPABASE_URL
Value: https://[your-project-id].supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: [Your anon key - starts with "eyJ..."]
```

## Adding Secrets to GitHub

### Method 1: GitHub Web Interface

1. Go to: `https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/settings/secrets/actions`
2. Click **New repository secret**
3. Enter **Name** and **Value**
4. Click **Add secret**
5. Repeat for all 4 secrets

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if needed
# https://cli.github.com/

# Login
gh auth login

# Add secrets
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
gh secret set VITE_SUPABASE_URL
gh secret set VITE_SUPABASE_ANON_KEY
```

## Adding Environment Variables to Cloudflare Pages

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select your **streamerstickprofinal** project
3. Go to **Settings** → **Environment variables**
4. Add for **Production** environment:
   - `VITE_SUPABASE_URL`: [Your Supabase URL]
   - `VITE_SUPABASE_ANON_KEY`: [Your Supabase anon key]
5. Optionally add for **Preview** environment (same values)

## Verification

After adding all secrets and variables:

1. Push a commit to the `main` branch
2. Check GitHub Actions: `https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/actions`
3. The workflow should run successfully
4. Check Cloudflare Pages: Build should complete and deploy
5. Visit your site to verify it's working

## Troubleshooting

### "API Token is invalid"
- Make sure the token has **Cloudflare Pages - Edit** permission
- Token should include your account
- Try creating a new token

### "Account ID is invalid"
- Should be a 32-character hexadecimal string
- Copy from Workers & Pages overview, right sidebar
- Don't include spaces or special characters

### Build fails with "Missing environment variable"
- Ensure all 4 GitHub Secrets are set
- Names must match exactly (case-sensitive)
- Values should not have quotes or extra spaces

### Site loads but database doesn't work
- Check Cloudflare Pages environment variables
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- These must be set in Cloudflare Pages Dashboard, not just GitHub

## Security Best Practices

✅ **DO:**
- Use GitHub Secrets for sensitive data
- Rotate API tokens periodically
- Use minimum required permissions
- Keep `VITE_SUPABASE_ANON_KEY` as anon key only (never service role key)

❌ **DON'T:**
- Commit secrets to your repository
- Share API tokens publicly
- Use service role keys in frontend code
- Store secrets in code comments

## Quick Checklist

- [ ] CLOUDFLARE_API_TOKEN created and added to GitHub Secrets
- [ ] CLOUDFLARE_ACCOUNT_ID added to GitHub Secrets
- [ ] VITE_SUPABASE_URL added to GitHub Secrets
- [ ] VITE_SUPABASE_ANON_KEY added to GitHub Secrets
- [ ] VITE_SUPABASE_URL added to Cloudflare Pages (Production)
- [ ] VITE_SUPABASE_ANON_KEY added to Cloudflare Pages (Production)
- [ ] Test deployment triggered and successful
- [ ] Site loads correctly with database connection

## Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs#get-the-api-keys)
- Full configuration: See `CLOUDFLARE_CONFIG.md`
