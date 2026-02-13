# SEO Images: Supabase Storage, Build, and Deploy

So the 12 SEO images work everywhere (site, sitemaps, social), with no gaps.

---

## 1. Where images are used

- **Money pages:** Jailbroken Fire Sticks, IPTV Services, Onn Google TV, IPTV Smarters Pro, TiviMate (via `client/src/data/seo-images.ts`). Images rotate by section so the same image isn’t repeated.
- **Homepage / device section:** Can use `HERO_AND_DEVICE_IMAGES` (see `seo-images.ts`).
- **Location pages:** One image per type (iptv / jailbreak / google) via `LOCATION_PAGE_IMAGES`.
- **Build:** Vite copies `client/public/` into the build output (`dist/public/`). So anything in `client/public/images/` is deployed as `/images/xxx`.

---

## 2. Option A – Use public folder (no Supabase)

1. Copy your 12 image files into **`client/public/images/`** with the exact names in **`client/public/images/README.md`** (e.g. `jailbroken-fire-stick-chain.png`, `best-usa-iptv-services.png`).
2. Build and deploy. They are served as `https://streamstickpro.com/images/xxx`.
3. No API or Supabase needed; the app already points to `/images/...` in `seo-images.ts`.

---

## 3. Option B – Use Supabase storage (recommended for one source of truth)

1. **Bucket:** In Supabase Dashboard → Storage, use the existing **`imiges`** bucket (or create one and update the base URL below).
2. **Folder:** Create a folder (e.g. **`seo`**) so paths are `seo/jailbroken-fire-stick-chain.png`, etc.
3. **Upload** the 12 files with these object names (same as README):

   - `seo/jailbroken-fire-stick-chain.png`
   - `seo/firestick-apk-setup.png`
   - `seo/fire-tv-stick-original-budget.png`
   - `seo/fire-tv-stick-4k-jailbroken.png`
   - `seo/fire-tv-stick-4k-max-jailbroken.png`
   - `seo/jailbroken-fire-stick-freedom.png`
   - `seo/iptv-smarters-catalog.png`
   - `seo/best-usa-iptv-services.png`
   - `seo/iptv-smarters-vs-tivimate.png`
   - `seo/iptv-america-canada-uk.png`
   - `seo/onn-4k-google-tv-box.png`
   - `seo/onn-4k-ultra-hd-android-tv.png`

4. **Set bucket to public** (or use signed URLs; for SEO, public is simpler so crawlers can see images).
5. **Update `client/src/data/seo-images.ts`:**  
   Change `const BASE = "/images"` to your Supabase public URL, e.g.  
   `const BASE = "https://YOUR_PROJECT.supabase.co/storage/v1/object/public/imiges/seo"`  
   and then use `${BASE}/jailbroken-fire-stick-chain.png` etc. (no leading slash).
6. Rebuild and deploy. No extra API endpoints are required; images are loaded by the browser from Supabase.

---

## 4. API endpoints

- You do **not** need a custom API to serve these images. They are either:
  - Static files from your site (`/images/...`), or
  - Direct URLs from Supabase storage.
- Existing endpoints that matter for SEO/images:
  - **`/api/blog/posts`** – blog list (used for sitemap and meta).
  - **`/api/seo-page/:country/:pageType/:slug`** – location page data (worker).
  - **`/api/catalog-summary`** – catalog stats.
  - **`/api/products`** – products (for blog-related products).

---

## 5. Deploy checklist

- [ ] Either: 12 files in `client/public/images/` with names from README, **or** 12 files in Supabase `imiges/seo/` and `BASE` in `seo-images.ts` updated.
- [ ] Run build: `npm run build` (or your Cloudflare build). Confirm `dist/public/images/` exists if using public folder.
- [ ] After deploy, open a money page (e.g. `/jailbroken-fire-sticks`) and check that images load (no 404).
- [ ] Optionally set **per-page og:image** in each money page’s `useEffect` to a specific image URL (e.g. from Supabase) for better social sharing; otherwise the default from `index.html` is used.

---

## 6. No duplicates / no dead ends

- Image **rotation** is in code: `getImageForSlot(group, sectionIndex)` so each section gets a different image from the pool.
- Adding more images: put them in the same bucket/folder (or `public/images/`) and add entries to the right group in `seo-images.ts` (see **docs/SEO-IMAGES-WHERE-TO-ADD-MORE.md**).
