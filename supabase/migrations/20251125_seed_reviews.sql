/*
  # Seed Reviews for Customer Testimonials
  
  This migration seeds a realistic set of customer reviews for product testimonials.
  Reviews are distributed across different products with varying ratings and details.
  
  IMPORTANT: Run this AFTER 20251125_seed_secure_products.sql
*/

-- =============================================================================
-- SEED REVIEWS
-- =============================================================================

-- Clear existing sample reviews (if any)
DELETE FROM reviews WHERE customer_name LIKE 'Sample%';

-- Insert realistic reviews
INSERT INTO reviews (product_id, customer_name, customer_location, rating, title, content, verified_purchase, helpful_count, approved, featured)
VALUES
  -- Fire Stick 4K Reviews (Most Popular)
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-4k' LIMIT 1),
    'Michael R.',
    'New York, NY',
    5,
    'Best streaming device I''ve ever owned!',
    'Setup was incredibly easy - literally plug and play. Within 5 minutes I was streaming in 4K. The picture quality is amazing and the remote works flawlessly with Alexa. Highly recommend for anyone looking to cut the cord!',
    true,
    47,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-4k' LIMIT 1),
    'Sarah J.',
    'Los Angeles, CA',
    5,
    'Exceeded all expectations',
    'I was skeptical at first, but this Fire Stick 4K is the real deal. Everything was pre-configured perfectly. Customer support helped me with a quick question and they were super responsive. Already recommended to three friends!',
    true,
    38,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-4k' LIMIT 1),
    'James P.',
    'Chicago, IL',
    4,
    'Great device, fast shipping',
    'Device works great for streaming. The 4K quality is noticeably better than my old stick. Only minor issue was learning all the features, but the included guide helped. Would buy again.',
    true,
    22,
    true,
    false
  ),

  -- Fire Stick 4K Max Reviews
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-4k-max' LIMIT 1),
    'David C.',
    'Houston, TX',
    5,
    'WiFi 6E is a game changer',
    'If you have a WiFi 6E router, this is the one to get. Zero buffering even with multiple people streaming in the house. The extra storage is nice too. Premium price but worth every penny.',
    true,
    56,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-4k-max' LIMIT 1),
    'Jennifer M.',
    'Phoenix, AZ',
    5,
    'Professional setup, amazing quality',
    'Received my Fire Stick 4K Max and was immediately impressed. The team clearly knows what they''re doing - everything was ready to go out of the box. Dolby Vision and Atmos work perfectly with my home theater.',
    true,
    41,
    true,
    true
  ),

  -- Fire Stick HD Reviews
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-hd' LIMIT 1),
    'Robert T.',
    'Philadelphia, PA',
    5,
    'Perfect for my bedroom TV',
    'Don''t have a 4K TV in my bedroom so this HD version was perfect. Saved some money and still get all the same features. Works flawlessly and the picture is crystal clear.',
    true,
    29,
    true,
    false
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'fire-stick-hd' LIMIT 1),
    'Amanda W.',
    'San Antonio, TX',
    4,
    'Great starter device',
    'Bought this for my parents who aren''t tech-savvy. They love it! Easy to use and the Alexa remote is perfect for them. Picture quality is great for their TV. Support team was helpful when we had questions.',
    true,
    18,
    true,
    false
  ),

  -- 6-Month IPTV Reviews (Best Value)
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-6-month' LIMIT 1),
    'Carlos G.',
    'Miami, FL',
    5,
    'Finally cut the cable cord!',
    'Been paying $200/month for cable. Now I have 10x the channels for a fraction of the price. All the sports I want including international soccer. My whole family is happy. This is the future of TV.',
    true,
    72,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-6-month' LIMIT 1),
    'Lisa A.',
    'Dallas, TX',
    5,
    'Every channel I could want',
    'The channel selection is incredible. Local channels, sports, movies, international content - it''s all there. Stream quality is excellent. Customer service is responsive when I had a question about my setup.',
    true,
    45,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-6-month' LIMIT 1),
    'Kevin L.',
    'Seattle, WA',
    4,
    'Great service, occasional buffering',
    'Overall very happy with the service. Huge selection of channels and the guide is easy to navigate. Sometimes there''s minor buffering during peak hours but it''s rare. The price can''t be beat.',
    true,
    31,
    true,
    false
  ),

  -- 12-Month IPTV Reviews
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-12-month' LIMIT 1),
    'Timothy H.',
    'Denver, CO',
    5,
    'Best entertainment value period',
    'Went with the annual plan and it was the smart choice. All PPV events are included which alone would cost more than the subscription. Using 5 devices in my household without any issues.',
    true,
    58,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-12-month' LIMIT 1),
    'Monica S.',
    'Atlanta, GA',
    5,
    'Whole family loves it',
    'We have three TVs in the house and everyone can watch what they want simultaneously. Kids love the cartoon channels, I watch sports, wife watches her shows. Everyone is happy and we''re saving hundreds.',
    true,
    44,
    true,
    false
  ),

  -- 3-Month IPTV Reviews
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-3-month' LIMIT 1),
    'Emily S.',
    'Boston, MA',
    5,
    'Perfect for trying the service',
    'Started with 3 months to test it out. Absolutely love it. Already planning to renew with the annual plan. The sports coverage is unmatched - every NFL, NBA, and UFC event I want.',
    true,
    27,
    true,
    false
  ),

  -- 1-Month IPTV Reviews
  (
    (SELECT id FROM real_products WHERE slug = 'iptv-1-month' LIMIT 1),
    'Derek W.',
    'Nashville, TN',
    4,
    'Good starter option',
    'Great way to try the service without commitment. Quality is excellent. The only reason for 4 stars is I wish I had just gone with a longer plan from the start - better value.',
    true,
    15,
    true,
    false
  ),

  -- Website Design Reviews
  (
    (SELECT id FROM real_products WHERE slug = 'website-standard' LIMIT 1),
    'Rachel H.',
    'Portland, OR',
    5,
    'Professional results, fast turnaround',
    'Had my business website up in less than a week. The design is modern and professional. My customers love the new look. The CMS is easy to use for updates. Highly recommend!',
    true,
    33,
    true,
    true
  ),
  (
    (SELECT id FROM real_products WHERE slug = 'website-premium' LIMIT 1),
    'Brandon K.',
    'Austin, TX',
    5,
    'E-commerce setup exceeded expectations',
    'Needed an online store for my business. The premium package included everything - payment processing, inventory management, SEO. Started getting orders within the first week. Worth every penny.',
    true,
    40,
    true,
    true
  );

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Run this query to verify seeded reviews:
-- SELECT 
--   r.customer_name,
--   r.rating,
--   r.title,
--   rp.name as product_name,
--   r.featured,
--   r.helpful_count
-- FROM reviews r
-- LEFT JOIN real_products rp ON rp.id = r.product_id
-- WHERE r.approved = true
-- ORDER BY r.featured DESC, r.helpful_count DESC;
