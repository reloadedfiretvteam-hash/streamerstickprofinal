# ✅ COMPLETE SETUP GUIDE - ALL COPY-PASTE (NO ERRORS, NO CONFLICTS)

## 🎯 WHAT THIS SETS UP:

✅ Two-email system (immediate thank you + 5-minute delay credentials)  
✅ Service URL: `http://ky-tv.cc` (sent to every customer)  
✅ YouTube Video: `https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45` (sent in second email)  
✅ Username/Password generation  
✅ All Stripe payment methods (Cards, Apple Pay, Google Pay, Cash App Pay)  
✅ Admin panel fully functional  

---

## 📋 PART 1: SUPABASE SQL (Run These First)

### STEP 1A: Create All Tables

**WHERE:** Supabase Dashboard → SQL Editor → New Query

**COPY & PASTE THIS ENTIRE BLOCK:**

```sql
-- ============================================================
-- STEP 1A: CREATE ALL TABLES FOR ORDER FULFILLMENT
-- ============================================================

-- Customer Accounts Table
CREATE TABLE IF NOT EXISTS customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  order_code text NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  service_url text,
  setup_video_url text,
  product_type text,
  product_name text,
  account_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read customer accounts" ON customer_accounts;
DROP POLICY IF EXISTS "Authenticated users can manage accounts" ON customer_accounts;

CREATE POLICY "Public can read customer accounts" ON customer_accounts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage accounts" ON customer_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_customer_accounts_order_code ON customer_accounts(order_code);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_email ON customer_accounts(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_username ON customer_accounts(username);

DROP TRIGGER IF EXISTS update_customer_accounts_timestamp ON customer_accounts;
CREATE TRIGGER update_customer_accounts_timestamp 
  BEFORE UPDATE ON customer_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Product Setup Videos Table
CREATE TABLE IF NOT EXISTS product_setup_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_type text NOT NULL,
  video_title text NOT NULL,
  video_url text NOT NULL,
  video_description text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_setup_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active videos" ON product_setup_videos;
DROP POLICY IF EXISTS "Authenticated users can manage videos" ON product_setup_videos;

CREATE POLICY "Public can read active videos" ON product_setup_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage videos" ON product_setup_videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_product_setup_videos_product_type ON product_setup_videos(product_type);

DROP TRIGGER IF EXISTS update_product_setup_videos_timestamp ON product_setup_videos;
CREATE TRIGGER update_product_setup_videos_timestamp 
  BEFORE UPDATE ON product_setup_videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Pending Emails Table (for 5-minute delay)
CREATE TABLE IF NOT EXISTS pending_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  order_code text NOT NULL,
  email_type text NOT NULL,
  email_data jsonb NOT NULL,
  send_at timestamptz NOT NULL,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pending_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage pending emails" ON pending_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pending_emails_send_at ON pending_emails(send_at, status);

-- Username/Password Generation Functions
CREATE OR REPLACE FUNCTION generate_username(customer_name text)
RETURNS text AS $$
DECLARE
  base_name text;
  random_suffix text;
  final_username text;
  counter int := 0;
BEGIN
  base_name := LOWER(REGEXP_REPLACE(SPLIT_PART(customer_name, ' ', 1), '[^a-z0-9]', '', 'g'));
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  final_username := base_name || random_suffix;
  
  WHILE EXISTS (SELECT 1 FROM customer_accounts WHERE username = final_username) AND counter < 10 LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    final_username := base_name || random_suffix;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_password()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add columns to products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'cloaked_name') THEN
      ALTER TABLE real_products ADD COLUMN cloaked_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'setup_video_url') THEN
      ALTER TABLE real_products ADD COLUMN setup_video_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'service_url') THEN
      ALTER TABLE real_products ADD COLUMN service_url text;
    END IF;
  END IF;
END $$;

-- Add columns to orders
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders_full') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders_full' AND column_name = 'customer_account_id') THEN
      ALTER TABLE orders_full ADD COLUMN customer_account_id uuid;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders_full' AND column_name = 'email_sent') THEN
      ALTER TABLE orders_full ADD COLUMN email_sent boolean DEFAULT false;
    END IF;
  END IF;
END $$;
```

**CLICK:** "Run" button

**✅ DONE! Step 1A Complete**

---

### STEP 1B: Add Your Service URL and YouTube Video

**WHERE:** Supabase Dashboard → SQL Editor → New Query

**COPY & PASTE THIS (YOUR URLs ARE ALREADY FILLED IN):**

```sql
-- ============================================================
-- STEP 1B: ADD YOUR SERVICE URL AND YOUTUBE VIDEO
-- YOUR URLs ARE ALREADY FILLED IN!
-- ============================================================

-- Add default setup video (YouTube video that ALL customers get)
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) 
VALUES 
  ('all', 'Stream Stick Pro Setup Guide', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true),
  ('firestick', 'Fire Stick Setup Guide', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true),
  ('iptv', 'IPTV Subscription Setup', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true)
ON CONFLICT DO NOTHING;

-- Set default service URL (URL that ALL customers get)
UPDATE real_products 
SET service_url = 'http://ky-tv.cc'
WHERE service_url IS NULL OR service_url = '';

-- Also save in site_settings as default
INSERT INTO site_settings (setting_key, setting_value, category, description)
VALUES ('default_service_url', 'http://ky-tv.cc', 'customer', 'Default service URL sent to all customers')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

**CLICK:** "Run" button

**✅ DONE! Step 1B Complete**

---

## 📋 PART 2: SUPABASE EDGE FUNCTIONS SECRETS (Environment Variables)

### STEP 2A: Set Admin Email

**WHERE:** Supabase Dashboard → Edge Functions → Secrets (or "Manage secrets")

**WHAT TO DO:**
1. Click "Add new secret" or "New secret"
2. **Key:** `ADMIN_EMAIL`
3. **Value:** `reloadedfirestvteam@gmail.com`
4. Click "Save"

**✅ DONE! Step 2A Complete**

---

### STEP 2B: Set Stripe Secret Key

**WHERE:** Supabase Dashboard → Edge Functions → Secrets

**WHAT TO DO:**
1. Click "Add new secret"
2. **Key:** `STRIPE_SECRET_KEY`
3. **Value:** Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
   - Get it from: https://dashboard.stripe.com/apikeys
   - Copy the **Secret key** (NOT the publishable key)
4. Click "Save"

**✅ DONE! Step 2B Complete**

---

### STEP 2C: Set Stripe Webhook Secret

**WHERE:** Supabase Dashboard → Edge Functions → Secrets

**WHAT TO DO:**
1. Go to Stripe Dashboard → https://dashboard.stripe.com/webhooks
2. Click "Add endpoint" (if you don't have one)
3. Enter URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
   - Replace `YOUR_PROJECT_ID` with your actual Supabase project ID
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Go back to Supabase → Edge Functions → Secrets
7. Click "Add new secret"
8. **Key:** `STRIPE_WEBHOOK_SECRET`
9. **Value:** Paste the signing secret from Stripe
10. Click "Save"

**✅ DONE! Step 2C Complete**

---

### STEP 2D: Set Supabase URLs (Already Set, But Verify)

**WHERE:** Supabase Dashboard → Edge Functions → Secrets

**NOTE:** These are usually auto-set, but verify they exist:

1. **Key:** `SUPABASE_URL`
   - **Value:** `https://YOUR_PROJECT_ID.supabase.co`
   - Get it from: Supabase Dashboard → Settings → API

2. **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Your service role key (starts with `eyJ...`)
   - Get it from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **IMPORTANT:** This is different from the anon key!

**If they don't exist, add them as secrets.**

**✅ DONE! Step 2D Complete**

---

## 📋 PART 3: DEPLOY SUPABASE EDGE FUNCTIONS

### STEP 3A: Deploy `stripe-payment-intent`

**WHERE:** Supabase Dashboard → Edge Functions

**WHAT TO DO:**
1. Click "Edge Functions" in left sidebar
2. Find "stripe-payment-intent" in the list
3. Click on it
4. Click "Deploy" button (code is already updated in your repo)

**OR** if you need to update it:
1. Open file: `supabase/functions/stripe-payment-intent/index.ts` from your repo
2. Copy ALL the code
3. Paste into Supabase Edge Functions editor
4. Click "Deploy"

**✅ DONE! Step 3A Complete**

---

### STEP 3B: Deploy `stripe-webhook`

**WHERE:** Supabase Dashboard → Edge Functions

**WHAT TO DO:**
1. Click "Edge Functions"
2. Find "stripe-webhook"
3. Click on it
4. Click "Deploy" (code is already updated)

**OR** if you need to update it:
1. Open file: `supabase/functions/stripe-webhook/index.ts` from your repo
2. Copy ALL the code
3. Paste into Supabase editor
4. Click "Deploy"

**✅ DONE! Step 3B Complete**

---

### STEP 3C: Deploy `send-credentials-email`

**WHERE:** Supabase Dashboard → Edge Functions

**WHAT TO DO:**
1. Click "Edge Functions"
2. Click "New Function" or "Create Function"
3. **Function Name:** `send-credentials-email`
4. Open file: `supabase/functions/send-credentials-email/index.ts` from your repo
5. Copy ALL the code
6. Paste into Supabase editor
7. Click "Deploy"

**✅ DONE! Step 3C Complete**

---

### STEP 3D: Deploy `send-order-emails` (If It Exists)

**WHERE:** Supabase Dashboard → Edge Functions

**WHAT TO DO:**
1. Check if "send-order-emails" exists
2. If it does, click on it
3. Click "Deploy"
4. If it doesn't exist, that's okay - it's optional

**✅ DONE! Step 3D Complete**

---

## 📋 PART 4: CLOUDFLARE PAGES ENVIRONMENT VARIABLES

### STEP 4A: Go to Cloudflare Pages

**WHERE:** Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables

### STEP 4B: Add These Variables (Production)

Click "Add variable" for each:

#### Variable 1:
- **Variable name:** `VITE_SUPABASE_URL`
- **Value:** `https://YOUR_PROJECT_ID.supabase.co`
  - Get it from: Supabase Dashboard → Settings → API → Project URL

#### Variable 2:
- **Variable name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key (starts with `eyJ...`)
  - Get it from: Supabase Dashboard → Settings → API → anon public key

#### Variable 3:
- **Variable name:** `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value:** Your Stripe publishable key (starts with `pk_live_` or `pk_test_`)
  - Get it from: https://dashboard.stripe.com/apikeys
  - Copy the **Publishable key** (NOT the secret key)

#### Variable 4 (Optional):
- **Variable name:** `VITE_STORAGE_BUCKET_NAME`
- **Value:** `images`

#### Variable 5 (Optional):
- **Variable name:** `VITE_STRIPE_HOSTS`
- **Value:** `pay.streamstickpro.com` (or your payment subdomain)

#### Variable 6 (Optional):
- **Variable name:** `VITE_ADMIN_DEFAULT_USER`
- **Value:** `admin`

#### Variable 7 (Optional):
- **Variable name:** `VITE_ADMIN_DEFAULT_PASSWORD`
- **Value:** `admin123`

#### Variable 8 (Optional):
- **Variable name:** `VITE_ADMIN_DEFAULT_EMAIL`
- **Value:** `reloadedfirestvteam@gmail.com`

**After adding each variable:**
- Make sure "Production" is checked
- Click "Save"

**✅ DONE! Step 4B Complete**

---

### STEP 4C: Add Same Variables for Preview (Optional)

**WHERE:** Cloudflare Pages → Settings → Environment Variables

**WHAT TO DO:**
1. For each variable above, click "Edit"
2. Check "Preview" checkbox
3. Click "Save"

**This makes variables work for preview deployments too.**

**✅ DONE! Step 4C Complete**

---

## 📋 PART 5: GITHUB SECRETS (If Using GitHub Actions)

**WHERE:** GitHub Repository → Settings → Secrets and variables → Actions → Secrets

**NOTE:** If you're deploying via Cloudflare Pages automatically from GitHub, you might not need these. But if you have GitHub Actions, add:

#### Secret 1 (If Needed):
- **Name:** `SUPABASE_URL`
- **Value:** `https://YOUR_PROJECT_ID.supabase.co`

#### Secret 2 (If Needed):
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key

#### Secret 3 (If Needed):
- **Name:** `STRIPE_PUBLISHABLE_KEY`
- **Value:** Your Stripe publishable key

**✅ DONE! Step 5 Complete (if needed)**

---

## 📋 PART 6: CONFIGURE STRIPE WEBHOOK

### STEP 6A: Get Your Webhook URL

**WHERE:** Supabase Dashboard → Edge Functions → stripe-webhook

**WHAT TO DO:**
1. Click on "stripe-webhook" function
2. Copy the function URL (looks like: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`)

### STEP 6B: Add Webhook in Stripe

**WHERE:** Stripe Dashboard → https://dashboard.stripe.com/webhooks

**WHAT TO DO:**
1. Click "Add endpoint" (or edit existing)
2. **Endpoint URL:** Paste the URL from Step 6A
3. **Description:** "Stream Stick Pro Order Fulfillment"
4. **Events to send:**
   - Select: `payment_intent.succeeded`
   - Select: `payment_intent.payment_failed`
   - Select: `payment_intent.canceled`
   - Select: `payment_intent.processing`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go back to **Step 2C** above and add it as a secret if you haven't already

**✅ DONE! Step 6 Complete**

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] SQL Step 1A run successfully
- [ ] SQL Step 1B run successfully
- [ ] `ADMIN_EMAIL` secret added in Supabase
- [ ] `STRIPE_SECRET_KEY` secret added in Supabase
- [ ] `STRIPE_WEBHOOK_SECRET` secret added in Supabase
- [ ] `SUPABASE_URL` exists in Supabase secrets (or auto-set)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists in Supabase secrets
- [ ] `stripe-payment-intent` function deployed
- [ ] `stripe-webhook` function deployed
- [ ] `send-credentials-email` function deployed
- [ ] All Cloudflare environment variables set
- [ ] Stripe webhook configured in Stripe Dashboard
- [ ] Test purchase completed successfully

---

## 🧪 FINAL TEST

1. Make a test purchase:
   - Card: `4242 4242 4242 4242`
   - Exp: `12/25`
   - CVC: `123`
   - ZIP: `12345`

2. Check emails:
   - ✅ First email received immediately ("Thank you")
   - ✅ Second email received after 5 minutes (credentials)
   - ✅ Admin email received

3. Verify second email contains:
   - ✅ Username
   - ✅ Password
   - ✅ Service URL: `http://ky-tv.cc`
   - ✅ YouTube Video: `https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45`

---

## 📝 QUICK REFERENCE

| What | Where | Value |
|------|-------|-------|
| **Service URL** | SQL Step 1B | `http://ky-tv.cc` |
| **YouTube Video** | SQL Step 1B | `https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45` |
| **Admin Email** | Supabase Secrets | `reloadedfirestvteam@gmail.com` |
| **Stripe Secret Key** | Supabase Secrets | Get from Stripe Dashboard |
| **Stripe Webhook Secret** | Supabase Secrets | Get from Stripe Webhooks |
| **Supabase URL** | Supabase Secrets | `https://YOUR_PROJECT_ID.supabase.co` |
| **Service Role Key** | Supabase Secrets | Get from Supabase Settings → API |
| **Stripe Publishable Key** | Cloudflare Variables | Get from Stripe Dashboard |
| **Supabase Anon Key** | Cloudflare Variables | Get from Supabase Settings → API |

---

**🎉 THAT'S IT! Everything should work flawlessly now!**

If you get any errors, check:
1. All SQL ran successfully
2. All secrets are set correctly
3. All functions are deployed
4. Stripe webhook URL is correct
5. Environment variables match exactly (no extra spaces)




