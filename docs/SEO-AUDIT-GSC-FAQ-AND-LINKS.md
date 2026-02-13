# SEO Audit: GSC FAQ/Q&A Fixes, Links, and Verification

This doc covers what was audited and fixed so Google Search Console (GSC) does not show errors for Q&A/FAQ, and so URLs, pages, internal links, and directs are in place.

---

## 1. FAQ / Q&A (GSC errors: "Location", "N/A", empty answer)

**Problem:** Google can show errors when FAQ schema has empty answers, "N/A", "Location", or very short placeholder text.

**Fixes applied:**

| Where | Change |
|-------|--------|
| **Worker** (`worker/index.ts`) | Added `sanitizeFaq()`: filters out any item where question or answer is empty, "N/A", "Location", "[LOCATION]", TBD, or answer length &lt; 25. All location-page FAQ (from DB or default 5 Q&As) is sanitized before output. Default FAQs are full factual answers. |
| **Client LocationPage** (`client/src/pages/LocationPage.tsx`) | FAQ from `page.faq_json` is filtered: only items with both question and answer trimmed, answer length ≥ 25, and answer not in blocklist (n/a, location, tbd, etc.). Only valid items are passed to `SEOSchema`. |
| **SEOSchema** (`client/src/components/SEOSchema.tsx`) | Before emitting FAQPage JSON-LD, filters `faqMemo` to valid items only (non-empty question/answer, answer ≥ 25 chars, not in blocklist). If none valid, no FAQ script is output. |

**Result:** Every FAQPage schema (homepage `index.html`, worker crawler HTML, client location pages) has only real questions and substantive answers. No "Location" or "N/A" as answers.

---

## 2. Internal links / directs / URLs

| Item | Where |
|------|--------|
| **Worker location pages (crawler HTML)** | "Related" section now includes: Home & 36hr Free Trial, Start 36-Hour Free Trial, Jailbroken Fire Sticks, IPTV Services, ONN Google TV Setup, Pricing, Shop, Explore 93K IPTV Catalog. All absolute URLs to streamstickpro.com. |
| **Sitemaps** | `/sitemap-index.xml` (index), `/sitemap-pages.xml` (static + ~24K location URLs), `/sitemap-posts.xml` (blog), `/sitemap.xml` (full). Submitted to Google/Bing/Yandex on deploy. |
| **Canonicals** | Homepage: `index.html` has canonical. Worker location HTML: `<link rel="canonical" href="https://streamstickpro.com/l/...">`. Client pages use `CanonicalTag` / PillarLayout. |
| **Money pages** | /, /36hr-trial, /jailbroken-fire-sticks, /pricing, /onn-google-tv, /iptv-smarters-pro, /tivimate, /shop, /ultimate-iptv-catalog-2026, /vs-* (crush). All in static sitemap and linked from homepage/worker. |

---

## 3. Facts and content

- Homepage and worker location HTML: concrete numbers (18,000+ channels, 100,000+ movies, 36hr trial, 28K channels, 247K users, 99.9% uptime).
- FAQ answers are full sentences (no one-word or placeholder answers).
- Seed script `faq_json` for 25K pages uses three consistent Q&As with full answers (IPTV, serve area, free trial).

---

## 4. What to check in Google Search Console

After deploy:

1. **Enhancements → FAQ** (or Q&A): Confirm no "Invalid" or "Missing answer" type errors. Re-validate if you had errors before.
2. **Pages**: Ensure indexed count grows for `/l/` URLs and key money pages.
3. **Sitemaps**: Submit `https://streamstickpro.com/sitemap-index.xml` if not already; check for errors.
4. **URL Inspection**: Test a few `/l/usa/iptv/...` URLs; confirm "URL is on Google" and that the rendered page shows full HTML with FAQ and related links.

---

## 5. Post-deploy verification (curl)

- **Sitemap:** `curl -sI https://streamstickpro.com/sitemap-pages.xml` → 200.
- **Location page (crawler):** `curl -A "Googlebot" https://streamstickpro.com/l/usa/iptv/houston` → HTML contains "FAQPage", "acceptedAnswer", "What StreamStickPro Builds", "Related", and links to /36hr-trial, /pricing, /ultimate-iptv-catalog-2026.
- **Homepage:** `curl -s https://streamstickpro.com/` → contains "36 HOUR FREE TRIAL" and FAQ schema.

All of the above is in place so GSC stays clear of FAQ errors and your pages, directs, and backlinks (internal) are in the right place.
