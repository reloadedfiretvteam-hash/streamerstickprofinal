/*
  # Restore Products Table and Real Data
  
  ## Purpose
  Create the products table that the website expects and populate it with real Inferno TV products.
  
  ## Tables Created
  1. `products` - Main products table for Fire Sticks and IPTV subscriptions
    - id (uuid)
    - name (text)
    - price (numeric)
    - sale_price (numeric, nullable)
    - description (text)
    - short_description (text)
    - image_url (text)
    - category (text)
    - is_active (boolean)
    - is_featured (boolean)
    - sort_order (integer)
    - created_at (timestamptz)
    - updated_at (timestamptz)
  
  ## Real Products
  - Fire Stick 4K Pre-configured devices
  - IPTV Subscription plans (1, 3, 6, 12 months)
  - Combo packages
  
  ## Security
  - RLS enabled
  - Public can read active products
  - Authenticated admins can manage all
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  description text,
  short_description text,
  image_url text,
  category text DEFAULT 'iptv',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert real Inferno TV products
INSERT INTO products (name, price, sale_price, description, short_description, image_url, category, is_featured, sort_order) VALUES
('Fire Stick 4K - Pre-Configured (Lifetime IPTV)', 199.99, NULL, 
 'Pre-configured Amazon Fire Stick 4K with lifetime IPTV access. 18,000+ live channels. 60,000+ movies & TV series. All sports, PPV events, premium channels included. Plug and play ready.', 
 'Pre-configured Fire Stick 4K with lifetime IPTV access',
 '/71E1te69hZL._AC_SL1500_.jpg', 
 'firestick', true, 1),

('IPTV Subscription - 1 Month', 14.99, NULL,
 '1 Month IPTV subscription with 18,000+ live channels, 60,000+ movies & series. All sports channels, PPV events, premium content. Works on any device. 99.9% uptime guarantee.',
 '1 Month unlimited IPTV access',
 '/9-1.webp',
 'iptv', true, 2),

('IPTV Subscription - 3 Months', 39.99, NULL,
 '3 Months IPTV subscription - Save $5! 18,000+ live channels, 60,000+ movies & series. All sports, PPV, premium content. Multi-device support. 24/7 customer support.',
 '3 Months unlimited IPTV - Best Value',
 '/5-1.webp',
 'iptv', true, 3),

('IPTV Subscription - 6 Months', 74.99, NULL,
 '6 Months IPTV subscription - Save $15! 18,000+ live channels, 60,000+ movies & series. All sports, UFC, boxing PPV events. Premium channels, on-demand content. Priority support.',
 '6 Months unlimited IPTV - Most Popular',
 '/OIF.jpg',
 'iptv', false, 4),

('IPTV Subscription - 12 Months', 129.99, NULL,
 '12 Months IPTV subscription - Save $50! Full year of unlimited streaming. 18,000+ channels, 60,000+ movies & series. All sports packages, PPV events. Premium support, free updates.',
 '12 Months unlimited IPTV - Best Deal',
 '/OIP (11)99.jpg',
 'iptv', false, 5),

('Fire Stick 4K + 1 Month IPTV Bundle', 209.99, 199.99,
 'Complete streaming solution! Pre-configured Fire Stick 4K plus 1 month IPTV subscription. Ready to use out of the box. 18,000+ channels, 60,000+ movies. Save when you bundle!',
 'Fire Stick 4K + 1 Month IPTV Bundle',
 '/71+Pvh7WB6L._AC_SL1500_.jpg',
 'bundle', true, 6)

ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_timestamp ON products;
CREATE TRIGGER update_products_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_timestamp();
