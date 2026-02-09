# Cloudflare SEO / Nuclear Settings (StreamStickPro)

Use these in the **Cloudflare Dashboard** for streamstickpro.com to align with the nuclear SEO/AEO prompt. GitHub Actions already handles deploy, cache purge, and sitemap ping; these are **domain-level settings**.

## SSL/TLS

- **SSL/TLS encryption mode:** Full (strict)
- **Always Use HTTPS:** On
- **HSTS:** Enable, max-age=31536000, includeSubDomains, preload

## Caching

- **Caching level:** Standard or Cache Everything for static assets
- **Browser Cache TTL:** Respect Existing Headers (or 4 hours for HTML)
- **Tiered Cache:** On (if available on your plan)
- **Polish:** On for images (lossless or lossy) to improve LCP
- **Brotli:** On
- **Auto Minify:** HTML, CSS, JavaScript

## Page Rules (examples)

Add rules in **Rules → Page Rules** (or **Rules → Transform Rules** where applicable):

1. **Cache hub and catalog**
   - URL: `*streamstickpro.com/ultimate-iptv-catalog-2026*`
   - Setting: Cache Level = Cache Everything, Edge TTL = 24 hours

2. **Cache ONN/catalog paths**
   - URL: `*streamstickpro.com/onn-*`
   - Setting: Cache Level = Cache Everything, Edge TTL = 12 hours

3. **Always HTTPS**
   - URL: `*streamstickpro.com/*`
   - Setting: Always Use HTTPS = On

4. **Rocket Loader** (optional; can conflict with some React hydration)
   - Use only if you’ve tested; otherwise leave Off for SPAs.

## Bot / Crawlers

- **Bot Fight Mode:** On (or use Super Bot Fight Mode on paid plans)
- **Allowlist:** Ensure Googlebot, Bingbot, YandexBot are not challenged (Cloudflare usually allows verified bots by default)
- **Crawler Hints:** Enable if available (sends freshness hints for crawlers)

## Workers / Pages (already in use)

- **Deploy:** GitHub Actions deploys to Cloudflare Pages (`streamerstickpro-live`, branch `clean-main`) using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- **Cache purge:** Workflow purges zone cache when `CLOUDFLARE_ZONE_ID` is set so sitemap and location pages stay fresh.

## Sitemap and indexability

- **robots.txt:** Sitemap URL is `https://streamstickpro.com/sitemap.xml` (and sitemap-index.xml).
- **Ping:** Workflow pings Google, Bing, and Yandex after each deploy; IndexNow script runs for Bing/Yandex/Seznam.

## Core Web Vitals

- Use **Speed → Optimization** (Polish, Brotli, Minify) as above.
- **Early Hints:** Enable if available.
- **HTTP/2 + HTTP/3 (QUIC):** On by default on Cloudflare.

## Summary checklist

- [ ] SSL/TLS: Full (strict) + HSTS max-age=31536000
- [ ] Caching: Tiered + Polish (images) + Brotli + Auto Minify
- [ ] Page rule: /ultimate-iptv-catalog-2026 Cache Everything, 24h
- [ ] Page rule: /onn-* Cache Everything, 12h
- [ ] Always HTTPS
- [ ] Bot Fight Mode On; allow Googlebot/Bingbot/YandexBot
- [ ] Crawler Hints On if available
- [ ] GitHub Secrets set: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID (for purge)
