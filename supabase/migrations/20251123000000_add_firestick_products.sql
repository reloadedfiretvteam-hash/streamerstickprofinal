/*
  # Add Fire Stick Products to Database
  
  1. Purpose
    - Ensure Fire Stick HD, 4K, and 4K Max are in the products table
    - Update product data to match current offerings
    - Ensure proper categorization and sorting
  
  2. Products Added
    - Fire Stick HD ($140)
    - Fire Stick 4K ($150)
    - Fire Stick 4K Max ($160)
  
  3. Note
    - Uses UPSERT pattern to update existing products or insert new ones
    - Products table is the primary product catalog for the site
*/

-- Ensure products table exists with required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE TABLE products (
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
    
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view active products"
      ON products FOR SELECT
      USING (is_active = true);
    
    CREATE POLICY "Authenticated users can manage products"
      ON products FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Delete old Fire Stick products to avoid duplicates
DELETE FROM products WHERE name IN ('Fire Stick HD', 'Fire Stick 4K', 'Fire Stick 4K Max');

-- Insert Fire Stick HD
INSERT INTO products (name, price, sale_price, description, short_description, image_url, category, is_active, is_featured, sort_order)
VALUES (
  'Fire Stick HD',
  140.00,
  NULL,
  'Brand New Amazon Fire Stick HD, 18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events, HD Quality, Pre-Configured & Ready to Use, Plug & Play Setup (5 Minutes), 1 Year Premium IPTV Included, Free Shipping, 24/7 Support',
  'HD QUALITY',
  '/OIF.jpg',
  'firestick',
  true,
  false,
  1
);

-- Insert Fire Stick 4K
INSERT INTO products (name, price, sale_price, description, short_description, image_url, category, is_active, is_featured, sort_order)
VALUES (
  'Fire Stick 4K',
  150.00,
  NULL,
  'Brand New Amazon Fire Stick 4K, 18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events, 4K Ultra HD Quality, Pre-Configured & Ready to Use, Plug & Play Setup (5 Minutes), 1 Year Premium IPTV Included, Priority Customer Support, Free Shipping',
  'BEST VALUE',
  'https://images.pexels.com/photos/4178672/pexels-photo-4178672.jpeg?auto=compress&cs=tinysrgb&w=800',
  'firestick',
  true,
  true,
  2
);

-- Insert Fire Stick 4K Max
INSERT INTO products (name, price, sale_price, description, short_description, image_url, category, is_active, is_featured, sort_order)
VALUES (
  'Fire Stick 4K Max',
  160.00,
  NULL,
  'Brand New Amazon Fire Stick 4K Max, 18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events, 4K Ultra HD Quality, Fastest Performance, Pre-Configured & Ready to Use, Plug & Play Setup (5 Minutes), 1 Year Premium IPTV Included, VIP Customer Support, Free Shipping',
  'PREMIUM',
  'https://images.pexels.com/photos/7533347/pexels-photo-7533347.jpeg?auto=compress&cs=tinysrgb&w=800',
  'firestick',
  true,
  false,
  3
);

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);
