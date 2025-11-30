/*
  # Add Stripe Payment Link Column
  
  This migration adds a stripe_payment_link column to the stripe_products 
  and real_products tables to support individual Stripe Payment Links per product.
  
  When a product has a payment link set, clicking Buy will redirect directly 
  to the Stripe Payment Link. If no link is set, it falls back to the internal 
  /stripe-checkout page.
*/

-- Add stripe_payment_link column to stripe_products table
ALTER TABLE stripe_products 
ADD COLUMN IF NOT EXISTS stripe_payment_link text;

-- Add stripe_payment_link column to real_products table
ALTER TABLE real_products 
ADD COLUMN IF NOT EXISTS stripe_payment_link text;

-- Add comment for documentation
COMMENT ON COLUMN stripe_products.stripe_payment_link IS 'Optional Stripe Payment Link URL. If set, Buy button redirects here directly.';
COMMENT ON COLUMN real_products.stripe_payment_link IS 'Optional Stripe Payment Link URL. If set, Buy button redirects here directly.';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_products_payment_link ON stripe_products(stripe_payment_link) WHERE stripe_payment_link IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_real_products_payment_link ON real_products(stripe_payment_link) WHERE stripe_payment_link IS NOT NULL;
