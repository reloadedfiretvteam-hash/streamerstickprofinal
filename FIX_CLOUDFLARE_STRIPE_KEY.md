# 🔧 FIX: Wrong Stripe Key Variable Name in Cloudflare

## ❌ THE PROBLEM:

Your Cloudflare has:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ❌ (WRONG NAME)

But your code needs:
- `VITE_STRIPE_PUBLISHABLE_KEY` ✅ (CORRECT NAME)

---

## ✅ FIX: Add Correct Variable Name

### STEP 1: Go to Cloudflare

1. Go to: **https://dash.cloudflare.com**
2. Log in
3. Click **"Pages"** (left sidebar)
4. Click **your project name**
5. Click **"Settings"** tab (top menu)
6. Click **"Environment variables"** (left sidebar)

### STEP 2: Add NEW Variable (Keep the old one too, just add new)

1. Click **"Add variable"** button
2. **Variable name:** `VITE_STRIPE_PUBLISHABLE_KEY`
3. **Value:** Paste your Stripe key:
   ```
   pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8
   ```
4. **Check boxes:**
   - ✅ Production
   - ✅ Preview (optional)
5. Click **"Save"**

### STEP 3: Trigger Rebuild

1. Go to **"Deployments"** tab
2. Click **three dots (⋯)** on latest deployment
3. Click **"Retry deployment"**
4. Wait 2-5 minutes

---

## ✅ DONE!

Now you'll have BOTH variables:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (old - can keep or delete)
- `VITE_STRIPE_PUBLISHABLE_KEY` (new - this is what the code uses)

The checkout will work once Cloudflare rebuilds!

