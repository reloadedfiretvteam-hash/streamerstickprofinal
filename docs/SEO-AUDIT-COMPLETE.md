# Complete SEO Audit – Duplicates, Dead Ends, Blog Back-Links

Single reference for: no duplicate titles/meta, no dead ends, and every path linking back to the main site.

---

## 1. Title and meta description (no duplicates)

Every page has a **unique** `document.title` and a unique or appropriate meta description. No two indexable pages share the same title.

| Page / route | Title (unique) | Meta description |
|--------------|----------------|-------------------|
| `/` (index.html) | StreamStickPro IPTV + Jailbroken Fire Sticks + Onn Google TV - 36hr Trial | 36 HOUR FREE TRIAL – 28K channels… |
| MainStore (/) | Best IPTV Firestick Service 2026 \| 18K+ Channels \| StreamStickPro | Best IPTV and live IPTV service… |
| /jailbroken-fire-sticks | Jailbroken Fire Sticks & Pre-Loaded Devices 2026 \| StreamStickPro | Jailbroken Fire Sticks and pre-configured… |
| /iptv-services | Best IPTV Service 2026 \| Live TV Streaming Guide \| StreamStickPro | Best IPTV service 2026: live IPTV… |
| /iptv-firestick | Best IPTV for Firestick 2026 \| Setup & Apps \| StreamStickPro | Best IPTV for Fire Stick 2026… |
| /iptv-media-players | Best IPTV Media Players & Apps 2026 \| TiviMate, Smarters \| StreamStickPro | Best IPTV media players… |
| /best-iptv-firestick | Best IPTV Firestick 2026 \| Service & Device Comparison \| StreamStickPro | Best IPTV Firestick 2026… |
| /firestick-devices | Fire Stick & Android Streaming Devices 2026 \| StreamStickPro | Best streaming devices 2026… |
| /onn-google-tv | Onn Google TV IPTV Setup 2026 \| StreamStickPro | Set up IPTV on Onn Google TV… |
| /iptv-smarters-pro | IPTV Smarters Pro Setup and Guide 2026 \| StreamStickPro | Use IPTV Smarters Pro with StreamStickPro… |
| /tivimate | TiviMate IPTV Setup 2026 \| Premium App Guide \| StreamStickPro | Use TiviMate with StreamStickPro… |
| /36hr-trial | 36 Hour FREE IPTV Trial \| Instant M3U \| StreamStickPro | Start your 36-hour free IPTV trial… |
| /pricing | IPTV Pricing 2026 \| StreamStickPro | StreamStickPro IPTV pricing from $15/mo… |
| /shop | Shop - StreamStickPro \| Premium Streaming Devices & Live TV Plans | Shop StreamStickPro… |
| /ultimate-iptv-catalog-2026 | 18K Live TV + 60K Movies… \| Ultimate IPTV Catalog 2026 \| StreamStickPro | Ultimate IPTV catalog 2026… |
| /vs-:slug | StreamStickPro vs {name} 2026 - Why We WIN \| StreamStickPro | {name} alternative… |
| /blog | StreamStickPro - Get Fully Loaded Streaming in 10 Minutes (default) | (from index or set by Blog) |
| /blog/:slug | {Post title} \| StreamStickPro Posts | (from post or default) |
| /l/:country/:pageType/:slug | {page.title} \| StreamStickPro (dynamic) | page.meta_description (155 chars) |
| /resources | IPTV & Fire Stick Resources \| 18K+ Channel Directory… \| StreamStickPro | Complete 18,000+ IPTV channel directory… |
| /checkout | Checkout \| StreamStickPro | Secure checkout… (noindex) |
| /customer-login | Customer Login \| StreamStickPro | (noindex) |
| /success | Order Confirmed \| StreamStickPro | (noindex) |
| /forgot-password | Forgot Password \| StreamStickPro | (noindex) |
| /reset-password | Reset Password \| StreamStickPro | (noindex) |
| /customer-portal | My Account \| StreamStickPro | (noindex) |
| /not-found (404) | Page Not Found \| StreamStickPro | Page not found… (noindex) |
| Terms / Privacy / Refund | Terms of Service \| … etc. | Unique per page |

**Duplicate check:** No two indexable pages share the same title. Location pages get unique titles from DB/seed (e.g. `Houston IPTV + Jailbroken Fire Stick Guide 2026 | StreamStickPro`). Blog posts use post title. **No duplicate title issues.**

---

## 2. Dead ends removed

- **Blog article view:**  
  - Nav: “Back to Blog”, “Home”, “Shop”, “Free Trial” (links in header).  
  - Above CTA: text links “← Back to Blog · Home · Shop · Free Trial”.  
  - CTA buttons: View All Products, Start Free Trial, Go to Homepage.  
  → No dead end; readers can always get back to site and key pages.

- **Blog listing (/blog):**  
  - Bottom CTA: View All Products, Start Free Trial, Go to Homepage.  
  → Links back to main site.

- **404 (not-found):**  
  - Text links: Home, Shop, Blog.  
  - Button: Back to Home.  
  → No dead end.

- **Pillar / money pages:** Use `PillarLayout` with site nav: Home, IPTV, Firestick, Devices, Jailbroken, Blog, Shop.  
  → No dead end.

- **Location pages:** Use `PillarLayout` (same nav).  
  → No dead end.

- **Checkout / login / portal / success:** Purpose-specific; no need for full site nav; can add “Back to Home” or “Shop” in footer if desired (optional).

---

## 3. Blog → site linking (article readers can link back)

- **In-article:**  
  - Sticky nav with **Back to Blog**, **Home**, **Shop**, **Free Trial** (real `<a href="...">` so crawlers and users can follow).
- **After content, before CTA:**  
  - **← Back to Blog · Home · Shop · Free Trial** (again as `<a href="...">`).
- **CTA block:**  
  - View All Products → /shop, Start Free Trial → /?section=free-trial, Go to Homepage → /.
- **Related products:**  
  - Link to /shop (and product context).
- So: **every article has multiple ways to go back to blog, home, shop, and free trial** – no dead ends and strong internal linking.

---

## 4. H1 and structure

- **One H1 per page:** Homepage, pillar pages, location pages, blog listing, and blog post each have a single H1 (title of page or post).  
- **No duplicate H1s** across pages; location H1s are dynamic (e.g. “[Location] IPTV + Jailbroken Fire Stick Guide 2026”).

---

## 5. Sitemaps and indexing

- **Sitemap index:** `/sitemap-index.xml` → sitemap-pages, sitemap-posts, sitemap.xml.
- **sitemap-pages.xml:** Static + ~24K location URLs (from DB or `location-pages.json`).
- **sitemap-posts.xml:** Blog posts only.
- **sitemap.xml:** Full set (static + blog + location).
- **robots:** index,follow for indexable pages; noindex for checkout, login, portal, 404 as set in each page’s useEffect.

---

## 6. Images and architecture

- **Config:** `client/src/data/seo-images.ts` – groups and rotation; supports both `/images/` (public) and Supabase.
- **Build:** `client/public/images/` is copied into build output; no extra step if using public folder.
- **Supabase (optional):** See **docs/SEO-IMAGES-SUPABASE-AND-DEPLOY.md** for bucket/folder and BASE URL.
- **No extra API** needed for serving images; optional per-page og:image can be set in useEffect for money pages when you have a dedicated image URL.

---

## 7. Summary

- **Duplicates:** None; all indexable pages have unique titles and appropriate meta.
- **Dead ends:** Removed; blog article, blog listing, and 404 all link back to Home, Shop, Blog, and/or Free Trial.
- **Blog → site:** Every article has nav + text links + CTA so readers can link back to the main site and key pages.
- **Images:** Covered in **SEO-IMAGES-SUPABASE-AND-DEPLOY.md** and **SEO-IMAGES-WHERE-TO-ADD-MORE.md**; build and deploy are aligned with the rest of the SEO architecture.
