# Deliverable 16: .htaccess vs Cloudflare Equivalents

StreamStickPro runs on **Cloudflare Pages + Worker**. There is no Apache or .htaccess. Use the following equivalents.

## Redirects (301)

- **.htaccess:** `Redirect 301 /old /new`
- **Cloudflare:** Worker checks `redirect_map` (Supabase) and `SEO_REDIRECTS_STATIC`; returns `Response.redirect(url, 301)`. For bulk (25K), use redirect_map table or Cloudflare Bulk Redirects (dashboard or API).

## HTTPS / HSTS

- **.htaccess:** RewriteCond to force HTTPS.
- **Cloudflare:** SSL/TLS → Full (strict); Always Use HTTPS ON; HSTS enabled in dashboard.

## Caching

- **.htaccess:** mod_expires / Cache-Control headers.
- **Cloudflare:** Caching → Tiered Cache, Cache Reserve; Worker can set `Cache-Control` on responses; Pages sets defaults for static assets.

## Security headers

- **.htaccess:** Header set X-Frame-Options, etc.
- **Cloudflare:** Worker applies `SECURITY_HEADERS` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) to all responses.

## Blocking / allow

- **.htaccess:** Allow/Deny, RewriteRule for paths.
- **Cloudflare:** robots.txt for crawlers; Worker can return 403 for specific paths if needed; Firewall rules for IP/user-agent.

## Gzip / Brotli

- **.htaccess:** mod_deflate.
- **Cloudflare:** Speed → Optimization → Brotli (and Auto Minify) in dashboard.

No .htaccess file is used or needed; all behavior is in Worker + Cloudflare dashboard.
