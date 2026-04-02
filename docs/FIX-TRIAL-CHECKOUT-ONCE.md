# Fix trial & checkout once (so SEO deploys don’t break them)

**Do this once in Cloudflare.** After this, deploy with SEO as much as you want; trial and checkout will keep working.

---

## Step 1: Open env settings

1. Go to **https://dash.cloudflare.com**
2. **Workers & Pages** → open project **streamerstickpro-live**
3. **Settings** → **Environment variables**

---

## Step 2: Set variables for BOTH environments

You should see **Production** and **Preview**. Set the **same** variables for **both**.

| Variable | Example / note |
|----------|----------------|
| STRIPE_SECRET_KEY | sk_live_... or sk_test_... |
| STRIPE_PUBLISHABLE_KEY | pk_live_... or pk_test_... |
| STRIPE_WEBHOOK_SECRET | whsec_... |
| RESEND_API_KEY | re_... |
| RESEND_FROM_EMAIL | noreply@streamstickpro.com |
| VITE_SUPABASE_URL | https://xxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | eyJ... |
| SUPABASE_SERVICE_KEY | eyJ... (service role) |
| SESSION_SECRET | any long random string |

- **Production**: add/edit each of the above, save.
- **Preview**: add/edit the **same** names and values, save.

---

## Step 3: Deploy

Push to **clean-main** (or run the deploy workflow). The new deployment will use one of these environments; because both have the same vars, trial and checkout will work.

---

**Why this works:** New deploys from clean-main use either Production or Preview env. If only one had vars, the other would break. Setting both once fixes it for all future SEO deploys. Full reasoning: **docs/ARCHITECT-AUDIT-SEO-VS-CHECKOUT-TRIAL.md**
