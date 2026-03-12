# Audit: Why Checkout and Trials Fail (and the fix)

## What we measured (live site)

**Request:** `GET https://streamstickpro.com/api/health`

**Response:**
```json
{
  "status": "degraded",
  "bindings": {
    "stripe": false,
    "resend": false,
    "supabase": true
  }
}
```

So **right now** the Worker has:
- **Supabase** – present (checkout can read products; DB works).
- **Stripe** – **missing** → "Failed to create checkout session".
- **Resend** – **missing** → trial can't send emails.

There is no sabotage. The app and workflow are correct. The only problem is that **STRIPE_SECRET_KEY** and **RESEND_API_KEY** are not available to the Worker at runtime, even though they exist in GitHub (and may exist in Cloudflare). So either the sync step isn’t applying them to the project you deploy, or they’re set in the wrong environment/project.

---

## Fix (do this once)

Add the two missing secrets in the **Cloudflare Dashboard** so the Worker always has them:

1. Open **Cloudflare Dashboard** → **Workers & Pages** → open project **streamerstickpro-live**.
2. Go to **Settings** → **Variables and Secrets**.
3. Under **Production** (and Preview if you use it):
   - **Add** → **Encrypt** (secret).
   - **Variable name:** `STRIPE_SECRET_KEY`  
     **Value:** paste your Stripe secret key (same as in GitHub Secrets).  
     Save.
   - **Add** → **Encrypt** again.
   - **Variable name:** `RESEND_API_KEY`  
     **Value:** paste your Resend API key (same as in GitHub Secrets).  
     Save.
4. **Redeploy** so the new secrets are used:  
   **Deployments** → open the latest deployment → **Retry deployment**,  
   or push a small change to `clean-main` to trigger a new deploy.

After that, open `https://streamstickpro.com/api/health` again. You should see `"stripe": true`, `"resend": true`, and `"status": "ok"`. Checkout and trials should then work.

---

## Why this happened

- The pipeline uses a “Sync secrets to Cloudflare Pages” step that runs `wrangler pages secret put` with your GitHub Secrets.
- For the **live** deployment, **Stripe** and **Resend** are not ending up on the Worker (Supabase is). So either the sync step failed for those two, or they were never set for this project/env in the Dashboard.
- Setting **STRIPE_SECRET_KEY** and **RESEND_API_KEY** in the Dashboard for the Pages project guarantees the Worker gets them. GitHub and the rest of your config stay as they are; this only fixes the two missing bindings.
