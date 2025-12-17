# 🔒 COMPLETE STRIPE PAYMENT SETUP GUIDE

## 📋 Overview

This guide will help you configure:
- ✅ Supabase tokens and secrets
- ✅ Stripe payment processor secrets and webhooks
- ✅ Cloudflare environment variables
- ✅ Shadow/Real product flow (customers see real, Stripe sees cloaked)

---

## 🔑 STEP 1: SUPABASE CONFIGURATION

### Your Supabase Credentials:
- **Supabase URL**: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg`

### Get Your Service Role Key:
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api
2. Find **"service_role" key** (⚠️ Keep this secret!)
3. Copy it - you'll need it for Edge Functions

---

## 💳 STEP 2: STRIPE CONFIGURATION

### Your Stripe Credentials:
- **Stripe Secret Key (Live)**: `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`
- **Stripe Publishable Key**: Get from Stripe Dashboard → Developers → API Keys

### Get Your Stripe Publishable Key:
1. Go to: https://dashboard.stripe.com/apikeys
2. Find **"Publishable key"** (starts with `pk_live_...`)
3. Copy it - you'll need it for Cloudflare

---

## 🌐 STEP 3: CLOUDFLARE ENVIRONMENT VARIABLES

### Go to Cloudflare Dashboard:
1. Navigate to: https://dash.cloudflare.com
2. Select your project/website
3. Go to **Pages** → **Your Project** → **Settings** → **Environment Variables**

### Add These Variables (ALL with `VITE_` prefix):

| Variable Name | Value | Type |
|--------------|-------|------|
| `VITE_SUPABASE_URL` | `https://emlqlmfzqsnqokrqvmcm.supabase.co` | Secret |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg` | Secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (Get from Stripe Dashboard) | Secret |
| `VITE_STORAGE_BUCKET_NAME` | `images` | Plain Text |

**⚠️ IMPORTANT:** All variables MUST start with `VITE_` prefix!

---

## 🔐 STEP 4: SUPABASE EDGE FUNCTIONS SECRETS

### Go to Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
2. Click **"Settings"** or **"Secrets"**
3. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `STRIPE_SECRET_KEY` | `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` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (You'll get this after setting up webhook) |
| `SUPABASE_URL` | `https://emlqlmfzqsnqokrqvmcm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (Get from Supabase Dashboard → Settings → API) |

---

## 🔔 STEP 5: STRIPE WEBHOOK SETUP

### Create Webhook Endpoint in Stripe:

1. **Go to Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/webhooks
   - Click **"Add endpoint"**

2. **Endpoint URL:**
   ```
   https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
   ```

3. **Select Events to Listen To:**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `payment_intent.processing`
   - ✅ `payment_intent.created`

4. **Copy Webhook Signing Secret:**
   - After creating the webhook, click on it
   - Find **"Signing secret"** (starts with `whsec_...`)
   - Copy it and add to Supabase Edge Functions Secrets as `STRIPE_WEBHOOK_SECRET`

---

## 🗄️ STEP 6: DATABASE SETUP (SQL)

### Run This SQL in Supabase SQL Editor:

1. **Go to:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new

2. **Copy and paste this SQL:**

```sql
-- ============================================================
-- COMPLETE STRIPE PAYMENT SETUP - DATABASE CONFIGURATION
-- ============================================================

-- STEP 1: Add cloaked_name column to real_products (for Stripe compliance)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'cloaked_name') THEN
      ALTER TABLE real_products ADD COLUMN cloaked_name text;
    END IF;
  END IF;
END $$;

-- STEP 2: Set default cloaked names for existing products
UPDATE real_products 
SET cloaked_name = CASE 
  WHEN LOWER(category) LIKE '%fire%' OR LOWER(category) LIKE '%stick%' 
    THEN 'Digital Entertainment Service - Hardware Bundle'
  WHEN LOWER(category) LIKE '%iptv%' OR LOWER(category) LIKE '%subscription%'
    THEN 'Digital Entertainment Service - Subscription'
  ELSE 'Digital Entertainment Service'
END
WHERE cloaked_name IS NULL OR cloaked_name = '';

-- STEP 3: Verify payment_transactions table exists (for webhook)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
    CREATE TABLE payment_transactions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      stripe_payment_intent_id text UNIQUE NOT NULL,
      amount numeric(10, 2) NOT NULL,
      currency text DEFAULT 'usd',
      payment_method text DEFAULT 'stripe',
      payment_status text NOT NULL,
      customer_email text,
      product_id text,
      product_name text,
      is_live_mode boolean DEFAULT false,
      created_at timestamp with time zone DEFAULT now(),
      stripe_event_id text,
      order_code text
    );
    
    -- Create index for faster lookups
    CREATE INDEX idx_payment_transactions_stripe_id ON payment_transactions(stripe_payment_intent_id);
    CREATE INDEX idx_payment_transactions_email ON payment_transactions(customer_email);
    CREATE INDEX idx_payment_transactions_created ON payment_transactions(created_at);
  END IF;
END $$;

-- STEP 4: Verify orders table has required columns
DO $$
BEGIN
  -- Add payment_intent_id if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'payment_intent_id') THEN
      ALTER TABLE orders ADD COLUMN payment_intent_id text;
    END IF;
    
    -- Add product_name_cloaked if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'product_name_cloaked') THEN
      ALTER TABLE orders ADD COLUMN product_name_cloaked text;
    END IF;
  END IF;
END $$;

-- VERIFICATION: Check setup
SELECT 
  'real_products.cloaked_name' as check_item,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'cloaked_name'
  ) as exists
UNION ALL
SELECT 
  'payment_transactions table',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'payment_transactions'
  )
UNION ALL
SELECT 
  'orders.payment_intent_id',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_intent_id'
  );
```

3. **Click "Run"** to execute the SQL

---

## 🚀 STEP 7: DEPLOY EDGE FUNCTIONS

### Deploy to Supabase:

**Option A: Using Supabase CLI**
```bash
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Deploy payment intent function
supabase functions deploy stripe-payment-intent

# Deploy webhook function
supabase functions deploy stripe-webhook
```

**Option B: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
2. For each function (`stripe-payment-intent` and `stripe-webhook`):
   - Click on the function
   - Click **"Deploy"** or **"Update"**
   - Verify deployment is successful

---

## ✅ STEP 8: VERIFICATION CHECKLIST

### Cloudflare Variables:
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is set
- [ ] `VITE_STORAGE_BUCKET_NAME` is set to `images`

### Supabase Edge Functions Secrets:
- [ ] `STRIPE_SECRET_KEY` is set
- [ ] `STRIPE_WEBHOOK_SECRET` is set (after webhook creation)
- [ ] `SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set

### Stripe Webhook:
- [ ] Webhook endpoint created: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
- [ ] Events selected: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.
- [ ] Webhook signing secret copied to Supabase

### Database:
- [ ] `cloaked_name` column exists in `real_products`
- [ ] Products have cloaked names set
- [ ] `payment_transactions` table exists
- [ ] `orders` table has `payment_intent_id` column

### Edge Functions:
- [ ] `stripe-payment-intent` is deployed
- [ ] `stripe-webhook` is deployed

---

## 🧪 STEP 9: TESTING

### Test Payment Flow:

1. **Test Card (Stripe Test Mode):**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)

2. **Test Process:**
   - Go to your checkout page
   - Select a product
   - Fill in customer information
   - Use test card above
   - Complete payment

3. **Verify:**
   - ✅ Payment appears in Stripe Dashboard
   - ✅ Order saved in `orders` table
   - ✅ Payment transaction saved in `payment_transactions` table
   - ✅ Stripe shows CLOAKED product name
   - ✅ Customer email shows REAL product name

---

## 🔍 HOW SHADOW/REAL PRODUCT FLOW WORKS

### Customer Journey:
1. **Customer browses** → Sees REAL product names (e.g., "Fire Stick 4K Max")
2. **Adds to cart** → Cart shows REAL names
3. **Checks out** → Checkout shows REAL names
4. **Pays via Stripe** → **Stripe sees CLOAKED names** (compliance ✅)
5. **Receives email** → Email shows REAL names ✅
6. **Order record** → Stores BOTH names (real for customer, cloaked for Stripe)

### Stripe Dashboard:
- **Payment Description**: Shows cloaked name (e.g., "Digital Entertainment Service")
- **Metadata**: Contains both `product_name` (real) and `product_name_cloaked` (for Stripe)

### Database:
- `real_products.name` = Real product name (customers see this)
- `real_products.cloaked_name` = Cloaked name (Stripe sees this)
- `orders` table stores both names

---

## 🐛 TROUBLESHOOTING

### Error: "Missing env vars"
→ Check that all Supabase Edge Function secrets are set

### Error: "Product not found"
→ Verify product exists in `real_products` table with `status = 'published'`

### Error: "Webhook signature invalid"
→ Verify `STRIPE_WEBHOOK_SECRET` matches the webhook signing secret in Stripe

### Payment succeeds but order not saved
→ Check browser console and Supabase logs for errors

### Stripe shows real product names instead of cloaked
→ Verify `cloaked_name` column exists and products have cloaked names set

---

## 📞 SUPPORT

**Admin Email:** reloadedfirestvteam@gmail.com

**Service Portal:** http://ky-tv.cc

---

**Last Updated:** $(date)
**Status:** ✅ Complete Setup Guide Ready






