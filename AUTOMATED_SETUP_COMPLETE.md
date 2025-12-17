# 🚀 AUTOMATED SETUP - COMPLETE CONFIGURATION

## ✅ What Has Been Configured

### 1. ✅ Code Updates
- **Updated** `supabase/functions/stripe-payment-intent/index.ts` to use cloaked names
- **Verified** `supabase/functions/stripe-webhook/index.ts` is ready
- **All code** is configured for shadow/real product flow

### 2. ✅ Configuration Files Created
- `.env.example` - All environment variables template
- `DATABASE_SETUP_SQL.sql` - Complete database setup
- Setup scripts for automation

### 3. ✅ Your Credentials (Ready to Use)
- **Supabase URL**: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
- **Supabase Anon Key**: Configured in all guides
- **Stripe Secret Key**: `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`

---

## 🎯 QUICK SETUP (Choose One Method)

### Method 1: Automated Scripts (Recommended)

```powershell
# Run the complete setup script
.\complete-setup.ps1
```

This will guide you through:
1. Database setup
2. Supabase secrets
3. Edge function deployment
4. Cloudflare variables
5. Stripe webhook

### Method 2: Manual Setup

Follow these files in order:
1. `DATABASE_SETUP_SQL.sql` - Run in Supabase SQL Editor
2. `SUPABASE_EDGE_FUNCTIONS_SECRETS.md` - Add secrets in Dashboard
3. `CLOUDFLARE_ENV_VARS_SETUP.md` - Add variables in Cloudflare
4. `STRIPE_WEBHOOK_SETUP.md` - Create webhook in Stripe

---

## 📋 STEP-BY-STEP SETUP

### STEP 1: Database Setup (5 minutes)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new

2. **Run SQL Script:**
   - Open `DATABASE_SETUP_SQL.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"

3. **Verify:**
   - Check that `cloaked_name` column exists in `real_products`
   - Check that `payment_transactions` table exists

---

### STEP 2: Supabase Edge Functions Secrets (5 minutes)

**Option A: Via Dashboard (Easiest)**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings
2. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `STRIPE_SECRET_KEY` | `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` |
| `SUPABASE_URL` | `https://emlqlmfzqsnqokrqvmcm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Get from: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api |

**Option B: Via Script**
```powershell
.\setup-supabase-secrets.ps1
```

---

### STEP 3: Deploy Edge Functions (5 minutes)

**Option A: Via Dashboard**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
2. For each function:
   - Click on `stripe-payment-intent`
   - Click "Deploy" or "Update"
   - Repeat for `stripe-webhook`

**Option B: Via Script (if CLI installed)**
```powershell
.\deploy-edge-functions.ps1
```

---

### STEP 4: Cloudflare Environment Variables (5 minutes)

1. **Go to Cloudflare Dashboard:**
   - Navigate to your project → Settings → Environment Variables

2. **Add Variables** (see `.env.example` for exact values):

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://emlqlmfzqsnqokrqvmcm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Get from: https://dashboard.stripe.com/apikeys |
| `VITE_STORAGE_BUCKET_NAME` | `images` |

3. **Redeploy** your site after adding variables

---

### STEP 5: Stripe Webhook Setup (5 minutes)

**Option A: Via API Script (Automated)**
```powershell
.\setup-stripe-webhook-api.ps1
```

**Option B: Via Dashboard (Manual)**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL:**
   ```
   https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
   ```
4. **Select Events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`
   - `payment_intent.created`
5. **Copy Signing Secret** (starts with `whsec_...`)
6. **Add to Supabase:**
   - Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings
   - Add secret: `STRIPE_WEBHOOK_SECRET` = `whsec_...`

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] Database: `cloaked_name` column exists in `real_products`
- [ ] Database: `payment_transactions` table exists
- [ ] Supabase: All 4 secrets are set
- [ ] Supabase: Both Edge Functions are deployed
- [ ] Cloudflare: All 4 environment variables are set
- [ ] Stripe: Webhook endpoint is created and active
- [ ] Stripe: Webhook signing secret is in Supabase

---

## 🧪 TEST PAYMENT FLOW

1. **Use Test Card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`

2. **Complete Test Payment:**
   - Go to your checkout page
   - Select a product
   - Fill in customer info
   - Use test card
   - Complete payment

3. **Verify:**
   - ✅ Payment appears in Stripe Dashboard (shows cloaked name)
   - ✅ Order saved in `orders` table
   - ✅ Payment record in `payment_transactions` table
   - ✅ Webhook events logged in Supabase

---

## 📚 ALL FILES CREATED

### Setup Guides:
- `STRIPE_COMPLETE_SETUP_GUIDE.md` - Main comprehensive guide
- `QUICK_SETUP_REFERENCE.md` - Quick reference with all tokens
- `AUTOMATED_SETUP_COMPLETE.md` - This file

### Configuration:
- `.env.example` - Environment variables template
- `DATABASE_SETUP_SQL.sql` - Database setup script

### Setup Scripts:
- `complete-setup.ps1` - Complete automated setup
- `setup-supabase-secrets.ps1` - Supabase secrets setup
- `deploy-edge-functions.ps1` - Edge function deployment
- `setup-via-api.ps1` - Alternative setup method
- `setup-stripe-webhook-api.ps1` - Automated webhook creation

### Detailed Guides:
- `CLOUDFLARE_ENV_VARS_SETUP.md` - Cloudflare variables
- `SUPABASE_EDGE_FUNCTIONS_SECRETS.md` - Supabase secrets
- `STRIPE_WEBHOOK_SETUP.md` - Webhook setup

---

## 🎯 HOW SHADOW/REAL PRODUCTS WORK

### Customer Experience:
1. **Browses products** → Sees REAL names (e.g., "Fire Stick 4K Max")
2. **Adds to cart** → Cart shows REAL names
3. **Checks out** → Checkout shows REAL names
4. **Pays** → Stripe receives CLOAKED names ✅
5. **Receives email** → Email shows REAL names ✅

### Stripe Dashboard:
- **Payment Description**: Shows cloaked name
- **Metadata**: Contains both real and cloaked names

### Database:
- `real_products.name` = Real name (customers see)
- `real_products.cloaked_name` = Cloaked name (Stripe sees)
- `orders` table stores both names

---

## 🚀 YOU'RE READY!

Everything is configured and ready. Just follow the steps above to complete the setup!

**Total Setup Time:** ~25 minutes

**Status:** ✅ All code configured, all guides created, ready for deployment!






