# StreamStickPro Design Tokens (pSEO Blueprint)

Blueprint: dark cinema-like base, one accent (purple or green), high contrast, conversion-focused.

## Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--seo-bg` | #05060A | Near-black background |
| `--seo-bg-elevated` | #0a0b12 | Cards, nav |
| `--seo-text` | #F3F4F6 | Primary text |
| `--seo-text-muted` | #9ca3af | Secondary |
| `--seo-accent-purple` | #9333EA | CTAs, links (primary option) |
| `--seo-accent-green` | #22C55E | CTAs, success (alternative) |

## Layout

- **Nav**: Sticky top; links: Devices, Plans, Free Trial, Setup Guides, Support.
- **Hero**: Short headline, subhead, primary CTA "Start Free Trial", secondary "Watch Setup Tutorial".
- **Trust**: Uptime, support, refund; optional "thousands of streams delivered"–style metrics.

## CSS Variables (optional override)

Add to `:root` to align with blueprint:

```css
:root {
  --seo-bg: #05060A;
  --seo-bg-elevated: #0a0b12;
  --seo-text: #F3F4F6;
  --seo-text-muted: #9ca3af;
  --seo-accent-purple: #9333EA;
  --seo-accent-green: #22C55E;
}
```

Use `var(--seo-accent-purple)` or `var(--seo-accent-green)` for buttons/links when refining CTAs.
