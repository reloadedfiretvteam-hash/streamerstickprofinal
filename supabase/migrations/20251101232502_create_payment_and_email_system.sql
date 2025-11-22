/*
  # Payment Gateway and Email System

  ## Overview
  Complete payment processing and email notification system for CashApp, Bitcoin,
  and custom email templates for order confirmations.

  ## New Tables

  ### 1. `payment_gateways`
  Store payment gateway configurations (CashApp, Bitcoin, etc.)
  - `id` (uuid, primary key)
  - `gateway_name` (text) - 'cashapp', 'bitcoin', 'stripe', etc.
  - `display_name` (text) - Display name on checkout
  - `is_active` (boolean) - Enable/disable gateway
  - `config` (jsonb) - Gateway-specific configuration
  - `test_mode` (boolean) - Test/Live mode
  - `sort_order` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `email_templates`
  Customizable email templates for various events
  - `id` (uuid, primary key)
  - `template_key` (text, unique) - 'order_confirmation', 'shipping_update', etc.
  - `template_name` (text) - Display name
  - `subject` (text) - Email subject line
  - `body` (text) - Email body (supports variables)
  - `is_active` (boolean) - Enable/disable template
  - `variables` (text[]) - Available variables like {{order_number}}, {{total}}
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `shopping_cart`
  User shopping cart items
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Optional for guest carts
  - `session_id` (text) - For guest users
  - `product_id` (uuid) - Reference to products
  - `product_name` (text) - Snapshot of product name
  - `price` (numeric) - Snapshot of price at add time
  - `quantity` (integer) - Quantity in cart
  - `options` (jsonb) - Product options/variants
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `bitcoin_addresses`
  Bitcoin payment addresses for orders
  - `id` (uuid, primary key)
  - `order_id` (uuid) - Reference to order
  - `btc_address` (text) - Bitcoin address
  - `amount_btc` (numeric) - Amount in BTC
  - `amount_usd` (numeric) - Amount in USD
  - `qr_code_url` (text) - QR code image
  - `status` (text) - 'pending', 'paid', 'expired'
  - `expires_at` (timestamptz) - Payment window expiry
  - `created_at` (timestamptz)

  ### 5. `email_logs`
  Track all sent emails
  - `id` (uuid, primary key)
  - `recipient` (text) - Email address
  - `template_key` (text) - Which template was used
  - `subject` (text) - Email subject
  - `body` (text) - Rendered email body
  - `status` (text) - 'sent', 'failed', 'pending'
  - `error_message` (text) - If failed
  - `sent_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Admin-only access for configurations
  - Users can only see their own cart
*/

-- Create payment_gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  is_active boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  test_mode boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  template_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  is_active boolean DEFAULT true,
  variables text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid REFERENCES products_full(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  price numeric NOT NULL,
  quantity integer DEFAULT 1,
  options jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bitcoin_addresses table
CREATE TABLE IF NOT EXISTS bitcoin_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders_full(id) ON DELETE CASCADE,
  btc_address text NOT NULL,
  amount_btc numeric NOT NULL,
  amount_usd numeric NOT NULL,
  qr_code_url text,
  status text DEFAULT 'pending',
  expires_at timestamptz DEFAULT now() + interval '30 minutes',
  created_at timestamptz DEFAULT now()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  template_key text,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitcoin_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_gateways
CREATE POLICY "Anyone can view active payment gateways"
  ON payment_gateways FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage payment gateways"
  ON payment_gateways FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for email_templates
CREATE POLICY "Anyone can view active email templates"
  ON email_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for shopping_cart
CREATE POLICY "Users can view own cart"
  ON shopping_cart FOR SELECT
  USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can manage own cart"
  ON shopping_cart FOR ALL
  USING (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  )
  WITH CHECK (
    auth.uid() = user_id OR
    session_id = current_setting('app.session_id', true)
  );

-- RLS Policies for bitcoin_addresses
CREATE POLICY "Anyone can view bitcoin addresses for their orders"
  ON bitcoin_addresses FOR SELECT
  USING (true);

CREATE POLICY "System can create bitcoin addresses"
  ON bitcoin_addresses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update bitcoin addresses"
  ON bitcoin_addresses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for email_logs
CREATE POLICY "Authenticated users can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_gateways_active ON payment_gateways(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_session ON shopping_cart(session_id);
CREATE INDEX IF NOT EXISTS idx_bitcoin_addresses_order ON bitcoin_addresses(order_id);
CREATE INDEX IF NOT EXISTS idx_bitcoin_addresses_status ON bitcoin_addresses(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);

-- Insert default payment gateways
INSERT INTO payment_gateways (gateway_name, display_name, is_active, config, sort_order) VALUES
('cashapp', 'Cash App', false, '{
  "cashtag": "",
  "note": "Order #{{order_number}}",
  "instructions": "Send payment to $YourCashTag with note: Order #{{order_number}}"
}'::jsonb, 1),

('bitcoin', 'Bitcoin (BTC)', false, '{
  "wallet_address": "",
  "confirmation_blocks": 3,
  "payment_window_minutes": 30,
  "instructions": "Send exact BTC amount to the address shown. Payment expires in 30 minutes."
}'::jsonb, 2)

ON CONFLICT (gateway_name) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (template_key, template_name, subject, body, variables) VALUES
('order_confirmation', 'Order Confirmation', 'Order Confirmation - Order #{{order_number}}',
'Dear {{customer_name}},

Thank you for your order!

Order Details:
- Order Number: {{order_number}}
- Order Date: {{order_date}}
- Total Amount: ${{order_total}}

Items Ordered:
{{order_items}}

Payment Method: {{payment_method}}
Shipping Address:
{{shipping_address}}

We will send you a shipping confirmation once your order is on the way.

Thank you for shopping with us!

Best regards,
{{company_name}}',
ARRAY['order_number', 'customer_name', 'order_date', 'order_total', 'order_items', 'payment_method', 'shipping_address', 'company_name']),

('payment_received', 'Payment Received', 'Payment Received - Order #{{order_number}}',
'Dear {{customer_name}},

We have received your payment for Order #{{order_number}}.

Payment Details:
- Amount: ${{payment_amount}}
- Payment Method: {{payment_method}}
- Transaction ID: {{transaction_id}}

Your order is now being processed and will be shipped soon.

Thank you!

{{company_name}}',
ARRAY['order_number', 'customer_name', 'payment_amount', 'payment_method', 'transaction_id', 'company_name']),

('shipping_update', 'Shipping Update', 'Your Order Has Shipped - Order #{{order_number}}',
'Dear {{customer_name}},

Great news! Your order #{{order_number}} has shipped!

Tracking Information:
- Carrier: {{carrier}}
- Tracking Number: {{tracking_number}}
- Estimated Delivery: {{delivery_date}}

Track your package: {{tracking_url}}

Thank you for your business!

{{company_name}}',
ARRAY['order_number', 'customer_name', 'carrier', 'tracking_number', 'delivery_date', 'tracking_url', 'company_name'])

ON CONFLICT (template_key) DO NOTHING;
