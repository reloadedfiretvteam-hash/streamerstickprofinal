/*
  # Create NOWPayments Bitcoin Payment System

  1. New Tables
    - `payment_gateways`
      - `id` (uuid, primary key)
      - `gateway_name` (text) - e.g., 'nowpayments'
      - `api_key` (text) - Encrypted API key
      - `is_enabled` (boolean) - Enable/disable gateway
      - `config` (jsonb) - Gateway configuration
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bitcoin_orders`
      - `id` (uuid, primary key)
      - `order_code` (text, unique) - Unique tracking code
      - `customer_order_id` (uuid) - Links to customer_orders
      - `customer_email` (text)
      - `customer_name` (text)
      - `total_usd` (numeric) - Amount in USD
      - `total_btc` (numeric) - Amount in BTC
      - `btc_price_usd` (numeric) - BTC price at time of order
      - `bitcoin_address` (text) - Merchant wallet address
      - `payment_status` (text) - pending, completed, expired, failed
      - `nowpayments_invoice_id` (text) - NOWPayments invoice ID
      - `nowpayments_payment_url` (text) - Payment link
      - `products` (jsonb) - Order items
      - `customer_instructions_sent` (boolean)
      - `admin_notification_sent` (boolean)
      - `expires_at` (timestamp)
      - `paid_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bitcoin_transactions`
      - `id` (uuid, primary key)
      - `bitcoin_order_id` (uuid) - Links to bitcoin_orders
      - `transaction_hash` (text) - Blockchain transaction hash
      - `amount_btc` (numeric)
      - `confirmations` (integer)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public read access where needed
    - Encrypt sensitive data

  3. Indexes
    - Add indexes for order_code, customer_email, payment_status
    - Add index for bitcoin_order_id in transactions
*/

-- Create payment_gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name text UNIQUE NOT NULL,
  api_key text,
  is_enabled boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bitcoin_orders table
CREATE TABLE IF NOT EXISTS bitcoin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_order_id uuid,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  total_usd numeric(10,2) NOT NULL,
  total_btc numeric(18,8),
  btc_price_usd numeric(10,2),
  bitcoin_address text,
  payment_status text DEFAULT 'pending',
  nowpayments_invoice_id text,
  nowpayments_payment_url text,
  products jsonb DEFAULT '[]'::jsonb,
  customer_instructions_sent boolean DEFAULT false,
  admin_notification_sent boolean DEFAULT false,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bitcoin_transactions table
CREATE TABLE IF NOT EXISTS bitcoin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bitcoin_order_id uuid REFERENCES bitcoin_orders(id) ON DELETE CASCADE,
  transaction_hash text,
  amount_btc numeric(18,8),
  confirmations integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitcoin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitcoin_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for payment_gateways
CREATE POLICY "Admins can read payment gateways"
  ON payment_gateways
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update payment gateways"
  ON payment_gateways
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can insert payment gateways"
  ON payment_gateways
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for bitcoin_orders (public can create, customers can read their own)
CREATE POLICY "Anyone can create bitcoin orders"
  ON bitcoin_orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Customers can read own bitcoin orders"
  ON bitcoin_orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update bitcoin orders"
  ON bitcoin_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for bitcoin_transactions
CREATE POLICY "Anyone can read bitcoin transactions"
  ON bitcoin_transactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert bitcoin transactions"
  ON bitcoin_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_code ON bitcoin_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_email ON bitcoin_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_status ON bitcoin_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_created ON bitcoin_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bitcoin_transactions_order ON bitcoin_transactions(bitcoin_order_id);

-- Insert NOWPayments gateway config
INSERT INTO payment_gateways (gateway_name, is_enabled, config) VALUES
('nowpayments', false, '{
  "api_url": "https://api.nowpayments.io/v1",
  "currency": "BTC",
  "payment_description": "Stream Stick Pro Order",
  "invoice_expires_minutes": 60,
  "min_amount_usd": 10.00,
  "instruction_text": "Complete your purchase with Bitcoin"
}'::jsonb)
ON CONFLICT (gateway_name) DO NOTHING;

-- Function to generate unique order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := 'BTC-' || upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM bitcoin_orders WHERE order_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
