# Super-House SEO System – Implementation Summary

StreamStickPro.com blueprint implemented per the “super house” SEO spec (crawl control, internal linking, structured data, pSEO, self-healing technical SEO, GSC feedback, design tokens).

## What Was Added

### 1. Config (`seo/config/`)

- **`site-map-spec.yaml`** – IA and URL strategy: `/`, `/shop`, `/devices/`, `/plans/`, `/trials/`, `/setup/`, `/channels/`, `/blog`. Templates, internal-linking rules, click-depth ≤3.
- **`schema-rules.json`** – Global Organization/WebSite; per–page-type schemas (Product, HowTo, FAQPage, etc.); entity linking; validation rules.
- **`audit-rules.json`** – Technical SEO rules: missing canonical, broken links, thin content, missing/multiple H1, product schema, LCP/CLS.

### 2. Libraries (`seo/lib/`)

- **`pseo-models.ts`** – Data models: Device, Plan, Trial, ChannelCategory, Location. `mapProductToDeviceOrPlan()` maps `real_products` to pSEO entities.
- **`entity-graph.ts`** – JSON-LD helpers: `organizationSchema`, `webSiteSchema`, `productSchema`, `howToSchema`, `breadcrumbSchema`, `itemListSchema`, `faqSchema`. Use in `SEOSchema` or page-level `<script type="application/ld+json">`.

### 3. Build-Time SEO Audit

- **`scripts/seo-audit.ts`** – Scans `dist/` HTML, runs audit rules, reports errors/warnings. Skips SPA index and verification files (e.g. GSC).
- **`npm run seo:audit`** – Manual run.
- **Build** – `script/build.ts` runs prerender then `seo-audit`; Cloudflare build remains green.

### 4. AI Prompts (`seo/prompts/`)

- **`title-meta-generation.md`** – CTR-oriented title/meta variants from GSC data.
- **`thin-page-expansion.md`** – Expand thin plan/device pages (500+/400+ words).
- **`faq-voice-snippet.md`** – FAQ blocks for featured snippets and voice.

### 5. Docs (`seo/docs/`)

- **`gsc-integration.md`** – GSC API setup, data to pull, triggers, example Node script.
- **`log-analysis-spec.md`** – Crawl-budget and log analysis (Cloudflare Logpush, Workers, synthetic crawl).
- **`design-tokens.md`** – Blueprint palette (#05060A, #F3F4F6, purple/green accent) and layout.

### 6. Design Tokens

- **`client/src/index.css`** – `--seo-bg`, `--seo-text`, `--seo-accent-purple`, `--seo-accent-green` etc. for optional blueprint alignment.

## How to Use

1. **Extend routes** – Add `/devices/`, `/plans/`, `/setup/`, etc. per `site-map-spec.yaml`; use `entity-graph` + `pseo-models` for JSON-LD and copy.
2. **Run audit** – `npm run seo:audit` (or rely on post-build). Fix any reported issues.
3. **GSC pipeline** – Follow `seo/docs/gsc-integration.md`; use `seo/prompts/` for title/meta tests and thin-page expansion.
4. **Log analysis** – When Cloudflare logs are available, use `seo/docs/log-analysis-spec.md`.

## References

- **`seo/README.md`** – Overview of config, scripts, prompts, docs.
- Blueprint: dark cinema theme, Devices / Plans / Free Trial / Setup / Support nav, “Start Free Trial” + “Watch Setup Tutorial” CTAs.
