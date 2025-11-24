/*
  # Fix Blog Post Image URLs
  
  Update all blog post featured_image fields to use relative paths
  instead of hardcoded Supabase project URLs. This allows the
  application's getStorageUrl() helper to construct proper URLs
  dynamically based on environment configuration.
  
  This migration fixes the blog posts created by the SEO migration
  20250115_seo_blog_posts_all_niches.sql which used hardcoded URLs.
*/

-- Update all blog posts with hardcoded Fire Stick HD images
UPDATE real_blog_posts
SET featured_image = 'firestick hd.jpg'
WHERE featured_image LIKE '%emlqlmfzqsnqokrqvmcm%firestick%hd%'
   OR featured_image LIKE '%emlqlmfzqsnqokrqvmcm%firestick%20hd%';

-- Update all blog posts with hardcoded Fire Stick 4K images (not Max)
UPDATE real_blog_posts
SET featured_image = 'firestick 4k.jpg'
WHERE (featured_image LIKE '%emlqlmfzqsnqokrqvmcm%firestick%4k%'
      OR featured_image LIKE '%emlqlmfzqsnqokrqvmcm%firestick%204k%')
  AND featured_image NOT LIKE '%max%'
  AND featured_image NOT LIKE '%Max%';

-- Update all blog posts with hardcoded Fire Stick 4K Max images
UPDATE real_blog_posts
SET featured_image = 'firestick 4k max.jpg'
WHERE featured_image LIKE '%emlqlmfzqsnqokrqvmcm%firestick%4k%max%'
   OR featured_image LIKE '%emlqlmfzqsnqokrqvmcm%firestick%204k%20max%';

-- Update all blog posts with hardcoded IPTV subscription images
UPDATE real_blog_posts
SET featured_image = 'iptv-subscription.jpg'
WHERE featured_image LIKE '%emlqlmfzqsnqokrqvmcm%iptv%'
   OR featured_image LIKE '%emlqlmfzqsnqokrqvmcm%subscription%';

-- Also update any other blog posts using the old hardcoded base URL
-- This catches any remaining posts that might have different filenames
UPDATE real_blog_posts
SET featured_image = REGEXP_REPLACE(
  featured_image,
  'https://[^/]+\.supabase\.co/storage/v1/object/public/imiges/',
  '',
  'g'
)
WHERE featured_image LIKE 'https://%supabase.co/storage/v1/object/public/imiges/%';

-- Final cleanup: URL decode any remaining encoded characters (e.g., %20 to space)
UPDATE real_blog_posts
SET featured_image = REPLACE(featured_image, '%20', ' ')
WHERE featured_image LIKE '%20%';
