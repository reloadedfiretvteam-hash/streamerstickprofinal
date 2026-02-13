# SEO Meta Best Practice – Titles & Descriptions

Use this so every page meets **best practice for snippets and impressions** on Google, Bing, and Yahoo.

---

## Character limits (strict)

| Element | Target | Max | Why |
|--------|--------|-----|-----|
| **Title** | 50–60 chars | 60 | Google truncates after ~60; Bing similar. Primary keyword in first 5–7 words. |
| **Meta description** | 140–160 chars | 160 | Snippets use this; too short = weak CTR; too long = truncated. |
| **og:title** | Same as title | 60 | Social + some engines use for snippet. |
| **og:description** | Same as meta description | 160 | Social preview; keep 140–160. |

---

## Template rules

1. **Title:** `[Primary keyword] [year/modifier] | [Benefit or differentiator] | StreamStick Pro`  
   Example: `IPTV Fire Stick 2026 | 18K+ Channels, No Buffer | StreamStick Pro` (52 chars).

2. **Meta description:**  
   - Include primary keyword in first 25 words.  
   - One clear benefit (e.g. 18K+ channels, 36hr trial).  
   - One CTA (e.g. “Start today”, “Free trial”, “Shop now”).  
   - 140–160 chars total.

3. **Device pages:** Lead with “IPTV Fire Stick” or “IPTV [Device]”.  
4. **Service/plans:** Lead with “IPTV Subscription Plans” or “IPTV Plans”; include price if possible (“from $15/mo”).  
5. **Blog/how-to:** “How to [action] [year] ([time]) | StreamStick Pro”.

---

## Per-page audit (quick check)

- **Home:** Title 50–60 ✓. Description 140–160 ✓.  
- **/shop, /iptv-services, /jailbroken-fire-sticks, /pricing, /iptv-firestick:** Set in page `useEffect`; keep titles 50–60 and descriptions 140–160.  
- **Blog posts:** Use `BlogPostSchema` + dynamic title/description; keep within limits.  
- **Location pages (/l/...):** Meta from DB or static; ensure title ≤60, description 140–160.

---

## Snippets & impressions

- **FAQ schema:** On pillar pages (SEOSchema + faq). Helps FAQ rich results.  
- **Product schema:** On shop/product pages. Helps product snippets.  
- **BreadcrumbList:** On all pillars. Helps breadcrumb snippet.  
- **Article schema:** On blog posts (BlogPostSchema). Helps article snippet.  
- **Canonical + og:url:** Every page. Avoid duplicate snippet issues.  
- **IndexNow + sitemap ping:** Every deploy. Pushes URLs to Bing/Yandex/Seznam and notifies Google via sitemap.

Fixing titles and descriptions to 50–60 and 140–160 across the site, plus schema and IndexNow, maximizes snippets and impressions on Google, Bing, and Yahoo.
