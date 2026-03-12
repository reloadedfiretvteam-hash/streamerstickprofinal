# All Fixed – Checklist

One place for what’s fixed and how to confirm everything works.

---

## 1. Working deployment (checkout + free trials)

- **Sync secrets** runs every deploy and pushes to **production** and **preview** so the Worker gets Stripe and Resend whether the live site uses the production branch or clean-main (preview).
- **Smoke test** runs after deploy and fails the job if `/api/health` shows missing stripe/resend/supabase.
- **Worker** checkout and trial routes are unchanged; they use `STRIPE_SECRET_KEY` and `RESEND_API_KEY` from env.

**You need:** GitHub Secrets set (STRIPE_SECRET_KEY, RESEND_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.). Optional: add the same two keys in Cloudflare Dashboard → streamerstickpro-live → Settings → Variables and Secrets (Production + Preview).

**After deploy:** Open https://streamstickpro.com/api/health → expect `stripe: true`, `resend: true`, `supabase: true`. Then test checkout and free trial once.

---

## 2. SEO

- **client/index.html:** Title, description, canonical, hreflang, og/twitter (image + alt, width, height), BreadcrumbList, Organization, WebSite, Store, FAQPage, Product, WebPage, skip link, GSC/Bing verification.
- **robots.txt:** Both sitemap-index.xml and sitemap.xml listed.
- **Worker:** Canonical and X-Robots-Tag on responses; location pages return 404 when missing, 503 + Retry-After on errors to reduce 5xx.

---

## 3. Homepage / front

- **client/src/pages/MainStore.tsx:** Bright gradient hero (blue→orange), H1 “IPTV Fire Stick 2026”, two CTAs (Start 36hr Trial, Buy Fire Stick Now), white “Perfect Streaming Guaranteed” section, emerald “Ready to Cut the Cord?” band, then shop.
- **client/src/index.css:** .cta-hero / .cta-primary (56px mobile, 72px desktop), focus-visible, design tokens.

---

## 4. GSC (Passed / Failed / Started)

- **docs/GSC-STATUS-FIXES.md** – Your statuses and what was fixed (5xx→503+Retry-After, redirects 301, canonicals, noindex, etc.).
- **docs/GSC-CONSOLE-CHECKLIST.md** – General GSC checklist.

---

## 5. Deploy and verify

1. Push to **clean-main** (or run workflow manually).
2. Wait for “Deploy to Cloudflare Pages” to finish (green).
3. Check **Smoke test** step: must pass (all bindings true).
4. Open https://streamstickpro.com/api/health → all true.
5. Test **free trial:** https://streamstickpro.com/36hr-trial → submit form → check email.
6. Test **checkout:** add product from shop → checkout → complete or use test card.

If the smoke test fails, add or fix GitHub Secrets (and optionally Cloudflare Dashboard secrets), then re-run the workflow or push again.
