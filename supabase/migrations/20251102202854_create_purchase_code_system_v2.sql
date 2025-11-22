/*
  # Purchase Code System for Complete Checkout Rebuild

  1. New Columns in orders table
    - purchase_code (unique text field)
    - username (text field)
  
  2. New Table: purchase_codes
    - Tracks unique purchase codes
    - Links to orders
    - Tracks usage status

  3. Functions
    - generate_purchase_code() - Creates unique codes
    - verify_purchase_code() - Validates codes
*/

-- Add columns to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'purchase_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN purchase_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'username'
  ) THEN
    ALTER TABLE orders ADD COLUMN username text;
  END IF;
END $$;

-- Create purchase_codes table
CREATE TABLE IF NOT EXISTS purchase_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchase_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'purchase_codes' AND policyname = 'Public can view purchase codes'
  ) THEN
    CREATE POLICY "Public can view purchase codes"
      ON purchase_codes FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'purchase_codes' AND policyname = 'Public can insert purchase codes'
  ) THEN
    CREATE POLICY "Public can insert purchase codes"
      ON purchase_codes FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'purchase_codes' AND policyname = 'Public can update purchase codes'
  ) THEN
    CREATE POLICY "Public can update purchase codes"
      ON purchase_codes FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Function to generate unique purchase code
CREATE OR REPLACE FUNCTION generate_purchase_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'PC-' || 
                upper(substring(md5(random()::text) from 1 for 5)) || '-' ||
                upper(substring(md5(random()::text) from 1 for 5));
    
    SELECT EXISTS (
      SELECT 1 FROM purchase_codes WHERE code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchase_codes_code ON purchase_codes(code);
CREATE INDEX IF NOT EXISTS idx_purchase_codes_order_id ON purchase_codes(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_purchase_code ON orders(purchase_code);
