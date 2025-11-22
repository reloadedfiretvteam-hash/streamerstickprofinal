/*
  # Add Sort Order Column and Fix Product Order/Images

  1. Changes
    - Add sort_order column to real_products table
    - Update Fire Stick product images - HD uses /OIF.jpg
    - Update IPTV subscription images to match Fire Stick HD box image
    - Fix product sort order:
      * Fire Stick HD ($140) - sort order 1
      * Fire Stick 4K ($150) - sort order 2
      * Fire Stick 4K Max ($160) - sort order 3
      * IPTV 1 Month - sort order 4
      * IPTV 3 Months - sort order 5
      * IPTV 6 Months - sort order 6
      * IPTV 12 Months - sort order 7
*/

-- Add sort_order column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'real_products' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE real_products ADD COLUMN sort_order INTEGER DEFAULT 999;
  END IF;
END $$;

-- Update Fire Stick HD image and sort order
UPDATE real_products
SET 
  main_image = '/OIF.jpg',
  sort_order = 1
WHERE name ILIKE '%fire stick hd%' OR (price = 140 AND name ILIKE '%fire stick%');

-- Update Fire Stick 4K sort order
UPDATE real_products
SET sort_order = 2
WHERE (name ILIKE '%fire stick 4k%' AND NOT name ILIKE '%max%') OR (price = 150 AND name ILIKE '%fire stick%' AND NOT name ILIKE '%max%');

-- Update Fire Stick 4K Max sort order
UPDATE real_products
SET sort_order = 3
WHERE name ILIKE '%fire stick 4k max%' OR name ILIKE '%fire stick max%' OR (price = 160 AND name ILIKE '%fire stick%');

-- Update all IPTV subscription images to match Fire Stick HD box
UPDATE real_products
SET main_image = '/OIF.jpg'
WHERE (name ILIKE '%iptv%' OR name ILIKE '%subscription%' OR name ILIKE '%month%')
  AND name NOT ILIKE '%fire stick%';

-- Update IPTV 1 Month sort order
UPDATE real_products
SET sort_order = 4
WHERE (name ILIKE '%1 month%' OR name ILIKE '%one month%') 
  AND (name ILIKE '%iptv%' OR name ILIKE '%subscription%');

-- Update IPTV 3 Months sort order  
UPDATE real_products
SET sort_order = 5
WHERE (name ILIKE '%3 month%' OR name ILIKE '%three month%')
  AND (name ILIKE '%iptv%' OR name ILIKE '%subscription%');

-- Update IPTV 6 Months sort order
UPDATE real_products
SET sort_order = 6
WHERE (name ILIKE '%6 month%' OR name ILIKE '%six month%')
  AND (name ILIKE '%iptv%' OR name ILIKE '%subscription%');

-- Update IPTV 12 Months / 1 Year sort order
UPDATE real_products
SET sort_order = 7
WHERE ((name ILIKE '%12 month%' OR name ILIKE '%1 year%' OR name ILIKE '%one year%' OR name ILIKE '%yearly%')
  AND (name ILIKE '%iptv%' OR name ILIKE '%subscription%'));
