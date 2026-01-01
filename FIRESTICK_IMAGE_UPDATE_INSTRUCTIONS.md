# Firestick Product Image Update Instructions

## Overview
This update replaces the Firestick product images with new jailbroken Firestick promotional images.

## Image Mapping

Based on the provided images, here's the mapping:

1. **"FIRE TV STICK ORIGINAL"** (Budget-Friendly, Jailbroken)
   - **Filename**: `firestick original.jpg`
   - **Products**: Fire Stick HD, Fire Stick Original

2. **"FIRE TV STICK 4K"** (Jailbroken)
   - **Filename**: `firestick 4k.jpg`
   - **Products**: Fire Stick 4K

3. **"FIRE TV STICK 4K MAX"** (Jailbroken, Most Popular)
   - **Filename**: `firestick 4k max.jpg`
   - **Products**: Fire Stick 4K Max

## Steps to Complete the Update

### Step 1: Upload Images to Supabase Storage

1. Go to Supabase Dashboard → Storage → `images` bucket
2. Upload the three images with these exact filenames:
   - `firestick original.jpg` (for the "FIRE TV STICK ORIGINAL" image)
   - `firestick 4k.jpg` (for the "FIRE TV STICK 4K" image)
   - `firestick 4k max.jpg` (for the "FIRE TV STICK 4K MAX" image)

**Important**: Make sure the filenames match exactly (including spaces and lowercase).

### Step 2: Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/20250116000001_update_firestick_images.sql`

This will update all product records to reference the new image filenames.

### Step 3: Verify Changes

1. Check that products in the database now have the correct `main_image` values:
   - Fire Stick HD/Original → `firestick original.jpg`
   - Fire Stick 4K → `firestick 4k.jpg`
   - Fire Stick 4K Max → `firestick 4k max.jpg`

2. Visit your website and verify the images display correctly on:
   - Product listing pages
   - Product detail pages
   - Shopping cart
   - Checkout pages

## Code Changes Made

The following files have been updated to support the new image filenames:

- `src/components/Shop.tsx` - Updated fallback image logic
- `src/pages/ShopPage.tsx` - Updated fallback image logic
- `src/pages/FireSticksPage.tsx` - Updated fallback image logic
- `supabase/migrations/20250116000001_update_firestick_images.sql` - Database migration

## Notes

- The code now checks for "original" in product names and uses `firestick original.jpg`
- For HD products (without "original" in the name), it also uses `firestick original.jpg` as the default
- The migration handles both "HD" and "Original" product name variations
- All changes are backward compatible - if images don't exist, the system will fall back gracefully

## Troubleshooting

If images don't appear:

1. **Check Supabase Storage**: Verify images are uploaded to the `images` bucket with correct filenames
2. **Check File Permissions**: Ensure the `images` bucket has public read access
3. **Check Database**: Run a query to verify product `main_image` values:
   ```sql
   SELECT name, main_image FROM real_products 
   WHERE name ILIKE '%fire stick%';
   ```
4. **Check Browser Console**: Look for 404 errors when loading images
5. **Clear Cache**: Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)

