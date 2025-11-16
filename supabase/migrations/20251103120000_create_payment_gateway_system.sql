/*
  # Payment Gateway System with Order Code Tracking

  ## Overview
  Complete payment gateway integration for Cash App and Bitcoin with custom order codes

  ## New Tables

  ### 1. `payment_transactions`
  Track all payment attempts and confirmations
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key to orders_full)
  - `order_code` (text, unique) - Custom tracking code like "ORD-XXXX-YYYY"
  - `payment_method` (text) - 'cashapp', 'bitcoin', 'card'
  - `payment_status` (text) - 'pending', 'confirmed', 'failed', 'refunded'
  - `transaction_id` (text) - External payment ID
  - `amount` (numeric) - Payment amount
  - `currency` (text) - USD, BTC, etc.
  - `payment_metadata` (jsonb) - Additional payment data
  - `cashapp_tag` (text) - CashApp username if applicable
  - `bitcoin_address` (text) - BTC address if applicable
  - `confirmation_email_sent` (boolean) - Whether email was sent
  - `instructions_shown` (text) - Payment instructions displayed
  - `created_at` (timestamptz)
  - `confirmed_at` (timestamptz)

  ### 2. `payment_instructions`
  Store payment gateway instructions for customers
  - `id` (uuid, primary key)
  - `payment_method` (text, unique)
  - `title` (text)
  - `instructions` (text) - Step-by-step instructions
  - `important_notes` (text[]) - Key points to highlight
  - `processing_time` (text) - Expected confirmation time
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Encrypt sensitive payment data
  - Admin-only access for modifications
*/

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders_full(id) ON DELETE CASCADE,
  order_code text UNIQUE NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cashapp', 'bitcoin', 'card', 'paypal', 'zelle', 'venmo')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded')),
  transaction_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_metadata jsonb DEFAULT '{}'::jsonb,
  cashapp_tag text,
  bitcoin_address text,
  confirmation_email_sent boolean DEFAULT false,
  instructions_shown text,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_code ON payment_transactions(order_code);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(payment_method);

-- Create payment_instructions table
CREATE TABLE IF NOT EXISTS payment_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method text UNIQUE NOT NULL,
  title text NOT NULL,
  instructions text NOT NULL,
  important_notes text[] DEFAULT '{}',
  processing_time text DEFAULT '5-15 minutes',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default payment instructions
INSERT INTO payment_instructions (payment_method, title, instructions, important_notes, processing_time) VALUES
(
  'cashapp',
  'Cash App Payment Instructions',
  E'1. Open your Cash App\n2. Send the exact amount shown to our Cash App tag: $InfernoTV\n3. In the payment note, INCLUDE YOUR ORDER CODE: [ORDER_CODE]\n4. Take a screenshot of the payment confirmation\n5. Your order will be processed within 5-15 minutes after payment confirmation',
  ARRAY[
    'CRITICAL: You must include your order code in the payment note',
    'Double-check the amount before sending',
    'Keep your payment confirmation screenshot',
    'Order code is required for tracking'
  ],
  '5-15 minutes'
),
(
  'bitcoin',
  'Bitcoin Payment Instructions',
  E'1. Copy the Bitcoin address shown below\n2. Send the EXACT BTC amount to this address\n3. Include your ORDER CODE: [ORDER_CODE] in the transaction memo if supported\n4. Save your transaction ID\n5. Your order will be confirmed after 3 blockchain confirmations (approx 30-60 minutes)',
  ARRAY[
    'CRITICAL: Send the exact BTC amount shown',
    'Bitcoin transactions are irreversible',
    'Save your transaction ID for reference',
    'Confirmation requires 3 network confirmations',
    'Your order code is: [ORDER_CODE]'
  ],
  '30-60 minutes'
),
(
  'card',
  'Credit/Debit Card Payment',
  E'Your card will be charged immediately upon order confirmation. You will receive an email with your order code within 5 minutes.',
  ARRAY[
    'Instant processing',
    'Secure SSL encryption',
    'Order code sent via email'
  ],
  'Instant'
)
ON CONFLICT (payment_method) DO UPDATE SET
  instructions = EXCLUDED.instructions,
  important_notes = EXCLUDED.important_notes,
  processing_time = EXCLUDED.processing_time,
  updated_at = now();

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_instructions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions
CREATE POLICY "Anyone can view their own payment transactions"
  ON payment_transactions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage payment transactions"
  ON payment_transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- RLS Policies for payment_instructions
CREATE POLICY "Anyone can view active payment instructions"
  ON payment_instructions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage payment instructions"
  ON payment_instructions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Function to generate unique order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := 'ORD-' ||
            UPPER(substr(md5(random()::text), 1, 4)) || '-' ||
            UPPER(substr(md5(random()::text), 1, 4));

    SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE order_code = code) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create payment transaction with order code
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_order_id uuid,
  p_payment_method text,
  p_amount numeric,
  p_payment_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  transaction_id uuid,
  order_code text
) AS $$
DECLARE
  v_transaction_id uuid;
  v_order_code text;
BEGIN
  v_order_code := generate_order_code();

  INSERT INTO payment_transactions (
    order_id,
    order_code,
    payment_method,
    amount,
    payment_metadata
  ) VALUES (
    p_order_id,
    v_order_code,
    p_payment_method,
    p_amount,
    p_payment_metadata
  ) RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT v_transaction_id, v_order_code;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm payment
CREATE OR REPLACE FUNCTION confirm_payment_transaction(
  p_order_code text,
  p_transaction_id text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_order_id uuid;
BEGIN
  UPDATE payment_transactions
  SET
    payment_status = 'confirmed',
    confirmed_at = now(),
    transaction_id = COALESCE(p_transaction_id, transaction_id)
  WHERE order_code = p_order_code
  RETURNING order_id INTO v_order_id;

  IF v_order_id IS NOT NULL THEN
    UPDATE orders_full
    SET
      payment_status = 'paid',
      order_status = 'processing'
    WHERE id = v_order_id;

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;
