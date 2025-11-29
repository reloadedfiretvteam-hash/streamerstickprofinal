# Supabase Image Storage Setup Guide

## Overview
This application uses Supabase Storage for managing all product and content images. Images are stored in the `images` bucket (canonical name) and referenced by filename in the database.

**Recommended bucket name:** `images`

The application automatically normalizes common typos:
- `imiges` → `images`
- `imagees` → `images`
- `imags` → `images`
- `image` → `images`

## Required Images

### Fire Stick Products
Upload these images to your Supabase Storage `images` bucket:

1. **firestick hd.jpg** - Fire Stick HD device image
2. **firestick 4k.jpg** - Fire Stick 4K device image
3. **firestick 4k max.jpg** - Fire Stick 4K Max device image

### IPTV Subscription
4. **iptv-subscription.jpg** - Generic IPTV subscription image

### Hero Section
5. **hero-firestick-breakout.jpg** - Main hero banner image

### Media Carousel
6. **Playback-Tile-1024x512.webp** - Action movies thumbnail
7. **Movies-categories_11zon-1024x512.webp** - Thriller & Horror thumbnail
8. **IPTVSmarters TV IMAG.jpg** - TV series thumbnail
9. **iptv3.jpg** - Trending shows thumbnail
10. **OIP (11) websit pic.jpg** - Binge-worthy series thumbnail
11. **c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg** - NFL sports thumbnail
12. **BASEBALL.webp** - MLB sports thumbnail
13. **downloadBASKET BALL.jpg** - NBA sports thumbnail
14. **UFC.jpg** - UFC & Boxing thumbnail

### Video Files (Optional)
15. **iptv-preview-video.mp4** - IPTV preview demo video
16. **what-you-get-demo.mp4** - What you get demo video

## Setup Instructions

### 1. Create Storage Bucket

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Allow authenticated uploads (for admin)
CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');
```

### 2. Upload Images

**Option A: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets/images
2. Click "Upload file"
3. Upload all required images listed above
4. Ensure filenames match exactly (case-sensitive)

**Option B: Using the Admin Panel**
1. Log into your admin panel at `/admin`
2. Navigate to "Media Library" or "Image Manager"
3. Upload images through the web interface

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STORAGE_BUCKET_NAME=images
```

Get these values from: https://supabase.com/dashboard/project/_/settings/api

### 4. Run Database Migrations

The migration `20251124000000_fix_product_image_urls.sql` will update all product records to use the correct image paths.

Apply it via Supabase Dashboard:
1. Go to SQL Editor
2. Paste the migration contents
3. Run the query

Or via Supabase CLI:
```bash
supabase db push
```

## How Image URLs Work

### In the Database
Products store only the filename:
```sql
main_image = 'firestick 4k.jpg'
```

### In the Application
The `getStorageUrl()` helper function constructs the full URL:
```javascript
import { getStorageUrl } from '../lib/supabase';

const imageUrl = getStorageUrl('images', 'firestick 4k.jpg');
// Returns: https://your-project.supabase.co/storage/v1/object/public/images/firestick%204k.jpg
```

### Fallback Behavior
If Supabase is not configured, the app uses Pexels placeholder images to prevent broken images. Additionally, the `ValidatedImage` component validates images before displaying them, falling back to placeholder images if the source is too small (< 1000 bytes) or fails to load.

## Quick Diagnostic with curl

Use this command to verify image accessibility:

```bash
# Check image headers and content-length
curl -I "https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/images/firestick%204k.jpg"

# Expected successful response:
# HTTP/2 200
# content-length: 123456  (should be > 1000 bytes)
# content-type: image/jpeg

# If you see 404 or content-length < 1000, the image is missing or corrupt
```

## Troubleshooting Checklist

Use this checklist when images aren't displaying:

- [ ] **Bucket exists:** Verify `images` bucket in Supabase Dashboard → Storage
- [ ] **Bucket is public:** Click bucket and ensure "Public bucket" is enabled
- [ ] **File exists:** Check exact filename in storage (case-sensitive!)
- [ ] **Environment variables set:** Verify VITE_SUPABASE_URL is correct
- [ ] **Content-length valid:** Use curl HEAD to check size > 1000 bytes
- [ ] **No CORS errors:** Check browser console for CORS-related errors
- [ ] **Redeploy after config changes:** Environment variable changes require new build

### Common Issues

**"403 Forbidden" Error**
- Bucket is not public
- Storage policies not set correctly
- Run the policy creation SQL above

**"404 Not Found" Error**
- Filename mismatch (check case)
- File not uploaded to correct bucket
- Wrong bucket name in code

**Images Work Locally But Not in Production**
- Environment variables not set in deployment
- Check Cloudflare Pages / Vercel / Netlify environment variables

**Images appear as tiny placeholders (< 1000 bytes)**
- The ValidatedImage component detected a corrupt/tiny file
- Re-upload the image with proper quality
- Use curl HEAD to verify content-length

## Migration from Old System

If you're migrating from the old hardcoded URLs:

1. Upload all images to the new `images` bucket
2. Run the migration: `20251124000000_fix_product_image_urls.sql`
3. Deploy the updated code with `getStorageUrl()` function
4. Test all pages to verify images load correctly

## File Naming Conventions

- Use lowercase with spaces for readability: `firestick 4k.jpg`
- Use hyphens for web-friendly names: `hero-firestick-breakout.jpg`
- Be consistent with extensions: `.jpg`, `.png`, `.webp`, `.mp4`
- Avoid special characters except hyphens and spaces
- Keep names descriptive but concise

## Security Notes

- The `images` bucket is PUBLIC - anyone can view images
- Only authenticated users can upload (admin panel)
- Never store sensitive data in image metadata
- Use appropriate file size limits (currently 10MB)
- Validate file types on upload

## Performance Tips

- Use WebP format when possible (smaller file size)
- Optimize images before upload (compress to 80-90% quality)
- Keep images under 500KB when possible
- Use lazy loading for images below the fold
- Consider CDN caching (Supabase Storage has CDN built-in)

## Support

For Supabase Storage documentation:
https://supabase.com/docs/guides/storage

For issues with this setup:
Check the repository issues or contact the development team.
