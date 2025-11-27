# Cloudflare Deployment Steps

## Immediate Actions Required

Your website code is now fixed and pushed to `clean-main` branch. Follow these steps to complete deployment:

---

## Step 1: Upload Images to Supabase Storage

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/bdqhmhfynlntisiqsdbj/storage/buckets

2. Select or create the `images` bucket

3. Make sure bucket is **PUBLIC** (click bucket → Settings → Make Public)

4. Upload these images:
   - `firestick-hd.jpg`
   - `firestick-4k.jpg`
   - `firestick-4k-max.jpg`
   - `iptv-subscription.jpg`
   - `hero-firestick-breakout.jpg`

5. Verify images are accessible at:
   ```
   https://bdqhmhfynlntisiqsdbj.supabase.co/storage/v1/object/public/images/firestick-hd.jpg
   ```

---

## Step 2: Configure Cloudflare Pages Environment Variables

1. Go to your Cloudflare Dashboard
2. Navigate to: **Pages** → **Your Project** → **Settings** → **Environment Variables**
3. Add these variables for **Production**:

```
VITE_SUPABASE_URL=https://bdqhmhfynlntisiqsdbj.supabase.co
VITE_SUPABASE_ANON_KEY=4J24aIx6QNiZoz6ImNSmLFUfy0stDB4a7fEjuFAM
VITE_STORAGE_BUCKET_NAME=images
VITE_ADMIN_DEFAULT_USER=admin
VITE_ADMIN_DEFAULT_PASSWORD=admin123
```

4. **IMPORTANT:** Click "Save" after adding each variable

---

## Step 3: (Optional) Configure Square Checkout

Only if you want to use Square for payments:

1. Get your Square credentials from: https://developer.squareup.com/apps
2. Add these environment variables in Cloudflare:

```
VITE_SQUARE_APP_ID=your_square_app_id_here
VITE_SQUARE_LOCATION_ID=your_square_location_id_here
VITE_SECURE_HOSTS=secure.streamstickpro.com
```

3. Configure secure checkout subdomain:
   - In Cloudflare DNS, add CNAME for `secure.streamstickpro.com`
   - Point it to your Cloudflare Pages domain
   - Enable SSL/TLS

---

## Step 4: Redeploy Site

After adding environment variables:

### Option A: Automatic (Recommended)
- Cloudflare should automatically detect the new commit on `clean-main`
- Check: **Pages** → **Your Project** → **Deployments**
- Wait for build to complete (~2-3 minutes)

### Option B: Manual
1. Go to **Pages** → **Your Project** → **Deployments**
2. Click **"Retry deployment"** or **"Create deployment"**
3. Select branch: `clean-main`
4. Click **"Deploy"**

---

## Step 5: Verify Deployment

After deployment completes:

### Test Website:
1. Visit your production URL
2. Check that homepage loads correctly
3. Verify hero image appears
4. Go to `/shop` - verify all 7 products show with images

### Test Admin Panel:
1. Go to `/custom-admin`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Verify dashboard loads

### Test Database:
1. Add an item to cart on `/shop`
2. Proceed to checkout
3. Verify data saves to Supabase

---

## Step 6: Update Admin Password (CRITICAL)

For security, change the default admin password:

1. Log into Supabase Dashboard
2. Go to: **SQL Editor**
3. Run this query:
   ```sql
   UPDATE admin_credentials
   SET password_hash = 'YOUR_NEW_HASHED_PASSWORD'
   WHERE username = 'admin';
   ```

4. Update Cloudflare environment variable:
   ```
   VITE_ADMIN_DEFAULT_PASSWORD=your_new_password
   ```

5. Redeploy

---

## Troubleshooting

### Images Not Loading
- Check images uploaded to Supabase Storage
- Verify bucket is PUBLIC
- Check bucket name matches `VITE_STORAGE_BUCKET_NAME`
- Clear Cloudflare cache: **Caching** → **Configuration** → **Purge Everything**

### Admin Panel Won't Login
- Verify environment variables saved in Cloudflare
- Check browser console for errors
- Clear browser localStorage and try again

### Products Not Showing
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured
- Check Supabase connection in browser console
- Run SQL query in Supabase to verify 7 products exist

### Site Not Deploying
- Check deployment logs in Cloudflare Pages
- Verify `clean-main` branch has latest code
- Check build command is `npm run build`
- Check output directory is `dist`

---

## Build Configuration

Verify these settings in Cloudflare Pages:

- **Framework preset:** React/Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty)
- **Node version:** 18 or higher

---

## Support Resources

- **Audit Report:** See `AUDIT_REPORT_NOV_27_2025.md` in repository
- **Supabase Dashboard:** https://supabase.com/dashboard/project/bdqhmhfynlntisiqsdbj
- **Cloudflare Dashboard:** https://dash.cloudflare.com

---

**Last Updated:** November 27, 2025
**Status:** Ready for Deployment
**Branch:** clean-main
