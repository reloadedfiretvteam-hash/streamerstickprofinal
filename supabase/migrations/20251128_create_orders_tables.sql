/*
  # Create Orders and Order Items Tables for E-Commerce

  This migration creates the orders and order_items tables for tracking
  customer purchases and order history.
*/

-- Create orders table if it doesn't exist (may already exist from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'orders') THEN
    CREATE TABLE orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number text UNIQUE NOT NULL,
      purchase_code text,
      customer_name text NOT NULL,
      username text,
      customer_email text NOT NULL,
      customer_phone text,
      shipping_address text,
      billing_address text,
      payment_method text NOT NULL DEFAULT 'stripe',
      payment_status text NOT NULL DEFAULT 'pending',
      order_status text NOT NULL DEFAULT 'pending',
      subtotal numeric(10,2) NOT NULL DEFAULT 0,
      tax numeric(10,2) DEFAULT 0,
      shipping numeric(10,2) DEFAULT 0,
      discount numeric(10,2) DEFAULT 0,
      total numeric(10,2) NOT NULL DEFAULT 0,
      items jsonb DEFAULT '[]'::jsonb,
      notes text,
      tracking_number text,
      shipped_at timestamptz,
      delivered_at timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create order_items table for detailed line items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id text,
  product_name text NOT NULL,
  product_type text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
DO $$
BEGIN
  -- Public can insert orders (checkout)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Anyone can create orders'
  ) THEN
    CREATE POLICY "Anyone can create orders"
      ON orders FOR INSERT
      WITH CHECK (true);
  END IF;

  -- Users can view their own orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can view own orders'
  ) THEN
    CREATE POLICY "Users can view own orders"
      ON orders FOR SELECT
      USING (
        customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR auth.role() = 'service_role'
      );
  END IF;

  -- Authenticated users can manage orders (admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Authenticated users can manage orders'
  ) THEN
    CREATE POLICY "Authenticated users can manage orders"
      ON orders FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Anyone can create order items'
  ) THEN
    CREATE POLICY "Anyone can create order items"
      ON order_items FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Users can view own order items'
  ) THEN
    CREATE POLICY "Users can view own order items"
      ON order_items FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_items.order_id 
          AND orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR auth.role() = 'service_role'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Authenticated users can manage order items'
  ) THEN
    CREATE POLICY "Authenticated users can manage order items"
      ON order_items FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Add user_id column if it doesn't exist (for linking to auth.users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id);
    CREATE INDEX idx_orders_user_id ON orders(user_id);
  END IF;
END $$;
