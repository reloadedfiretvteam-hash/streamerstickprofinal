# ✅ FINAL SETUP - COPY & PASTE (EVERYTHING YOU NEED)

## 🎯 WHAT HAPPENS:

1. ✅ **First Email** (immediate): "Thank you for purchase" - says login info coming in 5 minutes
2. ✅ **Second Email** (5 minutes later): Username, Password, Service URL, YouTube Setup Video
3. ✅ **Admin Email**: You get notified of every order

---

## 📋 STEP 1: Run SQL - Create Tables

### WHERE TO GO:
**Supabase Dashboard → SQL Editor → New Query**

### COPY & PASTE THIS:

```sql
-- ============================================================
-- STEP 1: CREATE ALL TABLES
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

### CLICK: "Run" button

**✅ DONE! Step 1 Complete**

---

## 📋 STEP 2: Add Your Service URL and YouTube Video

### WHERE TO GO:
**Supabase Dashboard → SQL Editor → New Query**

### COPY & PASTE THIS (REPLACE THE URLs):

**REPLACE:**
- `YOUR_SERVICE_URL_HERE` → Your actual service URL
- `YOUR_YOUTUBE_VIDEO_HERE` → Your actual YouTube video URL

```sql
-- ============================================================
-- STEP 2: ADD YOUR SERVICE URL AND YOUTUBE VIDEO
-- ============================================================

-- Add default setup video (YouTube video that ALL customers get)
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) 
VALUES 
  ('all', 'Stream Stick Pro Setup Guide', 'YOUR_YOUTUBE_VIDEO_HERE', true, true),
  ('firestick', 'Fire Stick Setup Guide', 'YOUR_YOUTUBE_VIDEO_HERE', true, true),
  ('iptv', 'IPTV Subscription Setup', 'YOUR_YOUTUBE_VIDEO_HERE', true, true)
ON CONFLICT DO NOTHING;

-- Set default service URL (URL that ALL customers get)
UPDATE real_products 
SET service_url = 'YOUR_SERVICE_URL_HERE'
WHERE service_url IS NULL OR service_url = '';

-- Also save in site_settings as default
INSERT INTO site_settings (setting_key, setting_value, category, description)
VALUES ('default_service_url', 'YOUR_SERVICE_URL_HERE', 'customer', 'Default service URL sent to all customers')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

### EXAMPLE (don't copy this - just see format):
```sql
-- Example:
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) 
VALUES 
  ('all', 'Stream Stick Pro Setup Guide', 'https://youtube.com/watch?v=ABC123XYZ', true, true);

UPDATE real_products 
SET service_url = 'https://streamstickpro.com/service'
WHERE service_url IS NULL;
```

### CLICK: "Run" button

**✅ DONE! Step 2 Complete**

---

## 📋 STEP 3: Set Admin Email

### WHERE TO GO:
**Supabase Dashboard → Edge Functions → Secrets** (or "Manage secrets")

### WHAT TO DO:
1. Click **"Add new secret"** or **"New secret"**
2. **Key:** `ADMIN_EMAIL`
3. **Value:** `reloadedfirestvteam@gmail.com` (or your admin email)
4. Click **"Save"**

**✅ DONE! Step 3 Complete**

---

## 📋 STEP 4: Deploy Edge Functions

### WHERE TO GO:
**Supabase Dashboard → Edge Functions**

### WHAT TO DO:

#### A. Deploy `stripe-webhook`:
1. Click **"stripe-webhook"** in the list
2. The code is already updated in your repo
3. Click **"Deploy"** button

#### B. Deploy `send-credentials-email`:
1. Click **"New Function"** or **"Create Function"**
2. Name it: `send-credentials-email`
3. Open file: `supabase/functions/send-credentials-email/index.ts` from your repo
4. Copy ALL the code from that file
5. Paste into Supabase editor
6. Click **"Deploy"**

**✅ DONE! Step 4 Complete**

---

## ✅ ALL DONE!

### What Happens Now:

1. **Customer purchases** → Payment succeeds
2. **First Email** (immediate): "Thank you for purchase - login info coming in 5 minutes"
3. **Second Email** (5 minutes later): Username, Password, Service URL, YouTube Setup Video
4. **Admin Email**: You get notified

---

## 🧪 TEST IT:

1. Make test purchase with card: `4242 4242 4242 4242`
2. Check customer email - should get "Thank you" email immediately
3. Wait 5 minutes
4. Check customer email again - should get credentials email
5. Verify customer received:
   - ✅ Username
   - ✅ Password  
   - ✅ Service URL (your URL)
   - ✅ YouTube Setup Video (your video)

---

## 📝 WHERE TO FIND YOUR URLs:

**If you already added them:**
1. Go to **Supabase Dashboard → Table Editor**
2. Click **`real_products`** table
3. Look at any product row
4. Check `service_url` column for your service URL
5. Check `setup_video_url` column for your YouTube video

**If they're not there:**
- Add them in **Step 2** above (the SQL will set them for all products)

---

**THAT'S IT! Everything is copy-paste ready!** 🚀

