# ✅ Images Already Uploaded - Bucket Configuration

## You Have Images in Supabase! 🎉

Since you've already uploaded your images to a Supabase bucket, you just need to tell the application which bucket to use.

---

## Quick Setup (2 Minutes)

### Step 1: Find Your Bucket Name

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left menu
4. Look at your bucket names - common ones are:
   - `images` (canonical/recommended)
   - `imiges` (typo version - automatically normalized to 'images')
   - `product-images`
   - Or any custom name you created

### Step 2: Configure the Application

**Option A: Using Environment Variable (Recommended)**

Add this to your `.env` file or Cloudflare environment variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STORAGE_BUCKET_NAME=images
```

**Recommended: Use `images` as your canonical bucket name.**

**Option B: If Using Cloudflare Pages**

1. Go to Cloudflare Pages Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - `VITE_STORAGE_BUCKET_NAME` = `images` (recommended)

---

## Bucket Name Normalization

The application automatically normalizes common bucket name typos:

| Input Bucket Name | Normalized To |
|-------------------|---------------|
| `imiges`          | `images`      |
| `imagees`         | `images`      |
| `imags`           | `images`      |
| `image`           | `images`      |

This means if you have a bucket named `imiges`, you can leave it as-is in your Supabase dashboard - the application will automatically map it to `images`.

**Recommendation:** Create your bucket with the canonical name `images` to avoid confusion.

---

## How It Works

The code now automatically uses whatever bucket you specify:

```typescript
// The system will use VITE_STORAGE_BUCKET_NAME if set
// Otherwise defaults to 'images'
const imageUrl = getStorageUrl('images', 'firestick-4k.jpg');
// Results in: https://your-project.supabase.co/storage/v1/object/public/YOUR_BUCKET/firestick-4k.jpg
```

---

## Common Bucket Names & What to Use

### If your bucket is named `imiges` (old typo):
```env
VITE_STORAGE_BUCKET_NAME=imiges
```
The app will automatically normalize this to `images`.

### If your bucket is named `images` (recommended):
```env
VITE_STORAGE_BUCKET_NAME=images
```
Or just leave it unset (images is the default)

### If your bucket is named `product-images`:
```env
VITE_STORAGE_BUCKET_NAME=product-images
```

---

## Verify Your Images

Check that your images are accessible at:
```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/YOUR_BUCKET_NAME/test-image.jpg
```

Replace:
- `YOUR_PROJECT_ID` with your actual project ID
- `YOUR_BUCKET_NAME` with your bucket name
- `test-image.jpg` with an actual image filename you uploaded

---

## Quick Diagnostic with curl

Use this curl command to check if an image is accessible and has valid content:

```bash
# Check image accessibility and content-length
curl -I "https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/images/firestick%204k.jpg"

# Expected output for a valid image:
# HTTP/2 200
# content-length: 123456  (should be > 1000 bytes)
# content-type: image/jpeg
```

If you get a 404 or content-length < 1000, the image may be missing or corrupt.

---

## Required Images

Make sure these files exist in your bucket:

### Fire Stick Products:
- `firestick hd.jpg`
- `firestick 4k.jpg`
- `firestick 4k max.jpg`

### IPTV:
- `iptv-subscription.jpg`

### Hero Section:
- `hero-firestick-breakout.jpg`

### Media Carousel (9 images):
- `Playback-Tile-1024x512.webp`
- `Movies-categories_11zon-1024x512.webp`
- `IPTVSmarters TV IMAG.jpg`
- `iptv3.jpg`
- `OIP (11) websit pic.jpg`
- `c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg`
- `BASEBALL.webp`
- `downloadBASKET BALL.jpg`
- `UFC.jpg`

**Note**: Filenames are case-sensitive! Make sure they match exactly.

---

## After Configuration

1. **Build** (if testing locally):
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare**:
   - Merge your PR (auto-deploys)
   - Or push to main branch
   - Cloudflare will rebuild with new environment variables

3. **Verify**:
   - Visit your site
   - Check browser console (F12) for any 404 errors
   - Images should now load from your bucket

---

## Troubleshooting Checklist

### Images Still Not Loading?

- [ ] **Check bucket is public**: In Supabase Storage, click your bucket and verify "Public bucket" is enabled
- [ ] **Check file exists**: Visit the direct URL in your browser
- [ ] **Check filename matches exactly**: Filenames are case-sensitive (`Firestick-4k.jpg` ≠ `firestick 4k.jpg`)
- [ ] **Check environment variable is set**: In Cloudflare: Settings → Environment Variables
- [ ] **Redeploy after adding variables**: Changes require a new build
- [ ] **Check content-length**: Use curl HEAD to verify image size is > 1000 bytes
- [ ] **Check browser console**: Look for 404 errors or CORS issues

### Making Bucket Public

If your bucket is not public, run this SQL in Supabase:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'YOUR_BUCKET_NAME';
```

---

## Example: Complete Setup

```env
# .env or Cloudflare Environment Variables

VITE_SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STORAGE_BUCKET_NAME=images
```

After setting this:
- All images will load from the `images` bucket
- No code changes needed
- Just redeploy

---

## Success! ✅

Your images are already uploaded. Just configure the bucket name and deploy!

**Questions?** Check:
- Browser console (F12) for error messages
- Supabase Storage dashboard to confirm files exist
- Network tab to see actual URLs being requested
