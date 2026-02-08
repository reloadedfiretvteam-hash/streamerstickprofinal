# Deliverable 17: Semantic Cluster Architecture Map

Pillar → cluster pages → keywords. Every cluster page links to 20 pillars + 15 money pages + 5 contextual (from prompt).

## Pillars (50 target, 6 live)

| Pillar | URL | Cluster themes |
|--------|-----|----------------|
| IPTV Services | /iptv-services | IPTV [city], best IPTV, IPTV USA/CA/UK |
| IPTV Firestick | /iptv-firestick | IPTV Fire Stick, setup, apps |
| Jailbroken Fire Sticks | /jailbroken-fire-sticks | jailbroken Fire Stick [city], pre-jailbroken, buy near me |
| Firestick Devices | /firestick-devices | Fire Stick 4K, devices, comparison |
| Best IPTV Firestick | /best-iptv-firestick | best IPTV Firestick 2026, comparison |
| IPTV Media Players | /iptv-media-players | Google TV IPTV, Chromecast, TiviMate, Smarters |

## Cluster page types

- **Location:** `/l/{country}/{page_type}/{slug}` (e.g. /l/usa/iptv/houston). page_type: iptv | jailbreak | google.
- **Target keyword per page:** seo_architecture.target_keyword (e.g. "IPTV Houston", "jailbroken Fire Stick Los Angeles").

## Internal link targets (per cluster page)

- **20 pillar links:** Link to all 6 pillars from every location page (plus future pillars).
- **15 money pages:** /, /shop, /free-trial, /iptv-services, /iptv-firestick, /jailbroken-fire-sticks, /firestick-devices, /best-iptv-firestick, /iptv-media-players, /blog, key product/shop anchors.
- **5 contextual:** Sibling location pages or related topic (e.g. same state, same page_type).

## Topical authority

- content_clusters table: pillar_topic, pillar_url, cluster_keywords, cluster_page_slugs, topical_authority_target (95.0).
- Use for internal link map and content planning.
