# Title & Meta Generation Prompts

Use with an AI builder to generate or A/B-test title/meta pairs from Search Console and analytics data.

## Primary prompt

```
Given this page's data:
- Target query set: [list top 3–5 queries]
- Current title: [current]
- Current meta description: [current]
- SERP competitors: [top 3 competitor titles]
- Metrics: impressions [N], clicks [N], CTR [%], avg position [N]

Generate 3 new SEO-optimized title and meta description pairs that:
(a) aim to increase CTR,
(b) stay truthful and compliant,
(c) preserve StreamStickPro brand tone (IPTV, Fire Stick, live TV, "start streaming in 10 minutes"),
(d) avoid clickbait.

Output as JSON:
[
  { "title": "...", "metaDescription": "...", "rationale": "..." },
  ...
]
```

## StreamStickPro-specific constraints

- Include "Fire Stick", "IPTV", "Live TV", or "StreamStickPro" where relevant.
- Emphasize: "10 minutes", "18,000+ channels", "100,000+ movies", "free trial", "24/7 support".
- Max title length ~60 chars; meta ~155 chars.
