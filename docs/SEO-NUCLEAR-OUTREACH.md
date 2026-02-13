# SEO Nuclear Outreach Checklist

Maximize indexing and snippets across Google, Bing, Yahoo, and Yandex.

## 1. IndexNow (Bing, Yandex, Seznam)

- **What:** After every deploy, the workflow runs `scripts/indexnow-from-live-sitemap.ts`, which:
  - Fetches the **live** `https://streamstickpro.com/sitemap.xml`
  - Submits all URLs in batches of 10,000 to `https://api.indexnow.org/IndexNow`
- **Key file:** Must be live at `https://streamstickpro.com/59748a36d4494392a7d863abcf2d3b52.txt` (file: `client/public/59748a36d4494392a7d863abcf2d3b52.txt`, content: the key string only).
- **No extra action:** Deploy from `clean-main` runs this automatically.

## 2. Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add your site: `https://streamstickpro.com`.
3. **Verify ownership:** Use the meta tag method. The site already has `msvalidate.01` in `client/index.html`; copy the value from Bing and ensure it matches in the HTML.
4. **Submit sitemap:** In Bing Webmaster, add sitemap URL:  
   `https://streamstickpro.com/sitemap-index.xml`  
   (or `https://streamstickpro.com/sitemap.xml` if you prefer the single full sitemap).
5. **Yahoo:** Yahoo Search is powered by Bing. Submitting and verifying in Bing Webmaster covers Yahoo; no separate Yahoo Webmaster step needed.

## 3. Google Search Console

- Add property for `https://streamstickpro.com` (and optionally `https://www.streamstickpro.com` if you use www).
- Submit sitemap: `https://streamstickpro.com/sitemap-index.xml`.
- Deploy workflow already pings: `https://www.google.com/ping?sitemap=...`.

## 4. Meta Best Practice (Titles & Descriptions)

- **Title:** 50–60 characters (truncation in SERPs ~60).
- **Meta description:** 140–160 characters (sweet spot for snippets).
- Audit pages and trim/rewrite so every key page fits these ranges.

## 5. Schema for Rich Snippets

- **FAQPage:** Used on FAQ-heavy pages (via `SEOSchema`).
- **Product:** Used on Shop/MainStore (via `SEOSchema`).
- **BreadcrumbList:** Used where breadcrumbs are passed to `SEOSchema`.
- **Organization / WebSite:** In `client/index.html` or global schema.
- Consider adding **HowTo** on setup/guide pages (e.g. TiviMate, IPTV Smarters Pro) for step-by-step snippets.

## 6. Sitemap Pings (Already in Deploy)

The deploy workflow pings:

- Google: `sitemap-index.xml`
- Bing: `sitemap-index.xml` (Yahoo covered via Bing)
- Yandex: `sitemap-index.xml`

No extra manual pings needed after deploy.

---

**See also:** `docs/SEO-MASTER-AUDIT-AND-NICHE-FLOOD.md` (niche matrix, meta at scale, AEO, redirects, backlinks), `docs/ARCHITECTURE-AND-SECRETS.md` (where to set GitHub/Cloudflare/Supabase secrets—no keys in repo).

**Summary:** Push to `clean-main` → workflow runs migrations, build, deploy, sitemap pings, and IndexNow. Then ensure Bing Webmaster (and GSC) have the sitemap submitted and ownership verified.
