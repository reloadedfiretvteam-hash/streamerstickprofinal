# Deliverable 9: Breadcrumb Generator

## Code

- **Script:** `scripts/breadcrumb-generator.mjs`
- **Usage:** `node scripts/breadcrumb-generator.mjs /l/usa/iptv/houston`
- **Output:** JSON-LD BreadcrumbList (print to stdout). Integrate into server or build step to inject into HTML.

## Client-side

- **PillarLayout** and **SEOSchema** already render breadcrumbs; pass `breadcrumbs` as `{ name, url }[]` with full URLs for schema (e.g. `https://streamstickpro.com/l/usa/iptv/houston`).
- **LocationPage** builds breadcrumbs from route params and page data (Home > Country > Type > Location).

## Format (from prompt)

- Home > [USA/Canada/UK] > [IPTV/Jailbreak/Google] > [State/Province] > [MAJOR_CITY] > [Page Type]
- Schema: BreadcrumbList with ListItem position, name, item (URL).
