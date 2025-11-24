/*
  # Fix Product Image URLs to Use Supabase Storage

  1. Changes
    - Update all product images to use relative paths that will work with getStorageUrl()
    - Remove hardcoded Supabase project URLs
    - Set proper image paths for Fire Stick products
    - Set proper image paths for IPTV subscriptions

  2. Notes
    - Images should be uploaded to the 'images' bucket in Supabase Storage
    - The application code will construct full URLs using getStorageUrl()
    - Fallback images are handled by the frontend code
*/

-- Update Fire Stick HD images
UPDATE real_products
SET main_image = 'firestick hd.jpg'
WHERE (name ILIKE '%fire stick hd%' OR slug ILIKE '%fire-stick-hd%')
  AND name NOT ILIKE '%4k%';

-- Update Fire Stick 4K images (not Max)
UPDATE real_products
SET main_image = 'firestick 4k.jpg'
WHERE (name ILIKE '%fire stick 4k%' OR slug ILIKE '%fire-stick-4k%')
  AND NOT (name ILIKE '%max%' OR slug ILIKE '%max%');

-- Update Fire Stick 4K Max images
UPDATE real_products
SET main_image = 'firestick 4k max.jpg'
WHERE name ILIKE '%fire stick 4k max%' 
   OR name ILIKE '%fire stick max%' 
   OR slug ILIKE '%fire-stick-4k-max%'
   OR slug ILIKE '%fire-stick-max%';

-- Update IPTV subscription images
UPDATE real_products
SET main_image = 'iptv-subscription.jpg'
WHERE (name ILIKE '%iptv%' OR name ILIKE '%subscription%' OR slug ILIKE '%iptv%')
  AND name NOT ILIKE '%fire stick%';

-- Also update products_full table if it has different data
UPDATE products_full
SET image_url = 'firestick hd.jpg'
WHERE (name ILIKE '%fire stick hd%' OR slug ILIKE '%fire-stick-hd%')
  AND name NOT ILIKE '%4k%'
  AND image_url IS NOT NULL;

UPDATE products_full
SET image_url = 'firestick 4k.jpg'
WHERE (name ILIKE '%fire stick 4k%' OR slug ILIKE '%fire-stick-4k%')
  AND NOT (name ILIKE '%max%' OR slug ILIKE '%max%')
  AND image_url IS NOT NULL;

UPDATE products_full
SET image_url = 'firestick 4k max.jpg'
WHERE (name ILIKE '%fire stick 4k max%' 
      OR name ILIKE '%fire stick max%' 
      OR slug ILIKE '%fire-stick-4k-max%'
      OR slug ILIKE '%fire-stick-max%')
  AND image_url IS NOT NULL;

UPDATE products_full
SET image_url = 'iptv-subscription.jpg'
WHERE (name ILIKE '%iptv%' OR name ILIKE '%subscription%' OR slug ILIKE '%iptv%')
  AND name NOT ILIKE '%fire stick%'
  AND image_url IS NOT NULL;

-- Update product_images table if it exists
UPDATE product_images pi
SET image_url = 'firestick hd.jpg'
FROM products_full pf
WHERE pi.product_id = pf.id
  AND (pf.name ILIKE '%fire stick hd%' OR pf.slug ILIKE '%fire-stick-hd%')
  AND pf.name NOT ILIKE '%4k%'
  AND pi.is_primary = true;

UPDATE product_images pi
SET image_url = 'firestick 4k.jpg'
FROM products_full pf
WHERE pi.product_id = pf.id
  AND (pf.name ILIKE '%fire stick 4k%' OR pf.slug ILIKE '%fire-stick-4k%')
  AND NOT (pf.name ILIKE '%max%' OR pf.slug ILIKE '%max%')
  AND pi.is_primary = true;

UPDATE product_images pi
SET image_url = 'firestick 4k max.jpg'
FROM products_full pf
WHERE pi.product_id = pf.id
  AND (pf.name ILIKE '%fire stick 4k max%' 
       OR pf.name ILIKE '%fire stick max%' 
       OR pf.slug ILIKE '%fire-stick-4k-max%'
       OR pf.slug ILIKE '%fire-stick-max%')
  AND pi.is_primary = true;

UPDATE product_images pi
SET image_url = 'iptv-subscription.jpg'
FROM products_full pf
WHERE pi.product_id = pf.id
  AND (pf.name ILIKE '%iptv%' OR pf.name ILIKE '%subscription%' OR pf.slug ILIKE '%iptv%')
  AND pf.name NOT ILIKE '%fire stick%'
  AND pi.is_primary = true;
