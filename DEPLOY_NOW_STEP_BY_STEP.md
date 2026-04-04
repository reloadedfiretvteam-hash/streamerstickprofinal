# 🚀 DEPLOYMENT GUIDE - NO CODE CHANGES NEEDED

**CONFIRMED:** All 4 Supabase Edge Functions exist locally and are ready to deploy.
**YOUR ONLY TASKS:** Deploy functions + Set secrets + Set Cloudflare variables + Trigger redeploy.

---

## ✅ PART 1: DEPLOY SUPABASE EDGE FUNCTIONS

### Step 1: Deploy stripe-payment-intent

1. Open: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
2. If you see `stripe-payment-intent` already listed → **SKIP TO STEP 2**
3. If NOT listed → Click "Create a new function"
4. Function name: `stripe-payment-intent`
5. Open local file: `supabase/functions/stripe-payment-intent/index.ts`
6. Copy ALL 107 lines from that file
7. Paste into Supabase editor
8. Click "Deploy function"
9. Wait for green "Deployed successfully" message

### Step 2: Deploy stripe-webhook

1. Still at: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
2. If you see `stripe-webhook` already listed → **SKIP TO STEP 3**
3. If NOT listed → Click "Create a new function"
4. Function name: `stripe-webhook`
5. Open local file: `supabase/functions/stripe-webhook/index.ts`
6. Copy ALL 427 lines from that file
7. Paste into Supabase editor
8. Click "Deploy function"
9. Wait for success

### Step 3: Deploy send-order-emails

1. Still at functions page
2. If you see `send-order-emails` already listed → **SKIP TO STEP 4**
3. If NOT listed → Click "Create a new function"
4. Function name: `send-order-emails`
5. Open local file: `supabase/functions/send-order-emails/index.ts`
6. Copy ALL 176 lines from that file
7. Paste into Supabase editor
8. Click "Deploy function"
9. Wait for success

### Step 4: Deploy send-credentials-email

1. Still at functions page
2. If you see `send-credentials-email` already listed → **SKIP TO PART 2**
3. If NOT listed → Click "Create a new function"
4. Function name: `send-credentials-email`
5. Open local file: `supabase/functions/send-credentials-email/index.ts`
6. Copy ALL 264 lines from that file
7. Paste into Supabase editor
8. Click "Deploy function"
9. Wait for success

---

## ✅ PART 2: SET SUPABASE SECRETS (ENVIRONMENT VARIABLES FOR FUNCTIONS)

### Step 5: Get Service Role Key (You'll need this)

1. Open new tab: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api
2. Scroll to "Project API keys"
3. Find `service_role` (secret)
4. Click "Reveal"
5. Click "Copy" icon
6. Paste it somewhere safe (you'll use it in Step 8)

### Step 6: Add STRIPE_SECRET_KEY

1. Open: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/functions
2. Scroll to "Secrets" section
3. If you see `STRIPE_SECRET_KEY` already → **SKIP TO STEP 7**
4. If NOT → Click "Add new secret"
5. Name: `STRIPE_SECRET_KEY`
6. Value: `[REDACTED — Stripe Dashboard → Developers → API keys]`
7. Click "Save" or "Add secret"

### Step 7: Add SUPABASE_URL

1. Still on functions settings page
2. If you see `SUPABASE_URL` already → **SKIP TO STEP 8**
3. If NOT → Click "Add new secret"
4. Name: `SUPABASE_URL`
5. Value: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
6. Click "Save"

### Step 8: Add SUPABASE_SERVICE_ROLE_KEY

1. Still on functions settings page
2. If you see `SUPABASE_SERVICE_ROLE_KEY` already → **SKIP TO STEP 9**
3. If NOT → Click "Add new secret"
4. Name: `SUPABASE_SERVICE_ROLE_KEY`
5. Value: [PASTE THE SERVICE ROLE KEY YOU COPIED IN STEP 5]
6. Click "Save"

### Step 9: Get Stripe Webhook Secret

1. Open new tab: https://dashboard.stripe.com/webhooks
2. Find webhook with ID: `we_1SYe14HBw27Y92Ci0z5p0Wkl`
3. Click on it
4. Find "Signing secret"
5. Click "Reveal"
6. Copy the value (starts with `whsec_`)
7. Keep this ready for Step 10

### Step 10: Add STRIPE_WEBHOOK_SECRET

1. Back to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/functions
2. If you see `STRIPE_WEBHOOK_SECRET` already → **SKIP TO PART 3**
3. If NOT → Click "Add new secret"
4. Name: `STRIPE_WEBHOOK_SECRET`
5. Value: [PASTE THE WEBHOOK SECRET FROM STEP 9 - starts with whsec_]
6. Click "Save"

---

## ✅ PART 3: SET CLOUDFLARE ENVIRONMENT VARIABLES

### Step 11: Go to Cloudflare Pages

1. Open: https://dash.cloudflare.com
2. Click "Pages" in left sidebar
3. Click on your project (likely named something like `streamstickprofinal` or similar)
4. Click "Settings" tab
5. Scroll to "Environment variables" section

### Step 12: Add VITE_SUPABASE_URL

1. If you see `VITE_SUPABASE_URL` already → **SKIP TO STEP 13**
2. If NOT → Click "Add variable"
3. Variable name: `VITE_SUPABASE_URL`
4. Value: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
5. Make sure "Production" is checked
6. Check "Encrypt" (recommended)
7. Click "Save"

### Step 13: Add VITE_SUPABASE_ANON_KEY

1. If you see `VITE_SUPABASE_ANON_KEY` already → **SKIP TO STEP 14**
2. If NOT → Click "Add variable"
3. Variable name: `VITE_SUPABASE_ANON_KEY`
4. Value: `[REDACTED — use Supabase Dashboard → Settings → API → Project API keys]`
5. Make sure "Production" is checked
6. Check "Encrypt"
7. Click "Save"

### Step 14: Add VITE_STRIPE_PUBLISHABLE_KEY

1. If you see `VITE_STRIPE_PUBLISHABLE_KEY` already → **SKIP TO STEP 15**
2. If NOT → Click "Add variable"
3. Variable name: `VITE_STRIPE_PUBLISHABLE_KEY`
4. Value: `pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8`
5. Make sure "Production" is checked
6. Check "Encrypt"
7. Click "Save"

### Step 15: Add VITE_STORAGE_BUCKET_NAME

1. If you see `VITE_STORAGE_BUCKET_NAME` already → **SKIP TO PART 4**
2. If NOT → Click "Add variable"
3. Variable name: `VITE_STORAGE_BUCKET_NAME`
4. Value: `images`
5. Make sure "Production" is checked
6. Do NOT encrypt this one (plain text is fine)
7. Click "Save"

---

## ✅ PART 4: TRIGGER CLOUDFLARE REDEPLOY

### Step 16: Redeploy with New Variables

1. Still in your Cloudflare Pages project
2. Click "Deployments" tab
3. Find the most recent deployment (top of list)
4. Click the three dots menu (⋮) on that deployment
5. Click "Retry deployment"
6. Wait 3-5 minutes for deployment to complete
7. Check deployment status - should turn green "Success"

### Step 17: Verify Everything Works

1. Open your live site URL in browser
2. Go to `/stripe-checkout` page (e.g., `https://yoursite.com/stripe-checkout`)
3. Products should load automatically from `real_products` table
4. If products load → **SUCCESS! ✅**
5. If products don't load → Check Cloudflare environment variables (go back to Step 11)

---

## 🎯 SUMMARY OF WHAT YOU DEPLOYED

**Supabase Edge Functions (4):**
- ✅ `stripe-payment-intent` - Creates Stripe payment with cloaked product names
- ✅ `stripe-webhook` - Receives Stripe payment confirmations
- ✅ `send-order-emails` - Sends order confirmation to customer
- ✅ `send-credentials-email` - Sends login credentials to customer

**Supabase Secrets (4):**
- ✅ `STRIPE_SECRET_KEY` - Stripe API key for backend
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Admin access to Supabase
- ✅ `STRIPE_WEBHOOK_SECRET` - Verifies Stripe webhook signatures

**Cloudflare Environment Variables (4):**
- ✅ `VITE_SUPABASE_URL` - Frontend connects to Supabase
- ✅ `VITE_SUPABASE_ANON_KEY` - Frontend auth for Supabase
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - Frontend Stripe form
- ✅ `VITE_STORAGE_BUCKET_NAME` - Image storage bucket

---

## 🔥 PAYMENT FLOW AFTER DEPLOYMENT

1. Customer visits site → clicks Shop → sees products from `real_products` table
2. Customer sees REAL product names (e.g., "Fire Stick 4K Max $160")
3. Customer clicks "Add to Cart" → goes to checkout
4. Customer enters name, email, phone → selects Stripe payment
5. Frontend calls `stripe-payment-intent` function → backend gets product
6. Backend uses `cloaked_name` for Stripe (e.g., "Digital Entertainment Service - Hardware Bundle")
7. Customer pays with credit card → payment succeeds
8. Frontend generates credentials: `username: SARA45678912`, `password: M3K9X7Z2N5`, `serviceUrl: http://ky-tv.cc`
9. Frontend calls `send-order-emails` with REAL product name
10. Frontend calls `send-credentials-email` with credentials
11. Customer receives 2 emails: order confirmation + service credentials
12. Stripe webhook fires → `stripe-webhook` function saves to `payment_transactions` table
13. Done! ✅

---

## 📋 REMEMBER - ONE TABLE REAL_PRODUCTS

- ✅ There is ONE table: `real_products`
- ✅ It has TWO name columns: `name` and `cloaked_name`
- ✅ Frontend shows `name` to customers
- ✅ Backend sends `cloaked_name` to Stripe
- ✅ NO separate shadow/cloaked tables
- ✅ NO asking which products to show
- ✅ ALL products load automatically from `real_products` WHERE `status='published'`

---

## ❌ NO CODE CHANGES WERE MADE

As requested:
- ❌ Did NOT modify any .tsx files
- ❌ Did NOT create new components
- ❌ Did NOT rename anything
- ❌ Did NOT delete anything
- ✅ Only providing deployment instructions for existing code

---

**After completing all 17 steps, your site will be fully deployed and functional!**



