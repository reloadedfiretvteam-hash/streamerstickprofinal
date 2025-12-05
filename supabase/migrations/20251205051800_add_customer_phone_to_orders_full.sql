/*
  # Add customer_phone column to orders_full table
  
  This migration adds an optional customer_phone column to the orders_full table
  to capture customer phone numbers during checkout. The field is nullable to make
  it optional for customers.
  
  Changes:
  - Add customer_phone column (VARCHAR/TEXT, nullable)
  - Create index for performance on phone lookups
  - Recreate orders view to include new column
*/

-- Add customer_phone column to orders_full table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE orders_full ADD COLUMN customer_phone text;
    
    -- Add comment for documentation
    COMMENT ON COLUMN orders_full.customer_phone IS 'Optional customer phone number for order communication';
  END IF;
END $$;

-- Create index for performance (if it doesn't already exist)
CREATE INDEX IF NOT EXISTS idx_orders_full_customer_phone ON orders_full(customer_phone);

-- Recreate the orders view to include the new column
DROP VIEW IF EXISTS orders;
CREATE VIEW orders AS SELECT * FROM orders_full;

-- Verify the column was added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders_full' AND column_name = 'customer_phone'
  ) THEN
    RAISE EXCEPTION 'Failed to add customer_phone column to orders_full table';
  END IF;
END $$;
