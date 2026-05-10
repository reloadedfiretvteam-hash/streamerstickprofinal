-- Supabase: ONN-only hardware SKUs ($150 HD, $160 4K).
-- 1) In Stripe Dashboard create two Prices ($150 and $160 one-time) on your cloaked/digital products.
-- 2) In Admin Panel → Products, assign shadow_price_id for each row, OR run the UPDATEs below.

INSERT INTO real_products (id, name, description, price, category, image_url)
VALUES
(
  'onn-google-hd',
  'ONN Full HD (1080p) Google TV Kit',
  'onn. Full HD Streaming Device with Google TV, voice remote, and guided Reloaded Fire TV setup. About 10 minutes to plug in, enter credentials, and stream. Includes 1-year Reloaded Fire TV plan, tutorials, shipping, and 24/7 support.',
  15000,
  'devices',
  '/images/onn-full-hd-google-tv.webp'
),
(
  'onn-google-4k',
  'ONN 4K Ultra HD Google TV Kit',
  'onn. 4K Streaming Device with Google TV, HDR, Dolby Audio, voice remote, and guided Reloaded Fire TV setup. Includes 1-year Reloaded Fire TV plan, tutorials, shipping, and 24/7 support.',
  16000,
  'devices',
  '/images/onn-4k-google-tv.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url;

-- After Stripe prices exist:
-- UPDATE real_products SET shadow_price_id = 'price_XXXX150' WHERE id = 'onn-google-hd';
-- UPDATE real_products SET shadow_price_id = 'price_XXXX160' WHERE id = 'onn-google-4k';

-- Optional: stop selling Fire Stick SKUs (only when orders are fulfilled / migrated):
-- DELETE FROM real_products WHERE id IN ('firestick-hd','firestick-4k','firestick-4k-max','fs-hd','fs-4k','fs-max','android-onn-4k','android-onn-pro');
