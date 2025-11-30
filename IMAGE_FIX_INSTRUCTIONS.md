# IMAGE PERSISTENCE FIX - Complete Instructions

## Problem Solved
Your images were disappearing because:
1. Hero image was hardcoded (not saved in database)
2. Product images were showing 20 bytes (broken URLs)
3. Admin panel changes weren't persisting to database

## What I Fixed

### ✅ 1. Hero Image Now Loads from Database
- Hero component now loads image from `section_images` table
- Admin can change hero image via "Homepage Section Editor"
- Changes persist permanently in Supabase

### ✅ 2. Product Images Fixed
- Product images now properly load from Supabase Storage
- Admin can set images using just the filename (e.g., "firestick hd.jpg")
- Images will persist when you change them via admin panel

### ✅ 3. Admin Panel Integration
- "Homepage Section Editor" can now change hero background
- "Real Product Manager" shows image preview and saves correctly
- All changes save to database and won't revert

---

## STEP 1: Run This SQL in Supabase

**Copy and paste this into Supabase SQL Editor:**

```sql
-- ============================================================
-- COMPLETE IMAGE FIX - Run this AFTER the main setup SQL
-- This fixes images to persist and stay on your website
-- ============================================================

-- 1. Section Images Table (For Hero, Carousel, etc.)
CREATE TABLE IF NOT EXISTS section_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text UNIQUE NOT NULL,
  image_url text NOT NULL,
  image_type text DEFAULT 'background',
  alt_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE section_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read section images" ON section_images;
CREATE POLICY "Public can read section images"
  ON section_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage section images" ON section_images;
CREATE POLICY "Authenticated users can manage section images"
  ON section_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default hero image
INSERT INTO section_images (section_name, image_url, alt_text)
VALUES ('hero', 'hero-firestick-breakout.jpg', 'Hero background - Fire Stick breaking out of jail cell')
ON CONFLICT (section_name) DO NOTHING;

-- Update trigger
DROP TRIGGER IF EXISTS update_section_images_timestamp ON section_images;
CREATE TRIGGER update_section_images_timestamp BEFORE UPDATE ON section_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Ensure product_images table has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='image_url') THEN
    ALTER TABLE product_images ADD COLUMN image_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='alt_text') THEN
    ALTER TABLE product_images ADD COLUMN alt_text text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='is_primary') THEN
    ALTER TABLE product_images ADD COLUMN is_primary boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='product_images' AND column_name='sort_order') THEN
    ALTER TABLE product_images ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- 3. Ensure real_products table has main_image column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='real_products' AND column_name='main_image') THEN
    ALTER TABLE real_products ADD COLUMN main_image text;
  END IF;
END $$;
```

---

## STEP 2: How to Change Hero Image

1. **Log into your admin panel** (footer login)
2. Go to **"Homepage Section Editor"**
3. Click on **"Hero"** section
4. You'll see a **"Hero Background Image"** section
5. Enter the filename from Supabase Storage (e.g., `hero-firestick-breakout.jpg`)
6. Click **"Update"**
7. **Refresh your website** - the hero image will update!

---

## STEP 3: How to Change Product Images

1. Go to **"Real Product Manager"** in admin panel
2. Click **Edit** on any product
3. In the **"Main Image"** field, enter the filename from Supabase Storage
   - Example: `firestick hd.jpg`
   - Example: `firestick 4k.jpg`
   - Example: `iptv-subscription.jpg`
4. You'll see a preview of the image
5. Click **Save**
6. The image will persist and stay on your website!

---

## STEP 4: Fix Existing 20-Byte Images

If you have products showing 20-byte images (broken):

1. Go to **"Real Product Manager"**
2. Edit each product with broken images
3. Enter the correct filename in the **"Main Image"** field
4. Make sure the image file exists in your Supabase Storage bucket "images"
5. Save the product

---

## Important Notes

✅ **Images MUST be uploaded to Supabase Storage first!**
- Go to Supabase Dashboard → Storage → "images" bucket
- Upload your images there
- Then use the filename in the admin panel

✅ **Use just the filename, not the full URL**
- ✅ Correct: `firestick hd.jpg`
- ❌ Wrong: `https://yourproject.supabase.co/storage/v1/object/public/images/firestick%20hd.jpg`

✅ **Image names are case-sensitive**
- Make sure the filename matches exactly (including spaces)

✅ **Changes persist permanently**
- Once saved via admin panel, images stay on your website
- They won't revert back to defaults

---

## Troubleshooting

**Image still shows 20 bytes:**
- Check the filename is correct in Supabase Storage
- Make sure the image is in the "images" bucket
- Try refreshing the page

**Hero image not changing:**
- Make sure you ran the SQL above
- Check that `section_images` table exists in Supabase
- Verify the image filename is correct

**Product image not showing:**
- Verify the image exists in Supabase Storage bucket "images"
- Check the filename matches exactly (including spaces/capitalization)
- Make sure you saved the product after changing the image

---

## All Changes Are Pushed to GitHub

✅ All code changes are already pushed to your `clean-main` branch
✅ Your website will automatically deploy via Cloudflare Pages
✅ After deployment, all fixes will be live!

---

**Questions?** Check the admin panel - everything is now connected to Supabase and will persist!

