/*
  # Create Inferno TV Complete Schema

  1. New Tables
    - `visitors` - Track website visitors
      - `id` (uuid, primary key)
      - `session_id` (text)
      - `page_url` (text)
      - `referrer` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz)
    
    - `email_captures` - Store captured emails
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `source` (text) - where email was captured
      - `created_at` (timestamptz)
    
    - `orders` - Store customer orders
      - `id` (uuid, primary key)
      - `user_email` (text)
      - `product_id` (text)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
    
    - `products` - Store product information
      - `id` (uuid, primary key)
      - `product_id` (text, unique)
      - `name` (text)
      - `price` (numeric)
      - `type` (text)
      - `description` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public and admin access
*/

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  page_url text,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visitors"
  ON visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all visitors"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (true);

-- Email captures table
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert email captures"
  ON email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all email captures"
  ON email_captures
  FOR SELECT
  TO authenticated
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  product_id text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text UNIQUE NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default products
INSERT INTO products (product_id, name, price, type, description) VALUES
  ('firestick-hd', 'Fire Stick HD', 140.00, 'firestick', 'HD quality with 1 year IPTV subscription included'),
  ('firestick-4k', 'Fire Stick 4K', 150.00, 'firestick', '4K Ultra HD with 1 year IPTV subscription included'),
  ('firestick-4k-max', 'Fire Stick 4K Max', 160.00, 'firestick', '4K Max fastest performance with 1 year IPTV subscription included'),
  ('iptv-1month', '1 Month IPTV Subscription', 15.00, 'iptv', 'Monthly IPTV subscription'),
  ('iptv-3months', '3 Month IPTV Subscription', 30.00, 'iptv', '3 month IPTV subscription'),
  ('iptv-6months', '6 Month IPTV Subscription', 50.00, 'iptv', '6 month IPTV subscription'),
  ('iptv-12months', '1 Year IPTV Subscription', 75.00, 'iptv', 'Annual IPTV subscription')
ON CONFLICT (product_id) DO NOTHING;
