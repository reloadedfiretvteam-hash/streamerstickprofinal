# Supabase Storage Setup Guide

## Overview

This guide explains how to configure Supabase Storage buckets to ensure product images persist and remain publicly accessible.

## Problem

Images uploaded to Supabase Storage may "disappear" if:
1. The storage bucket doesn't exist
2. The bucket is private (not public)
3. Row Level Security (RLS) policies block access
4. The bucket name in the environment variable doesn't match

## Solution

### Step 1: Create Storage Bucket

1. Log in to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `images` (or match your `VITE_STORAGE_BUCKET_NAME` env variable)
   - **Public bucket**: ✅ **CHECK THIS BOX** (critical for public access)
   - **File size limit**: 50MB (recommended)
   - **Allowed MIME types**: `image/*` (or leave empty for all types)

### Step 2: Configure Bucket Policies

Even if the bucket is public, you may need to configure policies:

1. Go to **Storage** → Click on your `images` bucket
2. Click **Policies** tab
3. Create the following policies:

#### Policy 1: Public Read Access (GET)
```sql
-- Allow anyone to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

#### Policy 2: Authenticated Upload (INSERT)
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Authenticated Update (UPDATE)
```sql
-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

#### Policy 4: Authenticated Delete (DELETE)
```sql
-- Allow authenticated users to delete
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

### Step 3: Verify Environment Variable

In your `.env` file (or Cloudflare Pages environment variables), ensure:

```bash
VITE_STORAGE_BUCKET_NAME=images
```

**Important**: The bucket name MUST match exactly what you named it in Supabase Storage.

### Step 4: Test Image Upload

1. Log in to the admin panel: `https://yourdomain.com/custom-admin`
2. Go to **Products Manager**
3. Edit any product
4. Try uploading an image
5. Save the product
6. Verify the image displays correctly

### Step 5: Check Image URLs

Images uploaded through the admin panel should have URLs like:

```
https://[your-project-id].supabase.co/storage/v1/object/public/images/[filename]
```

If the URL is missing `/public/` or shows `403 Forbidden`, the bucket is not configured as public.

## Common Issues & Solutions

### Issue 1: Images Return 403 Forbidden

**Cause**: Bucket is not public or policies are too restrictive

**Solution**:
1. Go to Storage → images bucket → Settings
2. Check **"Public bucket"**
3. Click **"Save"**

### Issue 2: Cannot Upload Images

**Cause**: Missing INSERT policy or authentication issues

**Solution**:
1. Check the admin user is authenticated
2. Verify INSERT policy exists (see Policy 2 above)
3. Check browser console for error messages

### Issue 3: Images Disappear After Upload

**Cause**: Incorrect bucket name or DELETE policy auto-removing files

**Solution**:
1. Verify `VITE_STORAGE_BUCKET_NAME` matches bucket name exactly
2. Check DELETE policies aren't being triggered unexpectedly
3. Verify bucket storage quota isn't exceeded

### Issue 4: Wrong Bucket Name in Code

**Cause**: Environment variable not set or typo

**Solution**:
1. Check `.env` file has correct bucket name
2. Restart dev server after changing `.env`
3. For production, update Cloudflare Pages environment variables

## Alternative: Use Existing Bucket with Typo

If you already have a bucket named `imiges` (with typo):

1. Keep using it - don't recreate
2. Update your environment variable:
   ```bash
   VITE_STORAGE_BUCKET_NAME=imiges
   ```
3. Apply the same policies as above to the `imiges` bucket

## Security Best Practices

1. **Always use public buckets for product images** - they need to be accessible to all visitors
2. **Require authentication for upload/delete** - prevent abuse
3. **Set file size limits** - prevent storage quota abuse (50MB recommended)
4. **Restrict MIME types** - only allow `image/*` for image buckets
5. **Monitor usage** - check Storage dashboard regularly for unusual activity

## File Naming Convention

The `ImageUpload.tsx` component uses this naming pattern:
```
{productId}-{timestamp}-{index}.{extension}
```

Example: `550e8400-e29b-41d4-a716-446655440000-1701234567890-0.jpg`

This ensures:
- Unique filenames (no collisions)
- Traceable to product
- Multiple images per product
- Proper file extensions

## Maintenance

### Regular Tasks:
1. **Weekly**: Check storage usage in Supabase dashboard
2. **Monthly**: Review and clean up unused images
3. **Quarterly**: Verify all policies are still correct

### Cleanup Unused Images:
```sql
-- Find images not referenced by any product
SELECT * FROM storage.objects
WHERE bucket_id = 'images'
AND name NOT IN (
  SELECT image_url FROM product_images
  UNION
  SELECT main_image FROM real_products
);
```

## Troubleshooting Checklist

- [ ] Bucket exists in Supabase Storage
- [ ] Bucket is marked as "Public"
- [ ] `VITE_STORAGE_BUCKET_NAME` matches bucket name exactly
- [ ] Public read policy exists (SELECT)
- [ ] Authenticated upload policy exists (INSERT)
- [ ] Admin user is properly authenticated
- [ ] Browser console shows no errors
- [ ] Image URL includes `/public/` in the path
- [ ] Storage quota not exceeded

## Support

If issues persist:
1. Check Supabase logs: Dashboard → Logs → Storage
2. Check browser console for JavaScript errors
3. Verify network requests in browser DevTools
4. Contact Supabase support if needed

---

**Last Updated**: December 2024
