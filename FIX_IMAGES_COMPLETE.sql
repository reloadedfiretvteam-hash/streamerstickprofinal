-- ============================================================
-- COMPLETE IMAGE FIX - Run this AFTER the main setup SQL
-- This fixes images to persist and stay on your website
-- ============================================================

-- 1. Section Images Table (For Hero, Carousel, etc.)
CREATE TABLE IF NOT EXISTS section_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text UNIQUE NOT NULL,
  image_url text NOT NULL,
  image_type text DEFAULT 'background',
  alt_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE section_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read section images" ON section_images;
CREATE POLICY "Public can read section images"
  ON section_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage section images" ON section_images;
CREATE POLICY "Authenticated users can manage section images"
  ON section_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default hero image
INSERT INTO section_images (section_name, image_url, alt_text)
VALUES ('hero', 'hero-firestick-breakout.jpg', 'Hero background - Fire Stick breaking out of jail cell')
ON CONFLICT (section_name) DO NOTHING;

-- Update trigger
DROP TRIGGER IF EXISTS update_section_images_timestamp ON section_images;
CREATE TRIGGER update_section_images_timestamp BEFORE UPDATE ON section_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Ensure product_images table has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='image_url') THEN
    ALTER TABLE product_images ADD COLUMN image_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='alt_text') THEN
    ALTER TABLE product_images ADD COLUMN alt_text text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='is_primary') THEN
    ALTER TABLE product_images ADD COLUMN is_primary boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='sort_order') THEN
    ALTER TABLE product_images ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- 3. Ensure real_products table has main_image column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='real_products' AND column_name='main_image') THEN
    ALTER TABLE real_products ADD COLUMN main_image text;
  END IF;
END $$;

-- ============================================================
-- COMPLETE!
-- ============================================================




