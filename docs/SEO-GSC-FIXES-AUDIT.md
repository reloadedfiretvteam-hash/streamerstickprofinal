# SEO / GSC Fixes – Line-by-Line Audit Applied

Fixes applied to resolve Google/Bing/Yahoo Search Console errors: meta too long/short, Q&A without answers, schema/snippet issues, redirects, canonicals, sitemap.

## 1. Meta titles (50–60 chars)

- **All pillar pages:** Titles already within or under 60 chars; no change or trimmed.
- **UltimateIptvCatalog:** Was 68 chars → set to "Ultimate IPTV Catalog 2026 | 18K Channels, 60K Movies | StreamStick Pro" (≤60).
- **VsCompetitor:** Dynamic title capped at 60 chars (slice 0, 57 + "...").
- **Location pages (client + worker):** Full title "Title | StreamStick Pro" capped at 60 chars to fix "title too long" in GSC.

## 2. Meta descriptions (140–160 chars)

- **Pillar pages:** Descriptions set or adjusted to fall within 140–160 where possible; long ones truncated to 160.
- **MainStore, IptvFirestick, Resources, IptvMediaPlayers, BestIptvFirestick, FirestickDevices, Trial36hr, OnnGoogleTv, Shop, Pricing, JailbrokenFireSticks, IptvServices, ToolsCatalog:** Copy tightened or extended to be within range; no descriptions over 160.
- **UltimateIptvCatalog:** Dynamic description truncated to 160 if over.
- **VsCompetitor:** Dynamic description truncated to 160.
- **Location pages:** Already truncated to 160 (client) and 155 (worker crawler HTML).

## 3. Q&A / FAQ – question and answer required

- **SEOSchema (FAQPage):** Stricter validation: only output FAQ items where both question and answer are non-empty, answer length ≥ 25, and answer/question not in blocklist (n/a, na, location, tbd, tba, none, no answer, etc.). No FAQ schema is output when there are no valid items.
- **QASchema (QAPage):** Only output Q&A items where question and answer are non-empty and answer length ≥ 25. If no valid items, no QAPage schema is output (avoids "question with no answer" errors).
- **Worker location crawler FAQ:** Default fallback answers already > 25 chars; `sanitizeFaq()` filters short/invalid answers before output.
- **LocationPage client:** FAQ from API filtered: non-empty question/answer, answer length ≥ 25, blocklist applied before passing to SEOSchema.

## 4. Redirects

- **Static redirects (worker):** All targets are valid internal paths; no self-redirects (e.g. /x → /x). DB `redirect_map` checked first.
- No redirect chains introduced; single hop 301 to canonical URL.

## 5. Canonical

- **CanonicalTag:** Sets canonical and og:url per route; 404 and auth pages use noindex where appropriate.
- **Location pages:** Canonical set to exact URL `/l/{country}/{pageType}/{slug}`.

## 6. Schema / snippets

- **FAQPage:** Only valid Q&A pairs output; required fields (name, acceptedAnswer.text) always present.
- **QAPage:** Same validation; no empty answers.
- **Product / BreadcrumbList / HowTo:** Existing implementation kept; no empty required fields.
- **Location crawler HTML:** FAQ JSON-LD only output when `faqJson.length > 0` after sanitizeFaq.

## 7. Sitemap

- **Worker:** `sitemap.xml` and `sitemap-pages.xml` build from STATIC_SITEMAP_PAGES + blog + location (DB or location-pages.json). URLs are absolute and use same origin; no duplicate URLs in static set.
- **IndexNow:** Runs after deploy; submits URLs from live sitemap. Key file must be present at site root.

## 8. Helper

- **client/src/lib/seo-meta.ts:** `truncateTitle`, `truncateDescription`, `normalizeTitle`, `normalizeDescription` for consistent 50–60 title and 140–160 description. Use in new pages or when editing meta.

---

**Deploy:** Push to `clean-main` so the workflow runs and search engines pick up the fixes. Re-check GSC/Bing after a few days for remaining meta, FAQ, or schema issues.
