# Deliverable 5: Cloudflare Workers (5 Logical Modules)

The app uses **one** Cloudflare Worker that implements five logical “workers” in a single script. For very large scale you can split into separate workers and routes.

## 1. Redirect Master

- **Role:** 301 redirects from old URLs to pillar/money pages.
- **Source:** DB table `redirect_map` first, then static `SEO_REDIRECTS_STATIC`.
- **Code:** `worker/index.ts` — `app.get('*', ...)` checks path, returns `c.redirect('https://streamstickpro.com' + new_path, 301)`.
- **Examples:** `/firestick` → `/iptv-firestick`, `/iptv-free` → `/`, `/cheap-iptv` → `/shop`.

## 2. Sitemap Generator

- **Role:** Dynamic sitemap.xml and sitemap-index.xml.
- **Routes:** `GET /sitemap.xml`, `GET /sitemap-index.xml`.
- **Data:** Static pages + blog_posts + seo_architecture (up to 25K location URLs).
- **Headers:** `Content-Type: application/xml`, `Cache-Control: public, max-age=3600`.

## 3. SEO Page API

- **Role:** Serve location page data for client-side render.
- **Route:** `GET /api/seo-page/:country/:pageType/:slug`.
- **Storage:** `getSeoPageByPath(country, pageType, slug)` from Supabase.
- **Response:** JSON row (title, h1, p1_snippet, faq_json, internal_links, etc.) or 404.

## 4. Security Headers

- **Role:** Apply security headers to all responses.
- **Headers:** X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin.
- **Code:** `applySecurityHeaders(res)` on final asset response and fallback.

## 5. Asset / Cache Fallback

- **Role:** Serve static assets (SPA) and fallback to index.html for client routes.
- **Code:** `app.get('*', ...)` fetches `c.env.ASSETS.fetch(c.req.raw)`, then fallback to `/index.html`.

## Dashboard settings (from prompt)

- **Speed:** Auto Minify, Rocket Loader, Brotli, Polish.
- **Caching:** Tiered Cache ON, Cache Reserve ON.
- **SSL/TLS:** Full (strict), Always HTTPS, HSTS.
- **Workers:** This single worker bound to the route(s) for streamstickpro.com.
