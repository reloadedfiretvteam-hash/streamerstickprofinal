/*
  # Seed Original IPTV Products
  
  ## Products (EXACT ORIGINAL PRICES from FINAL_SUMMARY.md)
  1. Fire Stick HD - $140.00
  2. Fire Stick 4K - $150.00
  3. Fire Stick 4K Max - $160.00
  4. 1 Month IPTV - $15.00
  5. 3 Month IPTV - $25.00
  6. 6 Month IPTV - $40.00
  7. 1 Year IPTV - $70.00
*/

DO $$
DECLARE
  firestick_cat_id uuid;
  iptv_cat_id uuid;
  product_id uuid;
BEGIN
  SELECT id INTO firestick_cat_id FROM categories WHERE slug = 'fire-stick-devices' LIMIT 1;
  SELECT id INTO iptv_cat_id FROM categories WHERE slug = 'iptv-subscriptions' LIMIT 1;

  -- Fire Stick HD - $140
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    'Fire Stick HD',
    'fire-stick-hd',
    'Brand New Amazon Fire Stick HD - Pre-configured with 20,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events. HD Quality. Plug & Play Setup (5 Minutes). 1 Year Premium IPTV Included. Free Shipping. 24/7 Support.',
    'Brand New Fire Stick HD with 1 Year IPTV',
    140.00, NULL, 100, 'FSHD-001',
    firestick_cat_id, false, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/5721881/pexels-photo-5721881.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fire Stick HD Device', true, 1);

  -- Fire Stick 4K - $150
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    'Fire Stick 4K',
    'fire-stick-4k',
    'Brand New Amazon Fire Stick 4K - Pre-configured with 20,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events. 4K Ultra HD Quality. Plug & Play Setup (5 Minutes). 1 Year Premium IPTV Included. Priority Support. Free Shipping.',
    'Brand New Fire Stick 4K with 1 Year IPTV - BEST VALUE',
    150.00, NULL, 100, 'FS4K-001',
    firestick_cat_id, true, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/4178672/pexels-photo-4178672.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fire Stick 4K Device', true, 1);

  -- Fire Stick 4K Max - $160
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    'Fire Stick 4K Max',
    'fire-stick-4k-max',
    'Brand New Amazon Fire Stick 4K Max - Pre-configured with 20,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports Channels & PPV Events. 4K Ultra HD Quality. Fastest Performance. Plug & Play Setup (5 Minutes). 1 Year Premium IPTV Included. VIP Support. Free Shipping.',
    'Brand New Fire Stick 4K Max with 1 Year IPTV - PREMIUM',
    160.00, NULL, 100, 'FS4KMAX-001',
    firestick_cat_id, false, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/7533347/pexels-photo-7533347.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fire Stick 4K Max', true, 1);

  -- 1 Month IPTV - $15
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '1 Month IPTV Subscription',
    '1-month-iptv',
    'Stream Stick Pro Premium IPTV Subscription - 1 Month Access to 20,000+ Live Channels, 60,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, 24/7 Support.',
    '1 Month Premium IPTV Access',
    15.00, NULL, 999, 'IPTV-1M',
    iptv_cat_id, false, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800', 'IPTV Subscription', true, 1);

  -- 3 Month IPTV - $25
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '3 Months IPTV Subscription',
    '3-months-iptv',
    'Stream Stick Pro Premium IPTV Subscription - 3 Months Access to 20,000+ Live Channels, 60,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, 24/7 Support. BEST VALUE!',
    '3 Months Premium IPTV - BEST VALUE',
    25.00, NULL, 999, 'IPTV-3M',
    iptv_cat_id, true, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800', '3 Month Subscription', true, 1);

  -- 6 Month IPTV - $40
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '6 Months IPTV Subscription',
    '6-months-iptv',
    'Stream Stick Pro Premium IPTV Subscription - 6 Months Access to 20,000+ Live Channels, 60,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, Priority Support.',
    '6 Months Premium IPTV - Great Savings',
    40.00, NULL, 999, 'IPTV-6M',
    iptv_cat_id, false, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800', '6 Month Subscription', true, 1);

  -- 1 Year IPTV - $70
  INSERT INTO products_full (
    name, slug, description, short_description,
    base_price, sale_price, stock_quantity, sku,
    category_id, featured, status
  ) VALUES (
    '1 Year IPTV Subscription',
    '1-year-iptv',
    'Stream Stick Pro Premium IPTV Subscription - 1 Year Full Access to 20,000+ Live Channels, 60,000+ Movies & Shows, All Sports & PPV, 4K Quality, Works on All Devices, VIP Support. Best Deal!',
    '1 Year Premium IPTV - MAXIMUM SAVINGS',
    70.00, NULL, 999, 'IPTV-12M',
    iptv_cat_id, false, 'active'
  ) RETURNING id INTO product_id;

  INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES (product_id, 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800', '1 Year Subscription', true, 1);

END $$;
