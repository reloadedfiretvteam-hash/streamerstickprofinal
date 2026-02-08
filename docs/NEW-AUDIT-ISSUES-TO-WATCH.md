# New Audit – Issues to Watch

This doc lists issues to check and fix when auditing the **live** StreamStickPro homepage (and related pages), based on a snapshot of the rendered HTML from streamstickpro.com.

---

## 1. Duplicate / conflicting schema in the page

**Issue:** The same schema types appear in both `<head>` (from `index.html`) and in the **body** (injected by MainStore/SEOSchema). For example: WebSite with SearchAction, ItemList (products), Organization.

**Why it matters:** Duplicate or slightly different copies can confuse crawlers.

**Fix:** Prefer a single source per type, or ensure body-injected schema is identical to head and remove one source.

---

## 2. Product / ItemList schema: "Real product mapped to …" in description

**Issue:** In JSON-LD, product `description` shows internal placeholders, e.g. "Real product mapped to SEO Monthly", "Real product mapped to Web Design Basic".

**Source:** Products table in Supabase and seed/scripts: `server/seed-products.ts`, `scripts/sync-products-to-supabase.mjs`, `scripts/supabase-schema-update.sql`, `scripts/supabase-complete-setup.sql`. MainStore uses `product.description` for schema.

**Fix:** (1) Update DB/seed so descriptions are user-facing copy. (2) **Done:** MainStore uses `getSchemaDescription(product)` for both inline productListData and for `ItemListSchema` items, so "Real product mapped to…" never appears in schema.

---

## 3. Hero stats: numbers shown vs. brand (18,000+ / 100,000+)

**Issue:** Live snapshot showed 1,899+ channels, 10,554+ movies, 105+ dollars saved. Brand uses 18,000+ and 100,000+.

**Source:** MainStore uses AnimatedCounter with end={18000}, end={100000}, end={1000}. Values 1,899 / 10,554 / 105 are consistent with animation mid-run when snapshot was taken.

**Check:** After full load, confirm hero shows 18,000+, 100,000+, and correct "Dollars Saved". Ensure no other component hardcodes wrong final values. If "Dollars Saved" is meant to be "$1,000+", consider copy or counter change so "105+" is not shown.

---

## 4. Charset and critical meta order in built output

**Issue:** `<meta charset="UTF-8">` should appear early in `<head>` (e.g. within first 1024 bytes).

**Check:** View **built** page source on live URL; confirm charset is among first few elements in head.

---

## 5. Multiple ItemList / product blocks

**Issue:** Several JSON-LD blocks for products/ItemList (head and body); some differ in length or fields.

**Check:** Prefer one canonical ItemList; ensure product list is consistent (same IDs, names, prices, URLs).

---

## 6. AggregateRating: ratingCount / reviewCount (250,000)

**Issue:** Static schema may use "ratingCount": "250000". If not backed by real reviews, can be seen as misleading.

**Check:** Use real data or lower/remove; keep site trustworthy.

---

## 7. FAQ / QAPage schema and visible FAQ content

**Issue:** Both FAQPage and QAPage schema exist. Visible FAQ should match schema.

**Check:** Every visible FAQ has matching schema entry; no duplicate/contradictory answers between FAQPage and QAPage.

---

## 8. OG/Twitter image and URLs

**Check:** og:image and twitter:image point to valid URL; image exists and looks correct when shared.

---

## 9. Placeholder images in How it works / Why StreamStickPro

**Issue:** Placeholder text like "Upload image: firestick-device-selection.jpg" in DOM.

**Check:** Replace with real images or remove until assets are ready.

---

## 10. Accessibility

**Check:** Nav scroll buttons have aria-label; cart/wishlist/contact icons have labels; form fields have associated labels (including sr-only).

---

## Quick checklist for re-audit

- [ ] Single WebSite / ItemList / Organization schema (or identical); no conflicts.
- [ ] No "Real product mapped to …" in product schema.
- [ ] Hero shows 18,000+, 100,000+, correct Dollars Saved after load.
- [ ] Charset in first 1024 bytes of built HTML.
- [ ] AggregateRating justified; FAQ schema matches visible FAQ; OG image valid; no image placeholders; key controls accessible.
