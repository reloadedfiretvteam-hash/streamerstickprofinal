/*
  # Add payment_link_url Column to real_products
  
  Adds the payment_link_url column to support Stripe Payment Links as an alternative
  to PaymentIntent for specific products.
*/

-- Add payment_link_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'payment_link_url'
  ) THEN
    ALTER TABLE real_products ADD COLUMN payment_link_url text;
    RAISE NOTICE 'Added payment_link_url column to real_products';
  ELSE
    RAISE NOTICE 'payment_link_url column already exists in real_products';
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_real_products_payment_link_url ON real_products(payment_link_url) WHERE payment_link_url IS NOT NULL;

-- Comment
COMMENT ON COLUMN real_products.payment_link_url IS 'Stripe Payment Link URL (optional). If provided, customers are redirected to this link instead of using PaymentIntent';
