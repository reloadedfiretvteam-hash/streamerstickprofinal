# StreamStickPro Super-House SEO System

Machine-readable config, pSEO models, entity-graph schema, audit rules, and AI prompts for streamstickpro.com.

## Layout

- **`config/`** – Site map spec, schema rules, audit rules.
- **`lib/`** – pSEO data models, entity-graph JSON-LD helpers.
- **`prompts/`** – AI prompts for title/meta, thin-page expansion, FAQ/voice.
- **`docs/`** – GSC integration, log-analysis spec, design tokens.

## Config

| File | Purpose |
|------|---------|
| `site-map-spec.yaml` | IA, URL patterns, templates, internal-linking rules. |
| `schema-rules.json` | Page-type schemas, entity linking, validation. |
| `audit-rules.json` | Technical SEO rules (canonical, h1, thin content, etc.). |

## Scripts

- **`npm run seo:audit`** – Run SEO audit over `dist/` (canonical, h1, word count). Also runs after Cloudflare build.
- **Build** – `script/build.ts` runs prerender then `scripts/seo-audit.ts`.

## Entity Graph & Schema

Use `seo/lib/entity-graph.ts`: `organizationSchema`, `webSiteSchema`, `productSchema`, `howToSchema`, `breadcrumbSchema`, `itemListSchema`, `faqSchema`. Wire into `SEOSchema` or page-level `<script type="application/ld+json">`.

## Prompts

- `prompts/title-meta-generation.md` – CTR-oriented title/meta variants from GSC data.
- `prompts/thin-page-expansion.md` – Expand thin plan/device pages.
- `prompts/faq-voice-snippet.md` – FAQ blocks for featured snippets and voice.

## Docs

- `docs/gsc-integration.md` – Search Console API, triggers, example script.
- `docs/log-analysis-spec.md` – Crawl-budget, log analysis (Cloudflare-oriented).
- `docs/design-tokens.md` – Blueprint palette and layout notes.

## Extending

1. Add routes/templates for `/devices/`, `/plans/`, `/setup/`, `/trials/`, `/channels/` per `site-map-spec.yaml`.
2. Feed real products + static data into `pseo-models`, render pSEO templates.
3. Add more audit rules in `audit-rules.json` and implement checks in `scripts/seo-audit.ts`.
4. Connect GSC pipeline and use `prompts/` for automated copy tests.
