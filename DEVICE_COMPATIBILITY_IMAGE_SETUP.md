# 📱 Device Compatibility Image Setup

## Image Added to Devices Section

The device compatibility image has been added to the **Devices** component, which appears on your main store page.

## Image Location

The image is expected to be at:
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/smart-iptv-compatibility.jpg
```

## How to Upload the Image

### Option 1: Upload to Supabase Storage (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/storage/buckets/imiges)
2. Navigate to the `imiges` bucket
3. Click **Upload file**
4. Upload your image as: `smart-iptv-compatibility.jpg`
5. Make sure the file is **public** (check file permissions)

### Option 2: Use Existing Image

If you already have the image uploaded with a different name, update the path in:
- File: `src/components/Devices.tsx`
- Line: `const deviceCompatibilityImage = ...`

Change the filename to match your uploaded image.

## What the Image Shows

The image displays:
- Smart TV with IPTV interface
- Tablet and smartphone showing IPTV apps
- Various streaming devices (Fire TV Stick, Android TV boxes, etc.)
- Logos of compatible platforms (Android, Apple, Fire TV, LG, Samsung, Roku, NVIDIA, Chromecast)

## Where It Appears

The image appears in the **Devices** section on:
- Home page (`/`)
- Main store page

It's displayed prominently between the device icons and the statistics section, showing all the platforms and devices your IPTV service is compatible with.

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1200px - 2000px wide
- **Aspect Ratio**: Landscape (16:9 or similar)
- **File Size**: Under 2MB for fast loading

## Fallback

If the image fails to load, a placeholder message will appear. Make sure the image is uploaded and publicly accessible.

---

**Status**: ✅ Code implemented, ready for image upload
