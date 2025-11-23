# 📹 How to Upload Your IPTV Preview Video to Supabase

## 🎯 Quick Steps

### Step 1: Open Supabase Storage
Click this link to go directly to your storage bucket:
👉 **[Open Supabase Storage](https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/storage/buckets/imiges)**

Or manually:
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm
2. Click **"Storage"** in the left menu
3. Click on the **"imiges"** bucket

### Step 2: Upload Your Video
1. Click the **"Upload file"** button (top right)
2. Select your video file
3. **Important:** Name it exactly: `iptv-preview-video.mp4`
   - If your file has a different name, rename it first
   - The file must be named exactly: `iptv-preview-video.mp4`

### Step 3: Make It Public
1. After upload, click on the file name
2. Make sure it's set to **"Public"** (not private)
3. If it's private, click the settings icon and change it to public

### Step 4: Verify the URL
After uploading, the file URL should be:
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-preview-video.mp4
```

### Step 5: Test on Your Website
1. Go to your website: https://streamstickpro.com
2. Scroll to the "See What You Get with IPTV Subscription" section
3. Click the play button
4. The video should play!

---

## 📋 Video Requirements

- **Format:** MP4 (recommended)
- **File Name:** `iptv-preview-video.mp4` (exact match required)
- **Location:** Supabase Storage bucket `imiges`
- **Privacy:** Must be public
- **Size:** No specific limit, but keep it under 100MB for best performance

---

## ❌ Troubleshooting

### Error: "Object not found" (404)
**Problem:** The video file doesn't exist in Supabase Storage yet.

**Solution:**
1. Follow the steps above to upload the video
2. Make sure the file name is exactly: `iptv-preview-video.mp4`
3. Make sure it's in the `imiges` bucket (not `images`)
4. Make sure the file is set to public

### Error: Video won't play
**Problem:** File might be private or wrong format.

**Solution:**
1. Check that the file is set to "Public" in Supabase
2. Try a different browser
3. Make sure the file is MP4 format
4. Check the file size (very large files may take time to load)

### Video shows but doesn't play
**Problem:** Browser compatibility or codec issue.

**Solution:**
1. Try a different browser (Chrome, Firefox, Safari)
2. Convert video to H.264 codec (most compatible)
3. Check your internet connection

---

## 🔗 Direct Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm
- **Storage Bucket:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/storage/buckets/imiges
- **Your Website:** https://streamstickpro.com

---

## ✅ After Upload

Once you've uploaded the video:
1. ✅ The 404 error will disappear
2. ✅ The video will play when clicked
3. ✅ It will show what customers see on Fire Stick
4. ✅ It will help convert more visitors to customers!

**That's it!** Your video will be live on your website immediately after upload. 🎉

