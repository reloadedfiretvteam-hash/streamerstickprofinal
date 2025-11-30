# ✅ COMPLETE ORDER FULFILLMENT SETUP

## 🎯 What This Does

Your checkout now automatically:

1. ✅ **Cloaked Products** - Stripe sees compliant product names (like "Digital Entertainment Service"), customers see real product names (like "Fire Stick 4K Max")
2. ✅ **Username/Password Generation** - Every customer gets unique credentials automatically
3. ✅ **Setup Video URLs** - Each customer receives a setup video link based on their product
4. ✅ **Email Automation** - Sends emails to BOTH customer and admin after successful payment:
   - Customer gets: Order confirmation, username, password, setup video
   - Admin gets: New order notification with customer details and credentials
5. ✅ **Account Creation** - Customer accounts stored in database

---

## 📋 STEP 1: Run SQL (COPY-PASTE THIS)

Go to **Supabase Dashboard → SQL Editor → New Query**, paste everything from `COMPLETE_ORDER_FULFILLMENT_SETUP.sql`:

[The SQL file is in your repo - open `COMPLETE_ORDER_FULFILLMENT_SETUP.sql` and copy all of it]

**OR** use this simplified version:

```sql
-- 1. Customer Accounts Table
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
CREATE POLICY "Public can read customer accounts" ON customer_accounts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage accounts" ON customer_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Product Setup Videos Table
CREATE TABLE IF NOT EXISTS product_setup_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_type text NOT NULL,
  video_title text NOT NULL,
  video_url text NOT NULL,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_setup_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active videos" ON product_setup_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage videos" ON product_setup_videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Functions for username/password generation
CREATE OR REPLACE FUNCTION generate_username(customer_name text)
RETURNS text AS $$
DECLARE
  base_name text;
  random_suffix text;
  final_username text;
BEGIN
  base_name := LOWER(REGEXP_REPLACE(SPLIT_PART(customer_name, ' ', 1), '[^a-z0-9]', '', 'g'));
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  final_username := base_name || random_suffix;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM customer_accounts WHERE username = final_username) LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    final_username := base_name || random_suffix;
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

-- 4. Add cloaked_name and setup_video_url to products
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
```

Click **Run**.

---

## 📋 STEP 2: Update Stripe Webhook

The webhook function has been updated. You need to deploy it:

```bash
supabase functions deploy stripe-webhook
```

**OR** use Supabase Dashboard:
1. Go to **Edge Functions**
2. Find `stripe-webhook`
3. Replace code with the updated version from your repo
4. **Deploy**

---

## 📋 STEP 3: Add Setup Videos to Products

### Option A: Add video URL directly to product

Go to your admin panel → Products → Edit product:
- Add `setup_video_url` (e.g., `https://youtube.com/watch?v=...`)
- Add `cloaked_name` (e.g., `Digital Entertainment Service - Premium`)
- Add `service_url` (if applicable)

### Option B: Use product_setup_videos table

Run this SQL to add default videos:

```sql
-- Add default setup videos
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) VALUES
  ('firestick', 'Fire Stick Setup Guide', 'https://youtube.com/watch?v=YOUR_VIDEO_ID', true, true),
  ('iptv', 'IPTV Subscription Setup', 'https://youtube.com/watch?v=YOUR_VIDEO_ID', true, true)
ON CONFLICT DO NOTHING;
```

---

## 📋 STEP 4: Set Admin Email

In Supabase Edge Functions → Secrets, add:
- `ADMIN_EMAIL` = `reloadedfirestvteam@gmail.com` (or your admin email)

---

## ✅ HOW IT WORKS

### When a Customer Pays:

1. **Stripe Payment Succeeds** → Webhook triggers
2. **Cloaked Name** → Stripe metadata has cloaked name (compliant), we fetch real name from database
3. **Generate Credentials** → Username (firstname + 4 digits) + Password (12 chars)
4. **Get Setup Video** → From product or product_setup_videos table
5. **Create Account** → Save to `customer_accounts` table
6. **Send Emails**:
   - **Customer Email**: Order confirmation, username, password, setup video
   - **Admin Email**: New order notification with credentials
7. **Save Order** → All data saved to `orders_full` table

### Example Flow:

**Customer sees in checkout:**
- Product: "Fire Stick 4K Max - Pre-Loaded"

**Stripe sees:**
- Product: "Digital Entertainment Service - Premium" (cloaked)

**Customer receives email:**
```
Hi John,

Your account credentials:
Username: john1234
Password: Xy7$mK9#pQ2w

Watch setup video: https://youtube.com/watch?v=...
```

**Admin receives email:**
```
New Order: STRIPE-A1B2C3D4
Customer: John Doe (john@example.com)
Product: Fire Stick 4K Max - Pre-Loaded
Username: john1234
Password: Xy7$mK9#pQ2w
```

---

## 🔧 TESTING

1. Make a test purchase with Stripe test card: `4242 4242 4242 4242`
2. Check Supabase:
   - `customer_accounts` table → Should have new account
   - `orders_full` table → Should have new order
3. Check email inbox (customer + admin emails)
4. Verify credentials work with your service

---

## ✅ CHECKLIST

- [ ] SQL run in Supabase
- [ ] Stripe webhook deployed
- [ ] Admin email set in Supabase secrets
- [ ] Setup videos added to products
- [ ] Cloaked names added to products (for Stripe compliance)
- [ ] Test purchase completed
- [ ] Emails received (customer + admin)
- [ ] Credentials generated and saved

---

## 🎉 DONE!

Your checkout now automatically:
- ✅ Creates customer accounts
- ✅ Generates username/password
- ✅ Sends emails to customer and admin
- ✅ Provides setup video URLs
- ✅ Uses cloaked names for Stripe (compliance)

Everything is integrated into the checkout process!

