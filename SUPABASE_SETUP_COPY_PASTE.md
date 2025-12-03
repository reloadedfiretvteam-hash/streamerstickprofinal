# 📋 SUPABASE SETUP - COMPLETE COPY-PASTE GUIDE

**Everything you need to add to Supabase - Copy and paste ready!**

---

## 🗄️ STEP 1: RUN THIS SQL MIGRATION

### Where: Supabase Dashboard → SQL Editor
### When: Do this FIRST before anything else

**COPY-PASTE THIS SQL:**

```sql
/*
  # Add Missing Columns to real_products Table
  
  Adds the cloaked_name, service_url, and setup_video_url columns
  that are required for the Stripe cloaking system and IPTV service delivery.
*/

-- Add cloaked_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'cloaked_name'
  ) THEN
    ALTER TABLE real_products 
    ADD COLUMN cloaked_name text;
    
    -- Set default cloaked names based on category
    UPDATE real_products 
    SET cloaked_name = 'Digital Entertainment Service - Hardware Bundle'
    WHERE (category LIKE '%fire%' OR category LIKE '%stick%' OR name LIKE '%Fire Stick%')
    AND cloaked_name IS NULL;
    
    UPDATE real_products 
    SET cloaked_name = 'Digital Entertainment Service - Subscription'
    WHERE (category LIKE '%iptv%' OR category LIKE '%subscription%' OR name LIKE '%IPTV%' OR name LIKE '%Month%')
    AND cloaked_name IS NULL;
    
    UPDATE real_products 
    SET cloaked_name = 'Digital Entertainment Service'
    WHERE cloaked_name IS NULL;
  END IF;
END $$;

-- Add service_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'service_url'
  ) THEN
    ALTER TABLE real_products 
    ADD COLUMN service_url text DEFAULT 'http://ky-tv.cc';
    
    -- Set default service URL for all products
    UPDATE real_products 
    SET service_url = 'http://ky-tv.cc'
    WHERE service_url IS NULL;
  END IF;
END $$;

-- Add setup_video_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'setup_video_url'
  ) THEN
    ALTER TABLE real_products 
    ADD COLUMN setup_video_url text;
    
    -- Set default setup video URL (can be customized per product later)
    UPDATE real_products 
    SET setup_video_url = 'https://www.youtube.com/watch?v=YOUR_SETUP_VIDEO_ID'
    WHERE setup_video_url IS NULL;
  END IF;
END $$;

-- Create index for cloaked_name lookups
CREATE INDEX IF NOT EXISTS idx_real_products_cloaked_name ON real_products(cloaked_name);

-- Add comments
COMMENT ON COLUMN real_products.cloaked_name IS 'Stripe-compliant product name shown to Stripe (e.g., "Digital Entertainment Service")';
COMMENT ON COLUMN real_products.service_url IS 'IPTV service URL for customer login (default: http://ky-tv.cc)';
COMMENT ON COLUMN real_products.setup_video_url IS 'YouTube tutorial URL for product setup instructions';
```

**Click:** "Run" button

**Expected Result:** "Success. No rows returned"

---

## 🔑 STEP 2: ADD EDGE FUNCTION SECRETS

### Where: Supabase Dashboard → Project Settings → Edge Functions → Manage Secrets

**ADD THESE SECRETS:**

### Required for Stripe:
```
Name: STRIPE_SECRET_KEY
Value: sk_live_YOUR_STRIPE_SECRET_KEY_HERE
(or sk_test_... for testing)
```

### Required for Email (Choose ONE service):

#### Option A: Resend (Recommended)
```
Name: RESEND_API_KEY
Value: re_YOUR_RESEND_API_KEY_HERE
```

#### Option B: SendGrid
```
Name: SENDGRID_API_KEY
Value: SG.YOUR_SENDGRID_API_KEY_HERE
```

#### Option C: AWS SES (Advanced)
```
Name: AWS_ACCESS_KEY_ID
Value: YOUR_AWS_ACCESS_KEY

Name: AWS_SECRET_ACCESS_KEY
Value: YOUR_AWS_SECRET_KEY

Name: AWS_REGION
Value: us-east-1
```

---

## 📋 STEP 3: VERIFY EDGE FUNCTIONS ARE DEPLOYED

### Where: Supabase Dashboard → Edge Functions

**You should see these 7 functions:**

1. ✅ **stripe-payment-intent** - Creates Stripe payments with cloaked names
2. ✅ **stripe-webhook** - Handles Stripe payment confirmations
3. ✅ **confirm-payment** - Confirms payment completion
4. ✅ **send-order-emails** - Sends order confirmation
5. ✅ **send-credentials-email** - Sends IPTV login credentials
6. ✅ **nowpayments-webhook** - Handles Bitcoin payments
7. ✅ **create-payment-intent** - Legacy (not used anymore)

**If they're not deployed, run:**
```bash
supabase functions deploy
```

Or deploy individually:
```bash
supabase functions deploy stripe-payment-intent
supabase functions deploy send-order-emails
supabase functions deploy send-credentials-email
```

---

## 🌐 STEP 4: CLOUDFLARE ENVIRONMENT VARIABLES

### Where: Cloudflare Dashboard → Pages → streamerstickprofinal → Settings → Environment Variables

**ADD THESE:**

### Production & Preview:
```
VITE_SUPABASE_URL = https://emlqlmfzqsnqokrqvmcm.supabase.co
VITE_SUPABASE_ANON_KEY = [YOUR ANON KEY - the one that starts with eyJ...]
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_... (or pk_test_... for testing)
VITE_STORAGE_BUCKET_NAME = images
```

---

## ✅ COMPLETE CHECKLIST

### In Supabase:

**SQL Editor:**
- [ ] Run the migration SQL above
- [ ] Verify success message
- [ ] Check real_products table has new columns

**Edge Functions → Secrets:**
- [ ] Add STRIPE_SECRET_KEY
- [ ] Add RESEND_API_KEY (or your chosen email service)

**Edge Functions:**
- [ ] Verify all 7 functions are deployed
- [ ] Check logs for any errors

### In Cloudflare:

**Environment Variables:**
- [ ] Add VITE_SUPABASE_URL
- [ ] Add VITE_SUPABASE_ANON_KEY  
- [ ] Add VITE_STRIPE_PUBLISHABLE_KEY
- [ ] Add VITE_STORAGE_BUCKET_NAME

**Deployment:**
- [ ] Wait for deployment to complete (~5-10 min)
- [ ] Test live site

---

## 🎯 THAT'S IT! NOTHING ELSE NEEDED!

### What Happens After:

1. **Migration adds columns** → Your products get cloaked names
2. **Stripe secret in Supabase** → Payment intents can be created
3. **Email service secret** → Customers get credentials
4. **Cloudflare env vars** → Frontend connects to backend
5. **Stripe checkout works** → Compliant product names sent to Stripe

---

## 📍 WHERE EXACTLY TO DO EACH STEP:

### Supabase SQL Migration:
1. Go to: https://supabase.com/dashboard
2. Select your project: **emlqlmfzqsnqokrqvmcm**
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Paste the SQL from above
6. Click: **Run** (bottom right)
7. Wait for "Success" message

### Supabase Secrets:
1. Same dashboard
2. Click: **Project Settings** (gear icon, bottom left)
3. Click: **Edge Functions** (left menu)
4. Click: **Manage Secrets**
5. Click: **Add new secret**
6. Name: `STRIPE_SECRET_KEY`
7. Value: Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
8. Click: **Add secret**
9. Repeat for `RESEND_API_KEY` (or your email service)

### Cloudflare Environment Variables:
1. Go to: https://dash.cloudflare.com
2. Click: **Workers & Pages**
3. Find: **streamerstickprofinal**
4. Click: **Settings** tab
5. Scroll to: **Environment Variables**
6. Click: **Add variable**
7. Add each variable from the list above
8. Click: **Save**
9. **IMPORTANT:** Click "Redeploy" to apply changes

---

## ⚠️ COMMON MISTAKES TO AVOID:

1. ❌ **Don't forget to redeploy Cloudflare** after adding env vars
2. ❌ **Don't use test keys in production** (use sk_live_ and pk_live_)
3. ❌ **Don't skip the migration** - Stripe won't work without cloaked_name column
4. ❌ **Don't forget email service secret** - Customers won't get credentials

---

## 🎉 WHEN YOU'RE DONE:

Your Stripe checkout will:
- ✅ Work correctly with compliant product names
- ✅ Send credentials to customers via email
- ✅ Store both real and cloaked names
- ✅ Be fully Stripe ToS compliant
- ✅ Process payments successfully

---

**THAT'S ALL YOU NEED! Just these 4 steps!**

1. Run SQL migration in Supabase
2. Add secrets in Supabase (Stripe + Email service)
3. Add env vars in Cloudflare
4. Test your checkout!

