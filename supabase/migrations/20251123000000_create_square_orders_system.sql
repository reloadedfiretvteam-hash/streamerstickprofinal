-- Create square_orders table
CREATE TABLE IF NOT EXISTS square_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_token TEXT,
    square_payment_id TEXT,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create square_order_items table
CREATE TABLE IF NOT EXISTS square_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES square_orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_square_orders_order_number ON square_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_square_orders_customer_email ON square_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_square_orders_status ON square_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_square_orders_created_at ON square_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_square_order_items_order_id ON square_order_items(order_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE square_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE square_order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all orders (admin access)
CREATE POLICY "Allow authenticated users to view orders" ON square_orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow service role to insert orders
CREATE POLICY "Allow service role to insert orders" ON square_orders
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Policy: Allow authenticated users to update orders (admin access)
CREATE POLICY "Allow authenticated users to update orders" ON square_orders
    FOR UPDATE
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to view all order items (admin access)
CREATE POLICY "Allow authenticated users to view order items" ON square_order_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow service role to insert order items
CREATE POLICY "Allow service role to insert order items" ON square_order_items
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_square_orders_updated_at BEFORE UPDATE ON square_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE square_orders IS 'Stores all orders processed through Square payment gateway';
COMMENT ON TABLE square_order_items IS 'Stores line items for Square orders';
