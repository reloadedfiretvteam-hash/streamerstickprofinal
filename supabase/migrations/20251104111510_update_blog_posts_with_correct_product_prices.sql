/*
  # Update Blog Posts with Correct Product Prices
  
  Updates all blog post content to reflect the correct product lineup:
  - Fire Stick 4K: $69.99
  - Fire Stick 4K Max: $89.99
  - Fire Stick 4K Max Pro: $109.99
  - 1 Month IPTV: $15
  - 3 Month IPTV: $25
  - 6 Month IPTV: $40
  - 1 Year IPTV: $70
*/

-- Update blog posts with incorrect Fire Stick pricing
UPDATE real_blog_posts
SET content = REPLACE(content, '$79.99', '$69.99')
WHERE slug IN ('fire-stick-4k-preloaded-iptv-guide', 'fire-stick-iptv-setup-guide-5-minutes', 'what-is-jailbroken-fire-stick-2025')
  AND content LIKE '%Fire Stick 4K%$79.99%';

UPDATE real_blog_posts
SET content = REPLACE(content, 'Fire Stick 4K with IPTV Pre-loaded - $79.99', 'Fire Stick 4K - $69.99')
WHERE content LIKE '%Fire Stick 4K with IPTV Pre-loaded%';

-- Update IPTV subscription pricing in blog posts
UPDATE real_blog_posts
SET content = REPLACE(REPLACE(REPLACE(REPLACE(
  content,
  '3 Month Plan - $24.99', '3 Month IPTV - $25'),
  '6 Month Plan - $44.99', '6 Month IPTV - $40'),
  '12 Month Plan - $79.99', '1 Year IPTV - $70'),
  'only $6.67/month', 'only $5.83/month')
WHERE slug = 'ultimate-guide-iptv-subscriptions-2025';

-- Update specific product references
UPDATE real_blog_posts
SET 
  title = REPLACE(title, 'Pre-Loaded IPTV', ''),
  meta_title = REPLACE(meta_title, 'Pre-Loaded', ''),
  content = REPLACE(REPLACE(
    content,
    'with pre-loaded IPTV for $79.99', 'for $69.99'),
    'Includes 1 year premium IPTV (20,000+ channels)', 'Stream 20,000+ channels with IPTV subscription')
WHERE slug = 'fire-stick-4k-preloaded-iptv-guide';

-- Update excerpt with correct pricing
UPDATE real_blog_posts
SET excerpt = REPLACE(REPLACE(REPLACE(
  excerpt,
  '$24.99', '$25'),
  '$44.99', '$40'),
  '$79.99', '$70')
WHERE category IN ('IPTV Guides', 'Fire Stick Tutorials');

-- Remove references to Fire TV Cube (not in product lineup)
UPDATE real_blog_posts
SET status = 'draft'
WHERE slug IN ('fire-tv-cube-iptv-ultimate-guide', 'fire-stick-vs-fire-tv-cube-comparison-2025');

-- Update meta descriptions with correct pricing
UPDATE real_blog_posts
SET meta_description = REPLACE(REPLACE(REPLACE(
  meta_description,
  '$6.67/mo', '$5.83/mo'),
  '$24.99', '$25'),
  '$79.99', '$70')
WHERE status = 'publish';

-- Verify updated posts
SELECT 
  title,
  slug,
  CASE 
    WHEN content LIKE '%$69.99%' OR content LIKE '%$89.99%' OR content LIKE '%$109.99%' THEN 'Fire Stick Prices Updated'
    WHEN content LIKE '%$15%' OR content LIKE '%$25%' OR content LIKE '%$40%' OR content LIKE '%$70%' THEN 'IPTV Prices Updated'
    ELSE 'No Price References'
  END as price_status,
  status
FROM real_blog_posts
ORDER BY status DESC, seo_score DESC
LIMIT 10;
