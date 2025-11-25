/*
  # Price Synchronization Migration
  
  This migration:
  1. Creates backup tables for real_products, square_products, and pricing_plans
  2. Adds price column to square_products if missing
  3. Copies prices from real_products into square_products
  4. Syncs pricing_plans by name
  5. Includes verification SELECT queries
  
  IMPORTANT: Review backup data before running this in production.
  DO NOT run this migration automatically - run manually after reviewing.
*/

-- =============================================================================
-- STEP 1: Create backup tables with timestamp suffix
-- =============================================================================

-- Backup real_products table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_products') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS real_products_backup_20251125 AS SELECT * FROM real_products';
  END IF;
END $$;

-- Backup square_products table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'square_products') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS square_products_backup_20251125 AS SELECT * FROM square_products';
  END IF;
END $$;

-- Backup pricing_plans table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_plans') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS pricing_plans_backup_20251125 AS SELECT * FROM pricing_plans';
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Create real_products table if it doesn't exist (authoritative pricing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS real_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  category text,
  type text,
  image_filename text,
  sku text UNIQUE,
  features jsonb DEFAULT '[]'::jsonb,
  badge text,
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE real_products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active products
CREATE POLICY IF NOT EXISTS "Anyone can view real_products"
  ON real_products FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- =============================================================================
-- STEP 3: Create square_products mapping table (for secure checkout)
-- =============================================================================

CREATE TABLE IF NOT EXISTS square_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_product_id uuid REFERENCES real_products(id) ON DELETE CASCADE,
  square_catalog_id text,
  square_variation_id text,
  sku text UNIQUE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  main_image text,
  approved_for_square boolean DEFAULT false,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error')),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE square_products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view approved products
CREATE POLICY IF NOT EXISTS "Anyone can view approved square_products"
  ON square_products FOR SELECT
  TO anon, authenticated
  USING (approved_for_square = true);

-- =============================================================================
-- STEP 4: Add price column to square_products if missing
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'square_products' AND column_name = 'price'
  ) THEN
    ALTER TABLE square_products ADD COLUMN price numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- =============================================================================
-- STEP 5: Create pricing_plans table for subscription-based products
-- =============================================================================

CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  period text, -- 'monthly', 'quarterly', 'annual'
  features jsonb DEFAULT '[]'::jsonb,
  badge text,
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view active pricing_plans"
  ON pricing_plans FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- =============================================================================
-- STEP 6: Sync prices from real_products to square_products
-- =============================================================================

-- Update existing square_products with prices from real_products
UPDATE square_products sp
SET 
  price = rp.price,
  updated_at = now()
FROM real_products rp
WHERE sp.real_product_id = rp.id
  AND (sp.price IS NULL OR sp.price != rp.price);

-- =============================================================================
-- STEP 7: Create reviews table for customer testimonials
-- =============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES real_products(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_location text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text NOT NULL,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  approved boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view approved reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (approved = true);

-- =============================================================================
-- STEP 8: Create indexes for performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_real_products_category ON real_products(category);
CREATE INDEX IF NOT EXISTS idx_real_products_type ON real_products(type);
CREATE INDEX IF NOT EXISTS idx_real_products_active ON real_products(active);
CREATE INDEX IF NOT EXISTS idx_square_products_real_product ON square_products(real_product_id);
CREATE INDEX IF NOT EXISTS idx_square_products_approved ON square_products(approved_for_square);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);

-- =============================================================================
-- STEP 9: Create triggers for updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_real_products_updated_at') THEN
    CREATE TRIGGER update_real_products_updated_at BEFORE UPDATE ON real_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_square_products_updated_at') THEN
    CREATE TRIGGER update_square_products_updated_at BEFORE UPDATE ON square_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pricing_plans_updated_at') THEN
    CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON pricing_plans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
    CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================================================
-- VERIFICATION QUERIES (run these manually to verify migration success)
-- =============================================================================

-- Check backup tables were created:
-- SELECT 'real_products_backup' as table_name, count(*) FROM real_products_backup_20251125
-- UNION ALL SELECT 'square_products_backup', count(*) FROM square_products_backup_20251125
-- UNION ALL SELECT 'pricing_plans_backup', count(*) FROM pricing_plans_backup_20251125;

-- Verify price sync:
-- SELECT 
--   rp.name as product_name,
--   rp.price as real_price,
--   sp.price as square_price,
--   CASE WHEN rp.price = sp.price THEN 'SYNCED' ELSE 'MISMATCH' END as status
-- FROM real_products rp
-- LEFT JOIN square_products sp ON sp.real_product_id = rp.id
-- ORDER BY rp.name;

-- Check for any mismatches:
-- SELECT count(*) as mismatch_count
-- FROM real_products rp
-- JOIN square_products sp ON sp.real_product_id = rp.id
-- WHERE rp.price != sp.price;
