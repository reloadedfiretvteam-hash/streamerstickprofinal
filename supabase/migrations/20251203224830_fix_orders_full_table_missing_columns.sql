/*
  # Fix orders_full Table - Add Missing Columns
  
  Adds columns required by the checkout system to the actual orders_full table:
  - payment_intent_id: Stripe payment ID for tracking
  - status: Order status (processing, completed, etc.)
  - items: JSON array of order items
  - tax: Tax amount
  - total: Total amount (same as total_amount but numeric)
  - customer_username: IPTV login username
  - customer_password: IPTV login password
  - service_url: IPTV service URL (e.g., http://ky-tv.cc)
*/

-- Add missing columns to orders_full table
DO $$
BEGIN
  -- payment_intent_id (Stripe)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'payment_intent_id'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN payment_intent_id text;
  END IF;

  -- status (order status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN status text DEFAULT 'pending';
  END IF;

  -- items (cart items as JSON)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'items'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN items jsonb DEFAULT '[]';
  END IF;

  -- tax (tax amount)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'tax'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN tax numeric(10,2) DEFAULT 0;
  END IF;

  -- total (total amount as numeric)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'total'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN total numeric(10,2) DEFAULT 0;
  END IF;

  -- customer_username (IPTV login)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'customer_username'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN customer_username text;
  END IF;

  -- customer_password (IPTV login)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'customer_password'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN customer_password text;
  END IF;

  -- service_url (IPTV service URL)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'service_url'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN service_url text DEFAULT 'http://ky-tv.cc';
  END IF;
END $$;

-- Recreate the orders view to include new columns
DROP VIEW IF EXISTS orders;
CREATE VIEW orders AS SELECT * FROM orders_full;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_full_payment_intent ON orders_full(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_full_status ON orders_full(status);
CREATE INDEX IF NOT EXISTS idx_orders_full_customer_email ON orders_full(customer_email);

-- Comments
COMMENT ON COLUMN orders_full.payment_intent_id IS 'Stripe PaymentIntent ID for payment tracking';
COMMENT ON COLUMN orders_full.status IS 'Order status: pending, processing, completed, cancelled';
COMMENT ON COLUMN orders_full.items IS 'JSON array of order items with product details';
COMMENT ON COLUMN orders_full.customer_username IS 'Generated IPTV username for customer login';
COMMENT ON COLUMN orders_full.customer_password IS 'Generated IPTV password for customer login';
COMMENT ON COLUMN orders_full.service_url IS 'IPTV service URL (default: http://ky-tv.cc)';
