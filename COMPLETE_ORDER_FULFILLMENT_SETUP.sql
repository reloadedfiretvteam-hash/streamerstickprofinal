-- ============================================================
-- COMPLETE ORDER FULFILLMENT SETUP
-- This creates all tables needed for:
-- 1. Cloaked products (Stripe sees compliant names, customers see real names)
-- 2. Customer accounts (username/password generation)
-- 3. Setup videos per product
-- 4. Email automation
-- ============================================================

-- 1. CUSTOMER ACCOUNTS TABLE (for username/password)
CREATE TABLE IF NOT EXISTS customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders_full(id),
  order_code text NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  service_url text,
  setup_video_url text,
  product_type text, -- 'firestick', 'iptv', etc.
  product_name text, -- Real product name (not cloaked)
  account_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage customer accounts" ON customer_accounts;
CREATE POLICY "Authenticated users can manage customer accounts" ON customer_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view their own account" ON customer_accounts;
CREATE POLICY "Customers can view their own account" ON customer_accounts FOR SELECT USING (true); -- Public read for order tracking

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
  product_id text NOT NULL, -- Can reference real_products or stripe_products
  product_type text NOT NULL, -- 'firestick', 'iptv', 'all'
  video_title text NOT NULL,
  video_url text NOT NULL,
  video_description text,
  thumbnail_url text,
  is_default boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_setup_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active setup videos" ON product_setup_videos;
CREATE POLICY "Public can read active setup videos" ON product_setup_videos FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage setup videos" ON product_setup_videos;
CREATE POLICY "Authenticated users can manage setup videos" ON product_setup_videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_product_setup_videos_product_id ON product_setup_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_setup_videos_product_type ON product_setup_videos(product_type);
CREATE INDEX IF NOT EXISTS idx_product_setup_videos_default ON product_setup_videos(is_default, is_active) WHERE is_default = true;

DROP TRIGGER IF EXISTS update_product_setup_videos_timestamp ON product_setup_videos;
CREATE TRIGGER update_product_setup_videos_timestamp 
  BEFORE UPDATE ON product_setup_videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 3. EMAIL TEMPLATES TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  template_type text NOT NULL, -- 'order_confirmation', 'credentials', 'admin_notification', etc.
  variables text[], -- Available template variables
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage email templates" ON email_templates;
CREATE POLICY "Authenticated users can manage email templates" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body_html, template_type, variables) VALUES
  (
    'stripe_order_confirmation',
    'Your Stream Stick Pro Order Confirmation - {{ORDER_CODE}}',
    '<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; } .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; } .credentials-box { background: white; border: 2px solid #3b82f6; padding: 20px; border-radius: 10px; margin: 20px 0; } .credential-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; } .credential-label { font-weight: bold; color: #1f2937; } .credential-value { font-family: monospace; color: #3b82f6; font-size: 16px; } .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Order Confirmed!</h2></div><div class="content"><p>Hi <strong>{{CUSTOMER_NAME}}</strong>,</p><p>Thank you for your order! Your payment has been confirmed.</p><div class="credentials-box"><h3>Your Account Credentials</h3><div class="credential-row"><span class="credential-label">Username:</span><span class="credential-value">{{USERNAME}}</span></div><div class="credential-row"><span class="credential-label">Password:</span><span class="credential-value">{{PASSWORD}}</span></div></div><p><strong>Order Details:</strong></p><ul><li>Order Code: {{ORDER_CODE}}</li><li>Product: {{PRODUCT_NAME}}</li><li>Total: ${{TOTAL_AMOUNT}}</li></ul><p><strong>Setup Instructions:</strong></p><p>Watch our setup video to get started:</p><a href="{{SETUP_VIDEO_URL}}" class="button">Watch Setup Video</a><p>Or visit: {{SETUP_VIDEO_URL}}</p><p>Need help? Reply to this email or contact support.</p></div></div></body></html>',
    'order_confirmation',
    ARRAY['ORDER_CODE', 'CUSTOMER_NAME', 'USERNAME', 'PASSWORD', 'PRODUCT_NAME', 'TOTAL_AMOUNT', 'SETUP_VIDEO_URL']
  ),
  (
    'admin_order_notification',
    'New Order: {{ORDER_CODE}} - {{CUSTOMER_NAME}}',
    '<!DOCTYPE html><html><body><h2>New Order Received</h2><p><strong>Order Code:</strong> {{ORDER_CODE}}</p><p><strong>Customer:</strong> {{CUSTOMER_NAME}} ({{CUSTOMER_EMAIL}})</p><p><strong>Product:</strong> {{PRODUCT_NAME}}</p><p><strong>Amount:</strong> ${{TOTAL_AMOUNT}}</p><p><strong>Payment Method:</strong> {{PAYMENT_METHOD}}</p><p><strong>Account Created:</strong> Username: {{USERNAME}}</p></body></html>',
    'admin_notification',
    ARRAY['ORDER_CODE', 'CUSTOMER_NAME', 'CUSTOMER_EMAIL', 'PRODUCT_NAME', 'TOTAL_AMOUNT', 'PAYMENT_METHOD', 'USERNAME']
  )
ON CONFLICT (name) DO NOTHING;

-- 4. ENSURE ORDERS_FULL TABLE HAS ALL NEEDED COLUMNS
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders_full' AND column_name = 'customer_account_id') THEN
    ALTER TABLE orders_full ADD COLUMN customer_account_id uuid REFERENCES customer_accounts(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders_full' AND column_name = 'email_sent') THEN
    ALTER TABLE orders_full ADD COLUMN email_sent boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders_full' AND column_name = 'credentials_sent') THEN
    ALTER TABLE orders_full ADD COLUMN credentials_sent boolean DEFAULT false;
  END IF;
END $$;

-- 5. ENSURE PRODUCTS HAVE CLOAKED_NAME AND SETUP_VIDEO COLUMNS
DO $$
BEGIN
  -- real_products table
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
  
  -- stripe_products table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stripe_products' AND column_name = 'cloaked_name') THEN
      ALTER TABLE stripe_products ADD COLUMN cloaked_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stripe_products' AND column_name = 'setup_video_url') THEN
      ALTER TABLE stripe_products ADD COLUMN setup_video_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stripe_products' AND column_name = 'service_url') THEN
      ALTER TABLE stripe_products ADD COLUMN service_url text;
    END IF;
  END IF;
END $$;

-- 6. CREATE FUNCTION TO GENERATE RANDOM USERNAME
CREATE OR REPLACE FUNCTION generate_username(customer_name text)
RETURNS text AS $$
DECLARE
  base_name text;
  random_suffix text;
  final_username text;
  counter int := 0;
BEGIN
  -- Extract first name and last initial
  base_name := LOWER(REGEXP_REPLACE(SPLIT_PART(customer_name, ' ', 1), '[^a-z0-9]', '', 'g'));
  
  -- Generate random 4-digit suffix
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  
  -- Combine
  final_username := base_name || random_suffix;
  
  -- Ensure uniqueness (check up to 10 times)
  WHILE EXISTS (SELECT 1 FROM customer_accounts WHERE username = final_username) AND counter < 10 LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    final_username := base_name || random_suffix;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE FUNCTION TO GENERATE RANDOM PASSWORD
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

-- ============================================================
-- COMPLETE! All tables and functions ready
-- ============================================================




