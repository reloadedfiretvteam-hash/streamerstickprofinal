# Deliverable 13: Core Web Vitals Optimization Guide (2025–2026)

Researched thresholds and fixes for Google’s Core Web Vitals.

## Thresholds (75th percentile, mobile)

| Metric | Good | Needs improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | 200–500 ms | > 500 ms |
| **CLS** (Cumulative Layout Shift) | &lt; 0.1 | 0.1–0.25 | > 0.25 |

Target: LCP &lt; 0.8 s, INP &lt; 100 ms, CLS &lt; 0.01 (from prompt).

## LCP

- Optimize images: AVIF/WebP, &lt; 40KB where possible, width/height to avoid reflow.
- Reduce server/edge response time (Cloudflare, CDN).
- Remove or defer render-blocking JS/CSS; preload critical assets.
- Use `fetchpriority="high"` for above-the-fold image.

## INP

- Replace FID; measures responsiveness (clicks, taps, key).
- Shorten long tasks; break up work with `yield` or chunks.
- Optimize event handlers; avoid heavy work on first input.
- Reduce main-thread blocking (code-split, lazy load).

## CLS

- Set explicit width/height (or aspect-ratio) on images and video.
- Use `font-display: swap` and reserve space for text (e.g. line-height, min-height).
- Avoid inserting content above existing content; reserve space for ads/embeds.
- No layout shifts from late-loading fonts or dynamic content.

## StreamStickPro checklist

- [ ] All images have dimensions or aspect-ratio.
- [ ] Critical CSS inlined or preloaded; non-critical deferred.
- [ ] Lazy load below-fold images.
- [ ] Fonts: `font-display: swap`, preload if critical.
- [ ] Lighthouse 100/100 goal; run on representative pages (home, pillar, location).
