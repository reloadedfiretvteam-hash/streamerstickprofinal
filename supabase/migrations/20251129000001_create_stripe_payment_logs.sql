/*
  # Create Stripe Payment Logs Table

  ## Overview
  Create comprehensive logging table for all Stripe payment events with test/live mode distinction.

  ## New Tables
  1. `stripe_payment_logs` - Stores all Stripe webhook events with detailed logging

  ## Features
  - Distinguishes between test and live transactions
  - Tracks all payment event types (succeeded, failed, canceled, refunded)
  - Stores full event metadata for debugging
  - Includes timestamp tracking for event processing
*/

-- Create stripe_payment_logs table
CREATE TABLE IF NOT EXISTS stripe_payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  log_level text DEFAULT 'info' CHECK (log_level IN ('info', 'warning', 'error', 'debug')),
  is_test_mode boolean DEFAULT false,
  environment text DEFAULT 'live' CHECK (environment IN ('test', 'live')),
  payment_intent_id text,
  amount numeric(10,2),
  currency text,
  payment_status text,
  customer_id text,
  customer_email text,
  metadata jsonb DEFAULT '{}'::jsonb,
  description text,
  payment_method_types text[] DEFAULT ARRAY[]::text[],
  raw_event_data jsonb DEFAULT '{}'::jsonb,
  additional_details jsonb DEFAULT '{}'::jsonb,
  event_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  
  -- Add unique constraint on event_id to prevent duplicate logging
  CONSTRAINT stripe_payment_logs_event_id_unique UNIQUE (event_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_stripe_logs_event_type ON stripe_payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_is_test ON stripe_payment_logs(is_test_mode);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_environment ON stripe_payment_logs(environment);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_payment_intent ON stripe_payment_logs(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_payment_status ON stripe_payment_logs(payment_status);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_created ON stripe_payment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_log_level ON stripe_payment_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_stripe_logs_customer_email ON stripe_payment_logs(customer_email);

-- Enable RLS
ALTER TABLE stripe_payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can read logs
CREATE POLICY "Admins can view stripe payment logs"
  ON stripe_payment_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow service role to insert logs (from webhook function)
CREATE POLICY "Service role can insert stripe payment logs"
  ON stripe_payment_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow public insert for webhook function using service role key
CREATE POLICY "Allow webhook inserts"
  ON stripe_payment_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create view for test transactions only
CREATE OR REPLACE VIEW stripe_test_payment_logs AS
SELECT *
FROM stripe_payment_logs
WHERE is_test_mode = true
ORDER BY created_at DESC;

-- Create view for live transactions only
CREATE OR REPLACE VIEW stripe_live_payment_logs AS
SELECT *
FROM stripe_payment_logs
WHERE is_test_mode = false
ORDER BY created_at DESC;

-- Create view for failed payments
CREATE OR REPLACE VIEW stripe_failed_payments AS
SELECT *
FROM stripe_payment_logs
WHERE log_level = 'error'
  OR event_type LIKE '%failed%'
  OR event_type LIKE '%canceled%'
ORDER BY created_at DESC;

-- Function to get payment summary
CREATE OR REPLACE FUNCTION get_stripe_payment_summary(
  p_start_date timestamptz DEFAULT (now() - interval '30 days'),
  p_end_date timestamptz DEFAULT now(),
  p_include_test boolean DEFAULT false
)
RETURNS TABLE(
  total_successful_payments bigint,
  total_failed_payments bigint,
  total_amount numeric,
  avg_payment_amount numeric,
  payment_methods jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'payment_intent.succeeded') AS total_successful_payments,
    COUNT(*) FILTER (WHERE event_type = 'payment_intent.payment_failed') AS total_failed_payments,
    COALESCE(SUM(amount) FILTER (WHERE event_type = 'payment_intent.succeeded'), 0) AS total_amount,
    COALESCE(AVG(amount) FILTER (WHERE event_type = 'payment_intent.succeeded'), 0) AS avg_payment_amount,
    jsonb_object_agg(
      COALESCE((payment_method_types)[1], 'unknown'),
      COUNT(*)
    ) AS payment_methods
  FROM stripe_payment_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date
    AND (p_include_test OR NOT is_test_mode);
END;
$$ LANGUAGE plpgsql;

-- Add stripe_payment_intent_id column to orders_full if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders_full' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN stripe_payment_intent_id text;
  END IF;
END $$;

-- Create index on stripe_payment_intent_id
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders_full(stripe_payment_intent_id);

COMMENT ON TABLE stripe_payment_logs IS 'Comprehensive log of all Stripe payment webhook events with test/live mode distinction';
COMMENT ON COLUMN stripe_payment_logs.is_test_mode IS 'True if this is a test transaction (not livemode in Stripe)';
COMMENT ON COLUMN stripe_payment_logs.environment IS 'Environment indicator: test or live';
COMMENT ON COLUMN stripe_payment_logs.log_level IS 'Log severity: info, warning, error, debug';
