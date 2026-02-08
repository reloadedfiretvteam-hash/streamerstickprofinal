# Deliverable 4: Supabase SQL Schema & Data Structure

## Migration

Run in Supabase SQL Editor:

- **File:** `supabase/migrations/20260207000001_seo_domination_schema.sql`

## Tables

| Table | Purpose |
|-------|--------|
| **seo_architecture** | Location/topic pages: page_type (iptv/jailbreak/google), country (USA/CA/UK), region, location, slug, title, meta_description, h1, p1_snippet, pillar_url, internal_links (JSONB), faq_json (JSONB), published. Unique (page_type, country, slug). |
| **redirect_map** | 301 rules: old_path, new_path, status_code. Worker and static fallback use this. |
| **content_clusters** | Pillar → cluster: pillar_topic, pillar_url, cluster_keywords, cluster_page_slugs (JSONB), topical_authority_target. |
| **seo_experts** | E-E-A-T: name, title, bio, image_url. |

## RLS

- `seo_architecture`: SELECT for published = true.
- `redirect_map`, `content_clusters`, `seo_experts`: SELECT for all (public read).

## Worker usage

- **Redirects:** `getRedirectMap()` → apply before static SEO_REDIRECTS.
- **Sitemap:** `getSeoPagesForSitemap(25000)` → append `/l/{country}/{page_type}/{slug}` to sitemap.
- **Location page API:** `getSeoPageByPath(country, pageType, slug)` → `GET /api/seo-page/:country/:pageType/:slug`.
