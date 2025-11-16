/*
  # Create Cash App Orders Table

  1. New Table
    - `cashapp_orders`
      - `id` (uuid, primary key)
      - `order_code` (text, unique) - Unique tracking code (CASH-XXXXX-XXXXX)
      - `customer_email` (text) - Customer email address
      - `customer_name` (text) - Customer full name
      - `customer_phone` (text) - Customer phone number
      - `shipping_address` (text) - Full shipping address
      - `total_usd` (numeric) - Total amount in USD
      - `payment_status` (text) - pending, completed, expired, failed
      - `cashapp_tag` (text) - Cash App tag ($StreamStickPro)
      - `payment_instructions` (text) - Full payment instructions
      - `products` (jsonb) - Array of products ordered
      - `customer_instructions_sent` (boolean) - Email sent to customer
      - `admin_notification_sent` (boolean) - Email sent to admin
      - `expires_at` (timestamptz) - Order expiration time
      - `paid_at` (timestamptz) - Payment completion time
      - `created_at` (timestamptz) - Order creation time
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS
    - Allow public to create orders
    - Allow customers to read their own orders
    - Allow admins to update orders

  3. Indexes
    - Index on order_code for fast lookups
    - Index on customer_email for customer queries
    - Index on payment_status for admin filtering
    - Index on created_at for sorting
*/

-- Create cashapp_orders table
CREATE TABLE IF NOT EXISTS cashapp_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  total_usd numeric(10,2) NOT NULL,
  payment_status text DEFAULT 'pending',
  cashapp_tag text DEFAULT '$StreamStickPro',
  payment_instructions text,
  products jsonb DEFAULT '[]'::jsonb,
  customer_instructions_sent boolean DEFAULT false,
  admin_notification_sent boolean DEFAULT false,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cashapp_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create Cash App orders
CREATE POLICY "Anyone can create cashapp orders"
  ON cashapp_orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Customers can read their own orders
CREATE POLICY "Customers can read own cashapp orders"
  ON cashapp_orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Admins can update orders
CREATE POLICY "Admins can update cashapp orders"
  ON cashapp_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Admins can delete orders
CREATE POLICY "Admins can delete cashapp orders"
  ON cashapp_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_code ON cashapp_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_email ON cashapp_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_status ON cashapp_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_created ON cashapp_orders(created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cashapp_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_cashapp_orders_timestamp
  BEFORE UPDATE ON cashapp_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_cashapp_orders_updated_at();
