# StreamStickPro SEO 30-Day Action Plan

Use this after deploying the new pillar pages and sitemap.

---

## Week 1: Indexing & Verification

| Day | Action |
|-----|--------|
| 1 | Deploy code (push to GitHub / Cloudflare Pages). Purge Cloudflare cache (Caching → Purge Everything). |
| 2 | **Google Search Console:** Add property if needed. Submit sitemap: `https://streamstickpro.com/sitemap.xml`. Use URL Inspection to request indexing for: `/`, `/iptv-services`, `/iptv-firestick`, `/jailbroken-fire-sticks`, `/firestick-devices`, `/best-iptv-firestick`. |
| 3 | **Bing Webmaster Tools:** Add site if needed. Submit same sitemap URL. Request indexing for the 5 pillar URLs. |
| 4 | **Yahoo:** Via Bing (Bing owns Yahoo search), submission to Bing covers Yahoo. No separate step required. |
| 5 | Check GSC/Bing for crawl errors and fix any 404s or blocked resources. Confirm pillar URLs are “Discovered” or “Indexed.” |
| 6 | Add GA4 and/or confirm tracking on pillar pages (events, page_view). |
| 7 | Quick content check: open each pillar on mobile; confirm titles, H1, and internal links render correctly. |

---

## Week 2: Off-Page & Links

| Day | Action |
|-----|--------|
| 8 | List 5–10 tech/streaming forums or communities (e.g. Reddit r/IPTV, cord-cutter forums). Plan helpful, non-spammy replies that can link to a relevant pillar or blog post when appropriate. |
| 9 | Draft 1 guest post pitch or HARO response (e.g. “expert on streaming devices / IPTV”) and send. |
| 10 | Share 2 pillar or blog URLs on social (TikTok, YouTube community, Twitter/X) with short captions. |
| 11 | If you have a YouTube channel: upload a short “Best IPTV for Firestick 2026” or setup video; embed it on `/iptv-firestick` or `/best-iptv-firestick` and add VideoObject schema. |
| 12 | Check backlink tools (Ahrefs, SEMrush, or free alternatives) for any new links; note referring domains. |
| 13 | Internal links: add 2–3 links from high-traffic blog posts to the new pillars (e.g. “best IPTV” posts → `/iptv-services`, “jailbreak” posts → `/jailbroken-fire-sticks`). |
| 14 | Review GSC Performance: note any early impressions/clicks for pillar or target keywords. |

---

## Week 3: Optimization & Speed

| Day | Action |
|-----|--------|
| 15 | Run Lighthouse (or PageSpeed Insights) on `/`, `/iptv-services`, `/iptv-firestick`. Fix any “Easy wins” (e.g. image size, unused JS). Target LCP under 2.5s (under 2s if possible for 2026). |
| 16 | Ensure all pillar and key blog images use lazy loading and reasonable dimensions. Compress any new images (WebP, 80–85 quality). |
| 17 | In GSC: check Core Web Vitals report; fix URLs in “Poor” or “Needs improvement.” |
| 18 | Add or refine one FAQ to a pillar page based on “People also ask” or GSC queries; keep FAQ schema in sync. |
| 19 | Bing Webmaster: check SEO reports and any recommendations; apply quick fixes. |
| 20 | Optional: A/B test one meta title/description on a pillar (e.g. `/best-iptv-firestick`) and note in a spreadsheet for later comparison. |
| 21 | Re-submit sitemap in GSC and Bing if you added or changed URLs. |

---

## Week 4: Measurement & Next Steps

| Day | Action |
|-----|--------|
| 22 | Export GSC data: Queries and Pages for last 28 days. Note top 20 queries and top 20 pages. |
| 23 | Export Bing Webmaster data (if available): queries and clicks. Compare with GSC. |
| 24 | List 5 new blog ideas that support pillars (e.g. “IPTV trial Fire Stick,” “TiviMate vs IPTV Smarters”). Plan to add internal links from these to pillars. |
| 25 | Set a monthly reminder: “First week of month: refresh pillar dates (e.g. 2026), re-submit sitemap, check Core Web Vitals.” |
| 26 | Optional: Set up rank tracking for 10–20 target keywords (e.g. “best IPTV for Firestick,” “jailbroken Fire Sticks”) via a rank tracker or manual checks. |
| 27 | Optional: IndexNow submit pillar URLs if you use IndexNow (e.g. via your existing integration) for faster Bing discovery. |
| 28 | Document “before” snapshot: GSC impressions/clicks, Bing data, top 5 ranking keywords (if any). Save for next month comparison. |
| 29 | Plan one seasonal or event-based piece (e.g. “Super Bowl IPTV,” “Black Friday IPTV deals”) and add to content calendar. |
| 30 | Review full 30-day plan: what drove the most impressions or clicks? Double down on that channel (content, links, or technical) for the next 30 days. |

---

## Cloudflare Checklist (when you deploy)

- [ ] **Caching:** Browser and Edge cache enabled; purge after deploy.
- [ ] **Polish (optional):** Image optimization on if you want automatic image compression.
- [ ] **HTTPS:** Always Use HTTPS on; no mixed content on pillar pages.
- [ ] **Redirects:** If you ever retire an old URL (e.g. `/guides`), add a 301 redirect in Cloudflare (Rules → Redirect Rules) or in your Worker to the new pillar (e.g. `/iptv-services`).

---

## Redirects (Cloudflare Worker or Rules)

If you add old URLs later, use **301** to the new pillar:

| Old URL (example) | New URL |
|-------------------|--------|
| /guides           | /iptv-services |
| /firestick        | /iptv-firestick |
| /jailbreak        | /jailbroken-fire-sticks |
| /devices          | /firestick-devices |

In Cloudflare: **Rules** → **Redirect Rules** → Create rule: If URL path equals `/guides`, then Dynamic redirect to `https://streamstickpro.com/iptv-services` with status 301.

---

## Quick Reference

- **Sitemap:** `https://streamstickpro.com/sitemap.xml`
- **Pillar URLs:** `/iptv-services`, `/iptv-firestick`, `/jailbroken-fire-sticks`, `/firestick-devices`, `/best-iptv-firestick`
- **Keyword list:** `seo/keywords-streamstickpro-100.csv`
- **Architecture:** `seo/docs/SEO_ARCHITECTURE.md`
- **Deploy script:** `scripts/deploy-seo.ps1`
