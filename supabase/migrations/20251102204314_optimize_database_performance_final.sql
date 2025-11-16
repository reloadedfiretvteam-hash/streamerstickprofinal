/*
  # Database Performance Optimization - Final

  1. Performance Indexes
    - Orders optimization
    - Products optimization  
    - Email systems
    - Promotions
    
  2. Query Functions
    - Recent orders
    - Order search
    - Stats view
*/

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_purchase_code ON orders(purchase_code) WHERE purchase_code IS NOT NULL;

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products_full(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products_full(featured);

-- Email captures indexes
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_created_at ON email_captures(created_at DESC);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Promotions indexes
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);

-- Purchase codes indexes
CREATE INDEX IF NOT EXISTS idx_purchase_codes_order_id ON purchase_codes(order_id);

-- Dashboard stats view
CREATE OR REPLACE VIEW order_stats_summary AS
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COALESCE(SUM(total), 0) as total_revenue,
  COALESCE(AVG(total), 0) as avg_order_value,
  COUNT(DISTINCT customer_email) as unique_customers
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Recent orders function
CREATE OR REPLACE FUNCTION get_recent_orders(limit_count int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  order_number text,
  customer_name text,
  customer_email text,
  total numeric,
  status text,
  purchase_code text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, order_number, customer_name, customer_email,
    total, status, purchase_code, created_at
  FROM orders
  ORDER BY created_at DESC
  LIMIT limit_count;
$$;

-- Search function
CREATE OR REPLACE FUNCTION search_orders(search_term text)
RETURNS TABLE (
  id uuid,
  order_number text,
  customer_name text,
  customer_email text,
  purchase_code text,
  total numeric,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, order_number, customer_name, customer_email,
    purchase_code, total, status, created_at
  FROM orders
  WHERE 
    order_number ILIKE '%' || search_term || '%'
    OR customer_email ILIKE '%' || search_term || '%'
    OR customer_name ILIKE '%' || search_term || '%'
    OR (purchase_code IS NOT NULL AND purchase_code ILIKE '%' || search_term || '%')
  ORDER BY created_at DESC
  LIMIT 50;
$$;

-- Analyze tables
ANALYZE orders;
ANALYZE products_full;
ANALYZE email_captures;
ANALYZE promotions;
ANALYZE purchase_codes;
