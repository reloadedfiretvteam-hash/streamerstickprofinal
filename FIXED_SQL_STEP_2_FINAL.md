# 🔧 FIXED SQL - STEP 2 (FINAL VERSION - Copy This!)

## ✅ This version works with your existing site_settings table structure

---

## STEP 2 - FIXED: Run This SQL

### WHERE TO GO:
1. Go to Supabase Dashboard
2. Click "SQL Editor" (left menu)
3. Click "New Query"

### WHAT TO COPY & PASTE:

```sql
-- First, allow product_id to be NULL for default videos
ALTER TABLE product_setup_videos 
ALTER COLUMN product_id DROP NOT NULL;

-- Now add your YouTube setup video (product_id can be NULL for default videos)
INSERT INTO product_setup_videos (product_id, product_type, video_title, video_url, is_default, is_active) 
VALUES 
  (NULL, 'all', 'Stream Stick Pro Setup Guide', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true),
  (NULL, 'firestick', 'Fire Stick Setup Guide', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true),
  (NULL, 'iptv', 'IPTV Subscription Setup', 'https://youtu.be/DYSOp6mUzDU?si=-OHqUNVXcBmjSX45', true, true);

-- Set Service URL for all products
UPDATE real_products 
SET service_url = 'http://ky-tv.cc'
WHERE service_url IS NULL OR service_url = '';

-- Save Service URL as default (without category/description columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings') THEN
    INSERT INTO site_settings (setting_key, setting_value)
    VALUES ('default_service_url', 'http://ky-tv.cc')
    ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
  END IF;
END $$;
```

### WHAT TO CLICK:
Click the green "Run" button (or press F5)

Wait for "Success" message ✅

---

## ✅ DONE!

This should work now! The SQL only uses columns that exist in your `site_settings` table.




