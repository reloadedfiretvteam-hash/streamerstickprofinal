/*
  # Update Firestick Product Images
  
  This migration updates Firestick product images to use the new jailbroken Firestick images.
  
  Image Mapping:
  - "FIRE TV STICK ORIGINAL" (Budget-Friendly) → firestick original.jpg (or firestick hd.jpg)
  - "FIRE TV STICK 4K" → firestick 4k.jpg
  - "FIRE TV STICK 4K MAX" → firestick 4k max.jpg
  
  Note: Upload the new images to Supabase Storage bucket 'images' with these exact filenames:
  - firestick original.jpg (for Fire Stick HD/Original)
  - firestick 4k.jpg (for Fire Stick 4K)
  - firestick 4k max.jpg (for Fire Stick 4K Max)
*/

-- Update Fire Stick HD/Original images
-- Handle both "HD" and "Original" product names
UPDATE real_products
SET main_image = 'firestick original.jpg'
WHERE (name ILIKE '%fire stick hd%' 
       OR name ILIKE '%fire stick original%'
       OR slug ILIKE '%fire-stick-hd%'
       OR slug ILIKE '%fire-stick-original%')
  AND name NOT ILIKE '%4k%'
  AND name NOT ILIKE '%max%';

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

-- Also update products_full table if it exists
UPDATE products_full
SET image_url = 'firestick original.jpg'
WHERE (name ILIKE '%fire stick hd%' 
       OR name ILIKE '%fire stick original%'
       OR slug ILIKE '%fire-stick-hd%'
       OR slug ILIKE '%fire-stick-original%')
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

-- Update product_images table if it exists
UPDATE product_images pi
SET image_url = 'firestick original.jpg'
FROM products_full pf
WHERE pi.product_id = pf.id
  AND (pf.name ILIKE '%fire stick hd%' 
       OR pf.name ILIKE '%fire stick original%'
       OR pf.slug ILIKE '%fire-stick-hd%'
       OR pf.slug ILIKE '%fire-stick-original%')
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

