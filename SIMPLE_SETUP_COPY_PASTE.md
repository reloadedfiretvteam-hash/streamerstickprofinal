# ✅ SIMPLE SETUP GUIDE - COPY & PASTE (FOR NON-TECHNICAL)

## 🎯 WHAT YOU GET AFTER SETUP:

✅ Every customer gets a **Service URL** (your specific URL)  
✅ Every customer gets a **YouTube Setup Video** in their email  
✅ Username & Password generated automatically  
✅ Emails sent to customer AND you (admin)

---

## 📋 STEP 1: Run SQL in Supabase

### WHERE TO GO:
1. Go to **https://supabase.com** → Login
2. Click your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New Query"** button

### WHAT TO PASTE:
Copy **ALL** of this and paste it:

```sql
-- ============================================================
-- COMPLETE ORDER FULFILLMENT SETUP
-- ============================================================

-- 1. CUSTOMER ACCOUNTS TABLE
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

-- 2. PRODUCT SETUP VIDEOS TABLE
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
CREATE INDEX IF NOT EXISTS idx_product_setup_videos_default ON product_setup_videos(is_default, is_active) WHERE is_default = true;

DROP TRIGGER IF EXISTS update_product_setup_videos_timestamp ON product_setup_videos;
CREATE TRIGGER update_product_setup_videos_timestamp 
  BEFORE UPDATE ON product_setup_videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 3. FUNCTIONS FOR USERNAME/PASSWORD GENERATION
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

-- 4. ADD COLUMNS TO PRODUCTS TABLES
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

-- 5. ADD COLUMNS TO ORDERS TABLE
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

### CLICK:
Click the **"Run"** button (or press F5)

**✅ DONE! Step 1 Complete**

---

## 📋 STEP 2: Add Your URLs (Service URL + YouTube Video)

### WHERE TO GO:
1. Go to **Supabase Dashboard**
2. Click **"SQL Editor"** again
3. Click **"New Query"**

### WHAT TO PASTE:

**REPLACE THESE WITH YOUR ACTUAL URLs:**

1. **YOUR_SERVICE_URL_HERE** = The URL you want every customer to get (example: `https://your-service.com/login`)
2. **YOUR_YOUTUBE_VIDEO_HERE** = Your YouTube setup video URL (example: `https://youtube.com/watch?v=ABC123` or `https://youtu.be/ABC123`)

```sql
-- ============================================================
-- ADD YOUR DEFAULT SERVICE URL AND SETUP VIDEO
-- ============================================================

-- Add default setup video (sent to ALL customers)
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) 
VALUES 
  ('all', 'Stream Stick Pro Setup Guide', 'YOUR_YOUTUBE_VIDEO_HERE', true, true),
  ('firestick', 'Fire Stick Setup Guide', 'YOUR_YOUTUBE_VIDEO_HERE', true, true),
  ('iptv', 'IPTV Subscription Setup', 'YOUR_YOUTUBE_VIDEO_HERE', true, true)
ON CONFLICT DO NOTHING;

-- Set default service URL for all products (if not already set)
-- This URL gets sent to every customer
UPDATE real_products 
SET service_url = 'YOUR_SERVICE_URL_HERE'
WHERE service_url IS NULL OR service_url = '';

-- If you want to set it for specific products, use:
-- UPDATE real_products 
-- SET service_url = 'YOUR_SERVICE_URL_HERE', setup_video_url = 'YOUR_YOUTUBE_VIDEO_HERE'
-- WHERE name ILIKE '%fire stick%' OR name ILIKE '%iptv%';
```

### REPLACE:
1. Find `YOUR_SERVICE_URL_HERE` → Replace with your actual service URL
2. Find `YOUR_YOUTUBE_VIDEO_HERE` → Replace with your actual YouTube video URL

### EXAMPLE:
```sql
-- Example (don't use these - use YOUR URLs):
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) 
VALUES 
  ('all', 'Stream Stick Pro Setup Guide', 'https://youtube.com/watch?v=dQw4w9WgXcQ', true, true);

UPDATE real_products 
SET service_url = 'https://streamstickpro.com/service'
WHERE service_url IS NULL;
```

### CLICK:
Click **"Run"** button

**✅ DONE! Step 2 Complete**

---

## 📋 STEP 3: Set Admin Email

### WHERE TO GO:
1. Go to **Supabase Dashboard**
2. Click **"Edge Functions"** (left sidebar)
3. Click **"Manage secrets"** or **"Secrets"**

### WHAT TO ADD:
Click **"Add new secret"** and add:

- **Key:** `ADMIN_EMAIL`
- **Value:** `reloadedfirestvteam@gmail.com` (or your email)

Click **"Save"**

**✅ DONE! Step 3 Complete**

---

## 📋 STEP 4: Deploy Edge Function

### WHERE TO GO:
1. Go to **Supabase Dashboard**
2. Click **"Edge Functions"** (left sidebar)
3. Find **"stripe-webhook"** in the list

### WHAT TO DO:
1. Click **"stripe-webhook"**
2. Click **"Edit"** or **"Deploy"**
3. The code is already updated in your repo - just click **"Deploy"**

**OR** if you need to update it manually:

1. Open file: `supabase/functions/stripe-webhook/index.ts` from your repo
2. Copy all the code
3. Paste it into Supabase Edge Functions editor
4. Click **"Deploy"**

**✅ DONE! Step 4 Complete**

---

## 🎉 ALL DONE!

Now when a customer purchases:

1. ✅ **Username & Password** generated automatically
2. ✅ **Service URL** sent in email (your URL from Step 2)
3. ✅ **YouTube Setup Video** sent in email (your video from Step 2)
4. ✅ **Email sent to customer** with all info
5. ✅ **Email sent to you (admin)** with order details

---

## 🧪 TEST IT

1. Make a test purchase with Stripe test card: `4242 4242 4242 4242`
2. Check your email inbox
3. Check customer email inbox
4. Verify customer received:
   - Username
   - Password
   - Service URL (your URL)
   - YouTube Setup Video link

---

## 📝 SUMMARY

| Step | Where | What |
|------|-------|------|
| 1 | Supabase → SQL Editor | Paste SQL (creates tables) |
| 2 | Supabase → SQL Editor | Paste SQL (add your URLs) |
| 3 | Supabase → Edge Functions → Secrets | Add `ADMIN_EMAIL` |
| 4 | Supabase → Edge Functions | Deploy `stripe-webhook` |

**That's it! Everything else is automatic!** 🚀




