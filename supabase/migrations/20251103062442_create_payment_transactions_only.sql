/*
  # Payment Transactions with Order Code Tracking

  ## Overview
  Create payment transactions table for tracking payments with unique order codes

  ## New Tables
  1. `payment_transactions` - Track all payments with custom order codes

  ## Functions
  - generate_order_code() - Generate unique ORD-XXXX-YYYY codes
  - create_payment_transaction() - Create new payment with order code
  - confirm_payment_transaction() - Confirm payment and update order
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_code ON payment_transactions(order_code);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(payment_method);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view payment transactions"
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

-- Update existing payment_instructions with proper data
INSERT INTO payment_instructions (gateway_name, instruction_title, instruction_text, important_notes, display_order) VALUES
(
  'cashapp',
  'Cash App Payment Instructions',
  E'1. Open your Cash App mobile app\n2. Click the $ icon to start a payment\n3. Send the EXACT amount shown above to: $InfernoTV\n4. CRITICAL: In the payment note, write your ORDER CODE: [ORDER_CODE]\n5. Complete the payment\n6. Screenshot your confirmation\n7. Your order will be processed within 5-15 minutes',
  ARRAY[
    'YOU MUST include your order code in the payment note',
    'Send the exact amount - do not round up or down',
    'Keep your payment screenshot for records',
    'Processing time: 5-15 minutes after payment',
    'Your unique order code is shown above in RED'
  ],
  1
),
(
  'bitcoin',
  'Bitcoin (BTC) Payment Instructions',
  E'1. Copy the Bitcoin address shown below\n2. Open your Bitcoin wallet\n3. Send the EXACT BTC amount displayed\n4. If your wallet supports memos, add: [ORDER_CODE]\n5. Save your transaction ID\n6. Confirmation requires 3 network confirmations (30-60 minutes)',
  ARRAY[
    'Send EXACTLY the BTC amount shown - Bitcoin transactions cannot be reversed',
    'Double-check the wallet address before sending',
    'Your order code: [ORDER_CODE]',
    'Save your transaction ID for tracking',
    'Processing time: 30-60 minutes (3 confirmations required)',
    'DO NOT send from an exchange - use a personal wallet'
  ],
  2
)
ON CONFLICT (gateway_name) DO UPDATE SET
  instruction_text = EXCLUDED.instruction_text,
  important_notes = EXCLUDED.important_notes,
  updated_at = now();

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

-- Function to create payment transaction
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
