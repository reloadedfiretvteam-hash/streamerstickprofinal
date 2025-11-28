/*
  # Add Stripe PaymentIntent tracking to orders table
  
  Adds a column to track Stripe PaymentIntent IDs for orders processed
  through the Stripe payment flow.
*/

-- Add stripe_payment_intent_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id text;
    
    -- Create index for faster lookup by PaymentIntent ID
    CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent 
      ON orders(stripe_payment_intent_id) 
      WHERE stripe_payment_intent_id IS NOT NULL;
  END IF;
END $$;
