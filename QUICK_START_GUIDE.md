# Product Image Management - Quick Start Guide

## 🚀 Get Started in 3 Minutes

This guide will help you start using the new product image management system immediately.

---

## For Site Administrators

### Uploading Product Images

**Step 1: Access Admin Panel**
```
1. Navigate to: https://yoursite.com/admin
2. Login with your admin credentials
3. Click on "Products" in the sidebar
```

**Step 2: Add/Edit Product**
```
1. Click "Add Product" button (or edit existing product)
2. Fill in product details (name, price, etc.)
3. Scroll to "Product Image" section
```

**Step 3: Upload Images**
```
Option A: Drag & Drop
- Drag image file(s) from your computer
- Drop onto the upload zone
- Wait for upload to complete ✓

Option B: File Picker
- Click the upload zone
- Browse your computer
- Select image(s)
- Click "Open"
```

**Step 4: Manage Images**
```
Set Primary Image:
- Click the ⭐ star icon on the image you want as primary
- This becomes the main product image

Delete Image:
- Click the ❌ X button on unwanted images
- Confirm deletion

Save Product:
- Click "Create" or "Update" button
- Changes are live immediately! 🎉
```

---

## Image Display Priority

Your product images will display in this order:

```
1st Priority: Local File
   Location: /public/images/product-name.jpg
   ↓ (if not found)

2nd Priority: Supabase Storage
   Location: Uploaded via admin panel
   ↓ (if not found)

3rd Priority: Category Placeholder
   Location: /public/images/firestick-4k.jpg (for firestick)
   ↓ (if not found)

4th Priority: Generic Placeholder
   Location: /public/images/placeholder.svg
```

**Result: Your products ALWAYS have images! No broken images ever!** ✅

---

## Quick Tips

### ✅ DO
- Use descriptive filenames (`firestick-4k-max.jpg`)
- Keep images under 5MB for best performance
- Use JPG, PNG, or WEBP formats
- Upload multiple sizes if needed
- Set a primary image for each product

### ❌ DON'T
- Upload videos (only images supported)
- Use very large files (>10MB)
- Forget to set a primary image
- Delete images that are in use

---

## Troubleshooting

### "Upload Failed"
**Problem:** Image won't upload  
**Solution:** 
1. Check file is actually an image (JPG, PNG, WEBP, GIF)
2. Ensure file is under 5MB
3. Check your internet connection
4. Try again

### "Image Not Displaying"
**Problem:** Product shows placeholder instead of uploaded image  
**Solution:**
1. Refresh the page
2. Check if image was actually uploaded (view in admin)
3. Verify Supabase Storage is configured
4. Check browser console for errors

### "Can't Delete Image"
**Problem:** Delete button doesn't work  
**Solution:**
1. Make sure you're logged in as admin
2. Refresh the page and try again
3. Check if it's the last/primary image (upload new one first)

---

## Advanced: Manual Local Images

If you want images to load super fast, you can manually place them in your project:

**Location:** `/public/images/`

**Steps:**
1. Save image file to `/public/images/` folder
2. Name it descriptively: `firestick-4k.jpg`, `iptv-subscription.jpg`
3. Reference in product: `/images/firestick-4k.jpg`
4. Local images load faster than Supabase!

**Note:** This requires server/FTP access. Most users should use the admin panel upload.

---

## Image Best Practices

### Naming Convention
```
Good Examples:
- firestick-4k-max.jpg
- iptv-subscription-12-month.jpg
- fire-stick-hd.png

Bad Examples:
- IMG_1234.jpg
- photo.png
- untitled.jpg
```

### File Sizes
```
Recommended:
- Product listings: 200-500 KB
- Product details: 500KB - 2MB
- Thumbnails: 50-200 KB

Maximum:
- 5MB (Supabase free tier limit)
```

### Image Dimensions
```
Recommended:
- Product listings: 600x600 px
- Product details: 1200x1200 px
- Hero images: 1920x1080 px

Aspect Ratio:
- Square (1:1) works best
- 4:3 or 16:9 also work well
```

---

## Features at a Glance

| Feature | Available |
|---------|-----------|
| Drag & Drop Upload | ✅ Yes |
| Multi-file Upload | ✅ Yes |
| Progress Tracking | ✅ Yes |
| Gallery Preview | ✅ Yes |
| Primary Image | ✅ Yes |
| Delete Images | ✅ Yes |
| Instant Updates | ✅ Yes |
| Automatic Fallback | ✅ Yes |
| Mobile Friendly | ✅ Yes |
| Batch Processing | ✅ Yes |

---

## Need Help?

### Documentation
- **Full Guide:** See `README.md` - Section "Product Image Management System"
- **Architecture:** See `IMAGE_MANAGEMENT_ARCHITECTURE.md`
- **Complete Details:** See `IMPLEMENTATION_COMPLETE.md`

### Support
1. Check documentation first
2. Look at browser console for errors
3. Verify Supabase configuration in `.env`
4. Contact development team

---

## Examples

### Example 1: Fire Stick Product
```
Product: Fire Stick 4K Max
Image Upload:
1. Take photo of product
2. Save as: firestick-4k-max.jpg
3. Open admin panel
4. Edit "Fire Stick 4K Max" product
5. Drag firestick-4k-max.jpg to upload zone
6. Wait for upload ✓
7. Set as primary (⭐)
8. Save product
9. View on site - image displays!
```

### Example 2: IPTV Subscription
```
Product: 12 Month IPTV Subscription
Image Upload:
1. Design image in Photoshop/Canva
2. Export as: iptv-subscription-12m.jpg
3. Admin panel > Products > Edit "12 Month IPTV"
4. Click upload zone
5. Browse and select image
6. Upload completes
7. Set primary
8. Save
9. Done! ✓
```

### Example 3: Batch Upload Multiple Products
```
Scenario: Upload images for 5 products at once
1. Prepare all images:
   - firestick-hd.jpg
   - firestick-4k.jpg
   - firestick-4k-max.jpg
   - iptv-1m.jpg
   - iptv-3m.jpg
2. For each product:
   - Open in admin
   - Upload corresponding image
   - Set as primary
   - Save
3. All done in minutes!
```

---

## Common Workflows

### Workflow 1: New Product
```
1. Admin > Products > Add Product
2. Enter: Name, Price, Description, Category
3. Upload Image (drag or click)
4. Set as Primary
5. Save
6. Product appears on site with image ✓
```

### Workflow 2: Replace Product Image
```
1. Admin > Products > Edit Product
2. Product Image section
3. Upload new image
4. Click ⭐ on new image (make primary)
5. Click ❌ on old image (delete)
6. Save
7. New image displays instantly ✓
```

### Workflow 3: Add Multiple Images to Product
```
1. Admin > Products > Edit Product
2. Product Image section
3. Drag multiple images at once
4. Wait for all uploads
5. Click ⭐ on best image (primary)
6. Other images available in gallery
7. Save
8. Primary displays, others available ✓
```

---

## Summary

✅ **Drag & drop** or **click to upload**  
✅ **Multiple images** at once  
✅ **Instant updates** to your site  
✅ **No broken images** ever  
✅ **Easy management** in admin panel  

**You're ready to manage product images like a pro!** 🎉

---

**Questions?** Check the full documentation in `README.md`

**Last Updated:** December 5, 2025  
**Version:** 1.0.0
