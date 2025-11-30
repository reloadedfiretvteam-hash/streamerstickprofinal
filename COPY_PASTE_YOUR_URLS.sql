-- ============================================================
-- ADD YOUR SERVICE URL AND YOUTUBE VIDEO
-- Copy-paste this entire block into Supabase SQL Editor
-- ============================================================

-- Add default setup video (YouTube video that ALL customers get)
INSERT INTO product_setup_videos (product_type, video_title, video_url, is_default, is_active) 
VALUES 
  ('all', 'Stream Stick Pro Setup Guide', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true),
  ('firestick', 'Fire Stick Setup Guide', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true),
  ('iptv', 'IPTV Subscription Setup', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true)
ON CONFLICT DO NOTHING;

-- Set default service URL (URL that ALL customers get)
UPDATE real_products 
SET service_url = 'http://ky-tv.cc'
WHERE service_url IS NULL OR service_url = '';

-- Also save in site_settings as default
INSERT INTO site_settings (setting_key, setting_value, category, description)
VALUES ('default_service_url', 'http://ky-tv.cc', 'customer', 'Default service URL sent to all customers')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

