# 📸 HOW TO UPLOAD PRODUCT IMAGES - SIMPLE GUIDE

## ✅ YES! You can upload images in your admin panel!

You have **2 easy ways** to upload product images. Choose whichever is easiest for you:

---

## 🚀 METHOD 1: Upload Images Directly in Admin Panel (RECOMMENDED)

### Step 1: Go to Admin Panel
1. Log into your website
2. Scroll to footer and click "Admin" or go to `/admin`
3. Enter your admin credentials

### Step 2: Find Image Manager
1. In the admin dashboard, look for **"Media & Images"** category
2. Click on **"Simple Image Manager"** or **"Enhanced Media Library"**

### Step 3: Upload Images
**Option A: Simple Image Manager**
1. Click **"Simple Image Manager"**
2. Select a product from the dropdown
3. Click **"Click to Upload Images"**
4. Select your image files (JPG, PNG, WEBP, GIF)
5. Images will upload automatically!

**Option B: Enhanced Media Library**
1. Click **"Enhanced Media Library"**
2. Click **"Upload New Image"**
3. Paste image URL or upload file
4. Add tags (optional)
5. Click **"Upload Image"**

### Step 4: Set Image for Product
1. Go to **"Product Management"** → **"Real Product Manager"**
2. Click **"Edit"** on the product you want
3. In **"Main Image"** field, enter the **filename** (e.g., `firestick-4k.jpg`)
4. Click **"Save Product"**

**Note:** If using Simple Image Manager, it uploads to `product-images` bucket. You'll need to also set the filename in Real Product Manager.

---

## 🎯 METHOD 2: Upload via Supabase Storage, Then Link in Admin Panel

### Step 1: Upload to Supabase Storage
1. Go to **Supabase Dashboard** → Your Project
2. Click **"Storage"** (left menu)
3. Click **"images"** bucket (or create it if it doesn't exist)
4. Click **"Upload file"**
5. Select your image files
6. Click **"Upload"**

### Step 2: Note the Filename
- After uploading, you'll see the filename (e.g., `firestick-4k.jpg`)
- Copy or remember this exact filename

### Step 3: Link Image to Product in Admin Panel
1. Go to your admin panel → **"Real Product Manager"**
2. Click **"Edit"** on the product
3. In **"Main Image"** field, paste the **exact filename** from Step 2
   - Example: `firestick-4k.jpg`
   - Example: `iptv-subscription.jpg`
4. Click **"Save Product"**
5. The image will appear in the preview below

---

## 📋 QUICK CHECKLIST:

- [ ] Images uploaded to Supabase Storage bucket "images"
- [ ] Product edited in Real Product Manager
- [ ] Main Image field has the filename (e.g., `firestick-4k.jpg`)
- [ ] Product saved successfully
- [ ] Image preview shows correctly

---

## ❓ WHICH METHOD TO USE?

**Use Method 1 if:**
- You want to upload directly from the admin panel
- You have images on your computer ready to upload
- You want the easiest workflow

**Use Method 2 if:**
- You already have images uploaded to Supabase
- You want to use existing images
- You prefer using Supabase dashboard directly

---

## 🔍 WHERE TO FIND THESE TOOLS IN ADMIN PANEL:

1. **Simple Image Manager:**
   - Admin Panel → Media & Images → Simple Image Manager

2. **Enhanced Media Library:**
   - Admin Panel → Media & Images → Enhanced Media Library

3. **Real Product Manager:**
   - Admin Panel → Product Management → Real Product Manager

---

## 💡 TIPS:

- ✅ Image filenames should be simple (no spaces, use dashes): `firestick-4k.jpg` ✅
- ❌ Avoid complex filenames: `My Fire Stick 4K Max Image (Final).jpg` ❌
- ✅ Supported formats: JPG, PNG, WEBP, GIF
- ✅ Recommended size: Under 2MB per image
- ✅ Recommended dimensions: 800x600px or larger

---

## 🎉 DONE!

After uploading and linking images:
1. Go to your shop page (`/shop`)
2. Your products should now show images
3. If images don't appear, check:
   - Filename is exactly correct (case-sensitive)
   - Image is in the "images" bucket
   - Product is saved with the filename

**That's it! Your product images are now live! 🚀**

