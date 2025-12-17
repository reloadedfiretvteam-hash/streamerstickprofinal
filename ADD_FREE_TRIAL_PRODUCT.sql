-- Add 36-Hour Free Trial Product to real_products table
-- This will show up alongside other IPTV subscription products
-- and go through the full checkout + credential generation system

INSERT INTO real_products (
  name,
  cloaked_name,
  description,
  short_description,
  price,
  sale_price,
  category,
  type,
  featured,
  popular,
  status,
  main_image,
  service_url,
  setup_video_url,
  sort_order,
  metadata
) VALUES (
  '36-Hour Free Trial - IPTV Access',
  'Digital Entertainment Service - Trial',
  '🎉 <strong>Try Before You Buy!</strong> Get full access to our premium IPTV service for 36 hours - completely FREE!

<h3>What''s Included in Your Free Trial:</h3>
<ul>
  <li>✅ 22,000+ Live TV Channels</li>
  <li>✅ 120,000+ Movies & TV Shows</li>
  <li>✅ All Sports & PPV Events (NFL, NBA, UFC, etc.)</li>
  <li>✅ 4K Ultra HD Quality</li>
  <li>✅ Works on Fire Stick, Smart TV, Phone, Tablet</li>
  <li>✅ 24/7 Customer Support</li>
  <li>✅ No Credit Card Required</li>
</ul>

<p><strong>Duration:</strong> Full access for 36 hours from activation</p>
<p><strong>After Trial:</strong> Only $14.99/month if you decide to continue (cancel anytime)</p>

<p class="text-green-600"><strong>🎁 BONUS:</strong> If you subscribe after your trial, get your first month at 50% OFF!</p>',
  
  'Get full access to 22,000+ channels, 120,000+ movies, all sports & PPV for 36 hours - 100% FREE!',
  
  0.00,  -- FREE!
  0.00,
  'iptv',
  'subscription',
  true,   -- Featured
  true,   -- Popular (show first!)
  'active',
  'iptv-preview-video.mp4',  -- Use existing IPTV image
  'http://ky-tv.cc',
  'https://www.youtube.com/watch?v=YOUR_SETUP_VIDEO_ID',
  1,  -- Sort first in list
  '{
    "trial": true,
    "duration_hours": 36,
    "features": [
      "22,000+ Live TV Channels",
      "120,000+ Movies & TV Shows",
      "All Sports & PPV Events",
      "4K Ultra HD Quality",
      "Works on All Devices",
      "24/7 Customer Support",
      "No Credit Card Required",
      "36 Hours Full Access"
    ],
    "badge": "FREE TRIAL",
    "auto_generate_credentials": true,
    "send_credentials_email": true
  }'
)
ON CONFLICT (name) DO UPDATE SET
  price = 0.00,
  sale_price = 0.00,
  cloaked_name = 'Digital Entertainment Service - Trial',
  featured = true,
  popular = true,
  status = 'active',
  sort_order = 1,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  metadata = EXCLUDED.metadata;

-- Verify it was added
SELECT id, name, price, category, featured, popular, status 
FROM real_products 
WHERE name LIKE '%Free Trial%'
ORDER BY created_at DESC
LIMIT 1;

