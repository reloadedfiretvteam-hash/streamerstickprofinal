/*
  # Add Customer Details to Orders Table

  1. Changes
    - Add customer_name column (required)
    - Add customer_phone column (optional)
    - Add shipping_address column (optional)
    - Add shipping_city column (optional)
    - Add shipping_state column (optional)
    - Add shipping_zip column (optional)
  
  2. Purpose
    - Capture complete customer information for order fulfillment
    - Support physical product shipping
    - Enable better customer communication
*/

-- Add customer detail columns to orders table
DO $$ 
BEGIN
  -- Add customer_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
  END IF;

  -- Add customer_phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_phone TEXT;
  END IF;

  -- Add shipping_address if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address TEXT;
  END IF;

  -- Add shipping_city if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_city'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_city TEXT;
  END IF;

  -- Add shipping_state if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_state'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_state TEXT;
  END IF;

  -- Add shipping_zip if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_zip'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_zip TEXT;
  END IF;
END $$;

-- Create index on customer_name for faster searches
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
