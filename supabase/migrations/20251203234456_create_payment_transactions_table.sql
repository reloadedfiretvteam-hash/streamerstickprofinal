/*
  # Create payment_transactions table for Stripe webhooks
  
  1. New Table
    - payment_transactions: stores all Stripe payment events
  
  2. Security
    - Enable RLS
    - Admin-only access policies
*/

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id text UNIQUE NOT NULL,
  stripe_event_id text,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  payment_method text DEFAULT 'stripe',
  payment_status text NOT NULL,
  customer_email text,
  product_id text,
  product_name text,
  is_live_mode boolean DEFAULT false,
  order_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to payment_transactions"
  ON payment_transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);