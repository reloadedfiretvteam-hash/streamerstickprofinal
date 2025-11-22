/*
  # Prevent External Image URLs - Image Consistency Protection

  1. Changes
    - Add constraint to products table preventing external image URLs
    - Add constraint to blog_posts table preventing external image URLs
    - Create monitoring function to detect placeholder images
    - Create index for faster image validation queries

  2. Purpose
    - Prevent Pexels/Unsplash placeholder images in production
    - Ensure all images are local (/path/to/image.jpg)
    - Enable automated detection of invalid image URLs
    - Protect against future image consistency issues

  3. Security
    - No data modification, only validation rules
    - Existing data grandfathered in (NOT VALID constraint)
    - Can be validated gradually without blocking operations
*/

-- Add constraint to products table (NOT VALID allows existing data)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_product_local_images'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT check_product_local_images
    CHECK (
      image_url LIKE '/%'
      AND image_url NOT LIKE '%pexels%'
      AND image_url NOT LIKE '%unsplash%'
      AND image_url NOT LIKE 'http://%'
      AND image_url NOT LIKE 'https://%'
    ) NOT VALID;
  END IF;
END $$;

-- Add constraint to blog_posts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_blog_local_images'
  ) THEN
    ALTER TABLE blog_posts
    ADD CONSTRAINT check_blog_local_images
    CHECK (
      featured_image LIKE '/%'
      AND featured_image NOT LIKE '%pexels%'
      AND featured_image NOT LIKE '%unsplash%'
      AND featured_image NOT LIKE 'http://%'
      AND featured_image NOT LIKE 'https://%'
    ) NOT VALID;
  END IF;
END $$;

-- Create monitoring function to detect external/placeholder images
CREATE OR REPLACE FUNCTION check_external_images()
RETURNS TABLE(
  source text,
  item_name text,
  invalid_url text,
  issue text
) AS $$
BEGIN
  -- Check products
  RETURN QUERY
  SELECT 
    'products'::text as source,
    name as item_name,
    image_url as invalid_url,
    CASE
      WHEN image_url LIKE '%pexels%' THEN 'Pexels placeholder'
      WHEN image_url LIKE '%unsplash%' THEN 'Unsplash placeholder'
      WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 'External URL'
      ELSE 'Invalid format'
    END as issue
  FROM products
  WHERE image_url NOT LIKE '/%'
     OR image_url LIKE '%pexels%'
     OR image_url LIKE '%unsplash%'
     OR image_url LIKE 'http://%'
     OR image_url LIKE 'https://%';

  -- Check blog posts
  RETURN QUERY
  SELECT 
    'blog_posts'::text as source,
    title as item_name,
    featured_image as invalid_url,
    CASE
      WHEN featured_image LIKE '%pexels%' THEN 'Pexels placeholder'
      WHEN featured_image LIKE '%unsplash%' THEN 'Unsplash placeholder'
      WHEN featured_image LIKE 'http://%' OR featured_image LIKE 'https://%' THEN 'External URL'
      ELSE 'Invalid format'
    END as issue
  FROM blog_posts
  WHERE featured_image NOT LIKE '/%'
     OR featured_image LIKE '%pexels%'
     OR featured_image LIKE '%unsplash%'
     OR featured_image LIKE 'http://%'
     OR featured_image LIKE 'https://%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_external_images() TO authenticated;
GRANT EXECUTE ON FUNCTION check_external_images() TO anon;

-- Create index for faster image validation
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured_image ON blog_posts(featured_image);

-- Validate that all current data passes the constraints
DO $$
DECLARE
  issue_count integer;
BEGIN
  SELECT COUNT(*) INTO issue_count FROM check_external_images();
  
  IF issue_count > 0 THEN
    RAISE NOTICE 'Found % images that need attention. Run: SELECT * FROM check_external_images();', issue_count;
  ELSE
    RAISE NOTICE '✅ All images are local and valid!';
  END IF;
END $$;