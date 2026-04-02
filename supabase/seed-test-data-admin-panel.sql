-- =============================================================================
-- TEST DATA FOR ADMIN PANEL
-- Run this in Supabase Dashboard → SQL Editor to see Products and Blog in Admin.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTION A: real_products with VARCHAR id and image_url column
-- (Matches supabase-schema.sql / supabase-complete-setup.sql)
-- ─────────────────────────────────────────────────────────────────────────────
-- If you get "relation real_products does not exist" or "column image_url does not exist",
-- skip to OPTION B below.

INSERT INTO real_products (id, name, description, price, category, image_url)
VALUES
  ('test-firestick-1', 'StreamStick Starter Kit (Test)', 'Pre-configured Fire Stick HD with 1 Year Live TV. Test product for admin panel.', 13000, 'devices', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/OIP_(11)99_1764978938773.jpg'),
  ('test-firestick-2', 'StreamStick 4K Kit (Test)', 'Pre-configured Fire Stick 4K with 1 Year Live TV. Test product for admin panel.', 14000, 'devices', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg'),
  ('test-iptv-1', 'Live TV 1 Month - 1 Device (Test)', '18K+ channels, 100K+ VOD. Test subscription for admin panel.', 1500, 'subscriptions', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url;

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTION B: real_products with UUID id and main_image column
-- (Migration-based schema - 20251104012412)
-- Run this INSTEAD of Option A if Option A fails.
-- ─────────────────────────────────────────────────────────────────────────────
/*
-- 1) Ensure image_url exists (worker reads this)
ALTER TABLE real_products ADD COLUMN IF NOT EXISTS image_url text;
UPDATE real_products SET image_url = main_image WHERE image_url IS NULL AND main_image IS NOT NULL;

-- 2) Insert test products (omit id so it auto-generates UUID)
INSERT INTO real_products (name, slug, description, price, category, main_image, image_url, status)
VALUES
  ('StreamStick Starter Kit (Test)', 'test-firestick-1', 'Pre-configured Fire Stick HD. Test product.', 130.00, 'devices', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/OIP_(11)99_1764978938773.jpg', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/OIP_(11)99_1764978938773.jpg', 'publish'),
  ('StreamStick 4K Kit (Test)', 'test-firestick-2', 'Pre-configured Fire Stick 4K. Test product.', 140.00, 'devices', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg', 'publish'),
  ('Live TV 1 Month (Test)', 'test-iptv-1', '18K+ channels. Test subscription.', 15.00, 'subscriptions', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg', 'publish');
*/

-- =============================================================================
-- BLOG POST (Admin → Blog tab)
-- Uses blog_posts table. status = 'published' for base schema; is_published for worker.
-- =============================================================================
INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at, created_at, updated_at)
VALUES (
  'Test Post – Admin Panel Check',
  'test-post-admin-panel-check',
  'This is a test blog post so you can confirm the Blog section in the admin panel is working.',
  '<p>If you see this post in your admin panel, blog data is loading correctly.</p><p>You can edit or delete this post from the Blog tab.</p>',
  'published',
  now(),
  now(),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  updated_at = now();

-- If your blog_posts has is_published (from migration 20260213), run this to enable it:
-- UPDATE blog_posts SET is_published = true WHERE slug = 'test-post-admin-panel-check';

-- If your blog_posts table has no slug unique constraint, remove the ON CONFLICT line and run:
-- INSERT INTO blog_posts (title, slug, excerpt, content, is_published, published_at, created_at, updated_at)
-- VALUES ('Test Post – Admin Panel Check', 'test-post-admin-panel-check', '...', '<p>...</p>', true, now(), now(), now());

-- =============================================================================
-- DONE
-- Refresh your Admin Panel (Products and Blog tabs) to see the test data.
-- =============================================================================
