# Deploy: SEO + UI + Checkout & Trials Working

This is the single place that ties together: **your working deployment** (rollback 20fb10e), **every SEO detail**, **your UI (homepage overhaul)**, and **checkout + trials working**.

---

## What’s in this deploy

### SEO (every detail)
- **client/index.html:** Title, description, keywords, robots, language, author, theme-color, color-scheme, referrer, canonical, hreflang (en-US, en-CA, en-GB, x-default), preconnect/dns-prefetch, preload hero image, GSC/Bing verification, og:title/description/type/image/url/site_name, **og:image:width, og:image:height, og:image:alt**, twitter:card/site/title/description/image, **twitter:image:alt**, RSS, OpenSearch, favicons, manifest.
- **JSON-LD:** **BreadcrumbList** (Home), Organization, WebSite, Store, FAQPage, Product, WebPage (with speakable).
- **Static fallback:** H1 "IPTV Fire Stick 2026", paragraph aligned with hero copy (for crawlers and no-JS).
- **Skip link + #main-content scroll-margin** (a11y).
- **client/src/index.css:** `.cta-hero` / `.cta-primary` (56px mobile, 72px desktop), `button:focus-visible` / `a:focus-visible`, design tokens (--seo-*), dark + .shadow-theme.

### UI (homepage overhaul)
- **Hero:** Bright gradient (blue-900 → blue-800 → orange-500), H1 "IPTV Fire Stick 2026", two CTAs (Start 36hr Trial, Buy Fire Stick Now), trust line (4.9/5, Instant Login, 10 Minutes). All use `cta-hero` for 72px targets.
- **Benefits:** White section "Perfect Streaming Guaranteed", three cards (18K+ Live Channels, Zero Buffer, Pre-Loaded Devices).
- **Final CTA:** Emerald band "Ready to Cut the Cord?" with Get 36hr Trial Access.
- **Shop:** Unchanged; IPTV "Subscribe Now" buttons use `cta-primary`.

### Checkout & trials (no code changes)
- **Worker** (worker/index.ts, routes/checkout.ts, routes/trial.ts, etc.) is **unchanged**. It uses `c.env.STRIPE_SECRET_KEY`, `c.env.RESEND_API_KEY`, etc.
- **Sync:** `scripts/sync-secrets-to-cloudflare-pages.mjs` runs in CI and pushes the same secrets to **production** and **preview** so the Worker gets them whether the live site is served from the production branch or clean-main (preview).
- **Workflow:** Build → **Sync secrets to Cloudflare Pages** (production + preview) → List secrets → Deploy → Wait 15s → **Smoke test** (GET /api/health; fail if stripe/resend/supabase false).

---

## What you need for checkout & trials to work

1. **GitHub Secrets** (repo → Settings → Secrets):  
   `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `SESSION_SECRET`. Optional: `RESEND_FROM_EMAIL`.

2. **Sync step** runs on every deploy (no skip). It uploads those secrets to Cloudflare Pages **production** and **preview**. So after a push to clean-main, the deployment that goes live (whether production or preview) gets the same secrets.

3. **Optional backup:** In **Cloudflare Dashboard** → Workers & Pages → **streamerstickpro-live** → Settings → Variables and Secrets, add **STRIPE_SECRET_KEY** and **RESEND_API_KEY** for **Production** and **Preview**. Then even if sync ever fails, the Worker still has them.

4. After deploy, open **https://streamstickpro.com/api/health**. You want `"stripe": true`, `"resend": true`, `"supabase": true`. If any is false, fix secrets (GitHub + optional Dashboard) and redeploy.

---

## One-line summary

**SEO and UI are in the repo; checkout and trials work when the Worker has Stripe and Resend (sync runs to both envs every deploy; optionally set the same in Cloudflare Dashboard).**
