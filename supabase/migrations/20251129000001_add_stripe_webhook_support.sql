/*
  # Add Stripe Webhook Support to Payment Transactions

  This migration adds columns required for storing Stripe webhook data
  and supports distinguishing between test and live payment intents.

  1. New Columns:
    - stripe_payment_intent_id: The Stripe PaymentIntent ID
    - stripe_event_id: The Stripe event ID from webhook
    - is_live_mode: Boolean to distinguish test vs live transactions
    - product_id: Reference to the product purchased
    - product_name: Name of the product for display

  2. Indexes:
    - Index on stripe_payment_intent_id for quick lookups
    - Index on is_live_mode for filtering test/live transactions
*/

-- Add Stripe-specific columns to payment_transactions
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_event_id text,
  ADD COLUMN IF NOT EXISTS is_live_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS customer_email text;

-- Update the payment_method check constraint to include 'stripe'
-- First drop the existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_transactions_payment_method_check'
  ) THEN
    ALTER TABLE payment_transactions 
    DROP CONSTRAINT payment_transactions_payment_method_check;
  END IF;
END $$;

-- Re-add the constraint with 'stripe' included
ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_payment_method_check
  CHECK (payment_method IN ('cashapp', 'bitcoin', 'card', 'paypal', 'zelle', 'venmo', 'stripe'));

-- Create indexes for Stripe fields
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi 
  ON payment_transactions(stripe_payment_intent_id) 
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_live_mode 
  ON payment_transactions(is_live_mode);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_event 
  ON payment_transactions(stripe_event_id) 
  WHERE stripe_event_id IS NOT NULL;

-- Create a function to get Stripe transaction statistics
CREATE OR REPLACE FUNCTION get_stripe_transaction_stats()
RETURNS TABLE(
  total_transactions bigint,
  live_transactions bigint,
  test_transactions bigint,
  completed_transactions bigint,
  failed_transactions bigint,
  total_revenue_usd numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_transactions,
    COUNT(*) FILTER (WHERE is_live_mode = true)::bigint as live_transactions,
    COUNT(*) FILTER (WHERE is_live_mode = false)::bigint as test_transactions,
    COUNT(*) FILTER (WHERE payment_status = 'completed' OR payment_status = 'confirmed')::bigint as completed_transactions,
    COUNT(*) FILTER (WHERE payment_status = 'failed')::bigint as failed_transactions,
    COALESCE(SUM(amount) FILTER (WHERE (payment_status = 'completed' OR payment_status = 'confirmed') AND is_live_mode = true), 0) as total_revenue_usd
  FROM payment_transactions
  WHERE stripe_payment_intent_id IS NOT NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_stripe_transaction_stats() TO authenticated;

-- Update the RLS policy to allow the webhook to insert transactions
-- The webhook uses the service role key, so this should work, but let's ensure
-- there's a policy for inserting via API
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_transactions' 
    AND policyname = 'Service role can insert payment transactions'
  ) THEN
    CREATE POLICY "Service role can insert payment transactions"
      ON payment_transactions FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ Stripe webhook support added to payment_transactions';
  RAISE NOTICE 'New columns: stripe_payment_intent_id, stripe_event_id, is_live_mode, product_id, product_name, customer_email';
  RAISE NOTICE 'New function: get_stripe_transaction_stats()';
END $$;
