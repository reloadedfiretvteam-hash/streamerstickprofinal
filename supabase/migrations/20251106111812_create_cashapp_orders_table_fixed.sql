/*
  # Create Cash App Orders Table
  
  1. New Table
    - cashapp_orders: Store Cash App payment orders
    
  2. Columns
    - id (uuid, primary key)
    - order_code (text, unique) - Unique order tracking code
    - customer_email (text) - Customer email
    - customer_name (text) - Customer name
    - customer_phone (text) - Customer phone
    - shipping_address (text) - Full shipping address
    - total_usd (numeric) - Order total in USD
    - cashapp_tag (text) - Cash App tag used ($starstreem1)
    - payment_status (text) - pending, completed, expired, cancelled
    - products (jsonb) - Products in order
    - payment_instructions (text) - Instructions sent to customer
    - customer_instructions_sent (boolean) - Email sent flag
    - admin_notification_sent (boolean) - Admin notified flag
    - expires_at (timestamptz) - Order expiration
    - paid_at (timestamptz) - When payment received
    - created_at (timestamptz) - Order creation time
    - updated_at (timestamptz) - Last update time
    
  3. Security
    - Enable RLS
    - Customers can view their own orders by email
    - Authenticated users (admin) can view all
*/

CREATE TABLE IF NOT EXISTS cashapp_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address text,
  total_usd numeric(10,2) NOT NULL,
  cashapp_tag text DEFAULT '$starstreem1',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'expired', 'cancelled')),
  products jsonb DEFAULT '[]'::jsonb,
  payment_instructions text,
  customer_instructions_sent boolean DEFAULT false,
  admin_notification_sent boolean DEFAULT false,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cashapp_orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders by email"
  ON cashapp_orders
  FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Admin can view all orders
CREATE POLICY "Authenticated users can view all orders"
  ON cashapp_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Anyone can insert new orders (for checkout)
CREATE POLICY "Anyone can create orders"
  ON cashapp_orders
  FOR INSERT
  WITH CHECK (true);

-- Admin can update orders
CREATE POLICY "Authenticated users can update orders"
  ON cashapp_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index on order_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_order_code ON cashapp_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_customer_email ON cashapp_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_payment_status ON cashapp_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_created_at ON cashapp_orders(created_at DESC);
