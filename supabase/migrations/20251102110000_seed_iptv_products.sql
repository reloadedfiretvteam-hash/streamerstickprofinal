/*
  # Seed IPTV Products
  
  1. Products
    - Insert Fire Stick products (HD, 4K, 4K Max)
    - Insert InfernoTV IPTV subscriptions (1M, 3M, 6M, 1Y)
  
  2. Categories
    - Fire Stick Devices
    - IPTV Subscriptions
*/

-- Create categories first
INSERT INTO categories (id, name, slug, description, display_order, is_active)
VALUES 
  (gen_random_uuid(), 'Fire Stick Devices', 'fire-stick-devices', 'Fully loaded Amazon Fire Stick devices', 1, true),
  (gen_random_uuid(), 'IPTV Subscriptions', 'iptv-subscriptions', 'Premium IPTV subscription plans', 2, true)
ON CONFLICT DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  firestick_cat_id uuid;
  iptv_cat_id uuid;
  product_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO firestick_cat_id FROM categories WHERE slug = 'fire-stick-devices' LIMIT 1;
  SELECT id INTO iptv_cat_id FROM categories WHERE slug = 'iptv-subscriptions' LIMIT 1;

  -- Insert Fire Stick HD
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    'Fire Stick HD',
    'fire-stick-hd',
    'Brand New Amazon Fire Stick HD - Pre-configured with 18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events. HD Quality. Plug & Play Setup (5 Minutes). 1 Year Premium IPTV Included. Free Shipping. 24/7 Support.',
    'Brand New Fire Stick HD with 1 Year IPTV',
    140.00,
    NULL,
    100,
    'FSHD-001',
    firestick_cat_id,
    false,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for Fire Stick HD
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/5721881/pexels-photo-5721881.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Fire Stick HD Device',
    true,
    1
  );

  -- Insert Fire Stick 4K
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    'Fire Stick 4K',
    'fire-stick-4k',
    'Brand New Amazon Fire Stick 4K - Pre-configured with 18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events. 4K Ultra HD Quality. Plug & Play Setup (5 Minutes). 1 Year Premium IPTV Included. Priority Support. Free Shipping.',
    'Brand New Fire Stick 4K with 1 Year IPTV - BEST VALUE',
    150.00,
    NULL,
    100,
    'FS4K-001',
    firestick_cat_id,
    true,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for Fire Stick 4K
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/4178672/pexels-photo-4178672.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Fire Stick 4K Device with Remote',
    true,
    1
  );

  -- Insert Fire Stick 4K Max
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    'Fire Stick 4K Max',
    'fire-stick-4k-max',
    'Brand New Amazon Fire Stick 4K Max - Pre-configured with 18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events. 4K Ultra HD Quality. Fastest Performance. Plug & Play Setup (5 Minutes). 1 Year Premium IPTV Included. VIP Support. Free Shipping.',
    'Brand New Fire Stick 4K Max with 1 Year IPTV - PREMIUM',
    160.00,
    NULL,
    100,
    'FS4KMAX-001',
    firestick_cat_id,
    false,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for Fire Stick 4K Max
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/7533347/pexels-photo-7533347.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Fire Stick 4K Max Premium Device',
    true,
    1
  );

  -- Insert InfernoTV 1 Month
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '1 Month IPTV Subscription',
    '1-month-iptv',
    'InfernoTV Premium IPTV Subscription - 1 Month Access to 22,000+ Live Channels, 120,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, 24/7 Support.',
    '1 Month Premium IPTV Access',
    14.99,
    NULL,
    999,
    'IPTV-1M',
    iptv_cat_id,
    false,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for 1 Month IPTV
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
    'InfernoTV IPTV Subscription',
    true,
    1
  );

  -- Insert InfernoTV 3 Months
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '3 Months IPTV Subscription',
    '3-months-iptv',
    'InfernoTV Premium IPTV Subscription - 3 Months Access to 22,000+ Live Channels, 120,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, 24/7 Support. Save $10!',
    '3 Months Premium IPTV - BEST VALUE',
    34.99,
    NULL,
    999,
    'IPTV-3M',
    iptv_cat_id,
    true,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for 3 Months IPTV
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
    'InfernoTV 3 Month Subscription',
    true,
    1
  );

  -- Insert InfernoTV 6 Months
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '6 Months IPTV Subscription',
    '6-months-iptv',
    'InfernoTV Premium IPTV Subscription - 6 Months Access to 22,000+ Live Channels, 120,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, Priority Support. Save $25!',
    '6 Months Premium IPTV - Great Savings',
    64.99,
    NULL,
    999,
    'IPTV-6M',
    iptv_cat_id,
    false,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for 6 Months IPTV
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
    'InfernoTV 6 Month Subscription',
    true,
    1
  );

  -- Insert InfernoTV 12 Months
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '12 Months IPTV Subscription',
    '12-months-iptv',
    'InfernoTV Premium IPTV Subscription - 1 Year Full Access to 22,000+ Live Channels, 120,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, VIP Support. Save $65! Best Deal!',
    '1 Year Premium IPTV - MAXIMUM SAVINGS',
    114.99,
    NULL,
    999,
    'IPTV-12M',
    iptv_cat_id,
    false,
    'active'
  ) RETURNING id INTO product_id;

  -- Add image for 12 Months IPTV
  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (
    product_id,
    'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
    'InfernoTV 12 Month Subscription',
    true,
    1
  );

END $$;
