# Deliverable 19: Trust Signal Implementation

Use these in copy and UI (no fake numbers). Replace with real metrics when available.

## Copy (placeholders)

- **Users:** "250K+ users served" (only if true).
- **Uptime:** "99.9% uptime" or "99.999% uptime" (only if you can back it up).
- **Compliance:** "Privacy compliant" / "We respect your data" (link to /privacy).
- **Support:** "24/7 support" (only if true).
- **Channel count:** Use [CHANNEL_COUNT] in templates; replace with actual number sitewide (e.g. 18,000+).

## Implementation

- **Component:** Optional `TrustSignals` block for pillar and location pages: 2–3 short lines (e.g. "[CHANNEL_COUNT] channels • Free trial • 24/7 support").
- **Footer:** Already "StreamStickPro"; add one line of trust (e.g. "Trusted by cord-cutters. Privacy policy.")
- **Schema:** AggregateRating only with real or defensible review counts; no fabricated 5-star counts.
- **E-E-A-T:** Link to author/team (seo_experts) where relevant.

## Code location

- Add a small `<TrustSignals />` in PillarLayout or LocationPage CTA section.
- Props: `channelCount`, `showTrial`, `showSupport` (all optional).
