# Deliverable 2: robots.txt & Crawl Budget Optimization

## robots.txt best practices (researched 2025)

- **Allow** high-value paths explicitly (home, blog, shop, pillars, `/l/`).
- **Disallow** admin, API, checkout/success, and optional crawl-delay for non-Google bots.
- **Sitemap** in robots for all engines; submit sitemap index in GSC/Bing/Yandex when >50K URLs.
- **Do not** block CSS/JS required for rendering.

## Crawl budget (sites with 50K+ pages)

- **Demand:** Google crawls based on perceived importance and change frequency.
- **Capacity:** Server response time and stability affect how much can be crawled.
- **Wasters to remove:** duplicate URLs, soft 404s, long redirect chains, broken links, infinite faceted/calendar URLs.
- **Prioritization:** Strong internal links to pillars and money pages; canonical tags; fix 404s.

## StreamStickPro specifics

- Location pages (`/l/*`) are allowed; they get links from pillars and sitemap.
- API and admin are disallowed so crawlers focus on indexable content.
- No crawl-delay for Googlebot (ignored by Google).
