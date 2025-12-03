/*
  # Add Missing Columns to real_products Table
  
  Adds the cloaked_name, service_url, and setup_video_url columns
  that are required for the Stripe cloaking system and IPTV service delivery.
  
  - cloaked_name: The Stripe-compliant product name (e.g., "Digital Entertainment Service")
  - service_url: The IPTV service URL for customer login (e.g., "http://ky-tv.cc")
  - setup_video_url: YouTube tutorial URL for product setup
*/

-- Add cloaked_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'cloaked_name'
  ) THEN
    ALTER TABLE real_products 
    ADD COLUMN cloaked_name text;
    
    -- Set default cloaked names based on category
    UPDATE real_products 
    SET cloaked_name = 'Digital Entertainment Service - Hardware Bundle'
    WHERE (category LIKE '%fire%' OR category LIKE '%stick%' OR name LIKE '%Fire Stick%')
    AND cloaked_name IS NULL;
    
    UPDATE real_products 
    SET cloaked_name = 'Digital Entertainment Service - Subscription'
    WHERE (category LIKE '%iptv%' OR category LIKE '%subscription%' OR name LIKE '%IPTV%' OR name LIKE '%Month%')
    AND cloaked_name IS NULL;
    
    UPDATE real_products 
    SET cloaked_name = 'Digital Entertainment Service'
    WHERE cloaked_name IS NULL;
  END IF;
END $$;

-- Add service_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'service_url'
  ) THEN
    ALTER TABLE real_products 
    ADD COLUMN service_url text DEFAULT 'http://ky-tv.cc';
    
    -- Set default service URL for all products
    UPDATE real_products 
    SET service_url = 'http://ky-tv.cc'
    WHERE service_url IS NULL;
  END IF;
END $$;

-- Add setup_video_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'real_products' AND column_name = 'setup_video_url'
  ) THEN
    ALTER TABLE real_products 
    ADD COLUMN setup_video_url text;
    
    -- Set default setup video URL (can be customized per product later)
    UPDATE real_products 
    SET setup_video_url = 'https://www.youtube.com/watch?v=YOUR_SETUP_VIDEO_ID'
    WHERE setup_video_url IS NULL;
  END IF;
END $$;

-- Create index for cloaked_name lookups
CREATE INDEX IF NOT EXISTS idx_real_products_cloaked_name ON real_products(cloaked_name);

-- Comment
COMMENT ON COLUMN real_products.cloaked_name IS 'Stripe-compliant product name shown to Stripe (e.g., "Digital Entertainment Service")';
COMMENT ON COLUMN real_products.service_url IS 'IPTV service URL for customer login (default: http://ky-tv.cc)';
COMMENT ON COLUMN real_products.setup_video_url IS 'YouTube tutorial URL for product setup instructions';


