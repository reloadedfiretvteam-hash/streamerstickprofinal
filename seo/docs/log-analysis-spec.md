# Log Analysis & Crawl-Budget Spec

StreamStickPro runs on **Cloudflare Pages**. Traditional server access logs are not available; use the following alternatives.

## Options on Cloudflare

1. **Cloudflare Logpush (Enterprise)**
   - Push HTTP requests to R2, S3, or Datadog.
   - Parse logs externally (Python/Node) to detect Googlebot/Bingbot, map URL → hits, status, latency.

2. **Cloudflare Analytics (built-in)**
   - Dashboard: traffic, status codes, endpoints. No raw log export on free/pro.

3. **Worker + Custom Logging**
   - Add a Worker that logs `request.url`, `request.headers.get('user-agent')`, `response.status` to external storage (e.g. KV, D1, or external API). Filter bots client-side.

4. **Synthetic Crawl (No Logs)**
   - Run a scheduled job (e.g. `scripts/seo-audit.ts` or a crawler like Puppeteer/Playwright) over the live site.
   - Simulate bot behavior: record URL → status, redirect chains, presence of canonical, h1, word count. Use this as a stand‑in for “crawl” data.

## Log Analysis Logic (When Logs Exist)

- **Parse**: access logs → URL, statusCode, responseTime, userAgent.
- **Filter**: `User-Agent` contains `Googlebot`, `Bingbot`, etc.
- **Aggregate**: group by URL; compute hits, crawl frequency, depth (from referer or sitemap).
- **Actions**:
  - 404/5xx clusters → fix (redirect, content, or 410).
  - High bot hits, low organic traffic → consider content upgrade or deindex.
  - Important URLs rarely crawled → boost via sitemap, internal links, `Fetch as Google`.

## Recommended for StreamStickPro

- Use **SEO audit** (`scripts/seo-audit.ts`) as the primary “crawl” feedback loop.
- Optionally add a **Worker** that logs bot requests to KV/R2 if you need true log-based crawl stats later.
