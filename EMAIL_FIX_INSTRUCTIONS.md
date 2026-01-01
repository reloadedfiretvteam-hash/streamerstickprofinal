# Email Sending Issue - Fix Instructions

## Problem
Emails are not being sent when customers purchase fire sticks or TV services.

## Root Cause
The `RESEND_API_KEY` environment variable is likely not configured in your Cloudflare Workers environment. The email functions check for this key and silently fail if it's missing (which I've now fixed to throw errors).

## Solution Steps

### 1. Verify Current Configuration
Visit your debug endpoint to check if RESEND_API_KEY is configured:
- Production: `https://secure.streamstickpro.com/api/debug`
- Look for the `email` section in the JSON response
- Check if `hasResendKey: true` or `hasResendKey: false`

### 2. Get Your Resend API Key
1. Go to https://resend.com
2. Sign in to your account (or create one if needed)
3. Navigate to **API Keys** section
4. Create a new API key or copy an existing one (it should start with `re_`)

### 3. Add RESEND_API_KEY to Cloudflare Workers
You need to add the API key as an environment variable in Cloudflare:

**Option A: Via Cloudflare Dashboard**
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker (likely `streamerstickpro-live`)
3. Go to **Settings** → **Variables**
4. Add a new environment variable:
   - **Variable name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (starts with `re_`)
5. Make sure it's added to **Production** environment
6. Save and redeploy your worker

**Option B: Via Wrangler CLI**
```bash
npx wrangler secret put RESEND_API_KEY
# When prompted, paste your Resend API key
```

### 4. Verify the Fix
1. After adding the key, wait a few minutes for Cloudflare to update
2. Visit the debug endpoint again: `https://secure.streamstickpro.com/api/debug`
3. Verify `hasResendKey: true` in the response
4. Test a purchase to confirm emails are sent

### 5. Check Email Status
- Customer emails go to the email address provided during checkout
- Owner notification emails go to: `reloadedfiretvteam@gmail.com`
- Check your Resend dashboard at https://resend.com/emails to see sent emails and any errors

## What I Fixed in the Code
1. Changed email functions to **throw errors** instead of silently returning when RESEND_API_KEY is missing
2. Added better error logging and error messages
3. Wrapped all Resend API calls in try-catch blocks to properly handle and log failures

## Additional Notes
- The `RESEND_FROM_EMAIL` should also be configured (defaults to `noreply@streamstickpro.com` if not set)
- Make sure your Resend account has verified the sender domain
- Check your Resend account limits/quota if emails still fail





