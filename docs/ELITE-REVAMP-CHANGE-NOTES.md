# Elite Revamp Change Notes

Running log for elite revamp work so future fixes are easier if anything fails.

This file is intentionally operational, not marketing-focused.

---

## 2026-03-28 08:49:09

### Phase
- Runtime validation and high-risk architecture audit

### Confirmed live runtime
- The live customer-facing storefront is the `client/` app.
- Vite is rooted at `client/` in:
  - `vite.config.ts`
  - `vite.config.cloudflare.ts`
- Cloudflare production build path is:
  - `script/build.ts` -> Vite build to `dist`
  - Worker bundle to `dist/_worker.js`
- Worker handles runtime/API/SEO routing through:
  - `worker/index.ts`

### Confirmed storefront/shadow architecture
- Public storefront route:
  - `client/src/App.tsx` -> `/` => `MainStore`
- Shadow storefront route:
  - `client/src/App.tsx` detects secure host and switches `/` => `ShadowStore`
- Public route to shadow page still exists at:
  - `/shadow-services`

### Confirmed real-to-shadow checkout behavior
- Checkout session creation uses real products from storage:
  - `worker/routes/checkout.ts`
- Stripe checkout charges use `product.shadowPriceId`, not public labels:
  - `line_items[].price = product.shadowPriceId`
- Orders store both real and shadow references for reconciliation:
  - `realProductId`, `realProductName`
  - `shadowProductId`, `shadowPriceId`

### Confirmed payment/email flow
- Webhook-first payment completion and email path:
  - `worker/routes/webhook.ts`
- Success-page fallback email path remains available:
  - `worker/routes/checkout.ts` -> `/send-emails`
- This means revamp work must not break:
  - Stripe webhook receipt
  - order status update
  - credential generation
  - owner/customer email sending

### High-risk findings identified before broader revamp
- `worker/routes/auth.ts` has unsafe production fallbacks:
  - default JWT secret
  - default admin username/password
- `worker/routes/auth.ts` exposes `/generate-hash` publicly
- `worker/routes/checkout.ts` exposes `/send-emails` without auth
- `worker/routes/products.ts` still contains stale fallback copy/prices for device bundles
- `client/src/pages/AdminPanel.tsx` is large and operationally dense, so admin changes must be staged carefully

### Guardrails for next changes
- Do not change the real -> shadow -> Stripe mapping unless explicitly testing that flow end-to-end.
- Prefer changes in `client/` first unless runtime proof shows another surface is live.
- Re-test build and critical flows after each phase.
- Log each meaningful change in this file.

### Next planned focus
- Add safe public-site revamp improvements around the live `client/` storefront
- Preserve checkout integrity while tightening admin/infrastructure weak points
- Continue documenting every meaningful change here

---

## 2026-03-28 08:56:00

### Phase
- Public API fallback hardening

### Change made
- Updated stale fallback device products in:
  - `worker/routes/products.ts`

### Why
- If Supabase product reads fail, the public `/api/products` route falls back to hardcoded device data.
- That fallback still had:
  - old prices
  - outdated "fully loaded" language
  - weaker messaging than the live storefront
- This created a low-frequency but high-trust failure mode where customers could see wrong device pricing or stale copy during backend issues.

### Updated fallback behavior
- `firestick-hd` fallback price updated to `11500`
- `firestick-4k` fallback price updated to `12500`
- `firestick-4k-max` fallback price updated to `13500`
- Fallback copy now matches the current direction:
  - Reloaded Fire TV
  - instant credentials
  - educational tutorial
  - 1-year included access
  - 24/7 support
  - no dead apps / no Kodi rebuilds

### Risk level
- Low
- Only affects the fallback path when live product storage fails
- Does not change Stripe mappings, checkout charging, or shadow product behavior

### Verification
- Production build completed successfully after this change
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 10:05:00

### Phase
- Public endpoint hardening

### Changes made
- Disabled public email-based order lookup in production:
  - `worker/routes/orders.ts`
- Disabled public password-hash utility in production:
  - `worker/routes/auth.ts`

### Why
- The live `client/` storefront does not expose an active order-tracking experience that depends on `GET /api/orders/:email`.
- Leaving email-based order lookup publicly reachable is a privacy risk because it allows direct order discovery by email address if someone knows or guesses the endpoint.
- `/api/auth/generate-hash` is an operator/setup utility, not a customer-facing feature.
- Leaving that utility public in production increases unnecessary attack surface.

### New behavior
- In production, `GET /api/orders/:email` now returns `404`.
- In production, `POST /api/auth/generate-hash` now returns `404`.
- In non-production environments, both routes still work for local/dev troubleshooting.

### Risk level
- Low
- These routes are not part of the current live `client/` customer flow.
- No changes were made to:
  - real-to-shadow product mapping
  - Stripe checkout charging
  - webhook email delivery
  - admin login

### Verification
- Build re-run completed successfully after this change
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 10:22:00

### Phase
- Frontend performance hardening

### Changes made
- Reduced initial app bundle pressure in:
  - `client/src/App.tsx`
- Moved additional public/storefront routes behind lazy loading:
  - `Shop`
  - `Checkout`
  - `ShadowStore`
- Moved always-mounted overlay UI behind a lazy suspense boundary:
  - `ExitIntentPopup`
  - `CartDrawer`
  - `WishlistDrawer`

### Why
- The public homepage was still shipping too much JavaScript before users interacted with drawers, checkout, wishlist, or shadow storefront flows.
- Those features are important, but they are not needed for the first paint of the main homepage.
- Reducing the initial bundle helps mobile load speed, perceived responsiveness, and Core Web Vitals without changing pricing, SEO copy, checkout wiring, or Stripe mappings.

### New behavior
- `MainStore` remains the only eagerly loaded page route.
- Storefront and overlay features now load when they are actually needed.
- The main client entry bundle dropped across the staged changes from roughly:
  - `1010 kB` -> `935 kB` -> `921 kB`

### Risk level
- Low
- Route behavior and UI features remain intact.
- This change does not alter:
  - checkout logic
  - webhook flow
  - admin auth
  - public SEO content

### Verification
- Production build completed successfully after each performance pass
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 10:44:00

### Phase
- Build pipeline and production bundle optimization

### Changes made
- Continued homepage deferral in:
  - `client/src/pages/MainStore.tsx`
- Deferred additional below-the-fold and interaction-only homepage modules:
  - `FreeTrial`
  - `DemoVideo`
  - `SportsCarousel`
  - `TrustStats`
  - `IPTVMediaPlayersSection`
  - `ChannelLogos`
  - `SavingsCalculator`
  - `ExitPopup`
  - `FloatingCTA`
  - `StickyMobileCTA`
  - `ScrollToTopButton`
  - `SupportMessageBox`
- Removed dead homepage imports that were no longer used:
  - `ComparisonTable`
  - unused `TrustBadges` named imports
- Added production vendor chunking to the actual Cloudflare build config:
  - `vite.config.cloudflare.ts`

### Why
- The public Cloudflare production build was still bundling too much code into one large entry file even after route and overlay lazy-loading.
- The dev/local Vite config already had vendor chunking, but the Cloudflare config used for real production builds did not.
- This meant the live deployment path was not benefiting from the same chunk separation and cache behavior already defined elsewhere in the repo.

### New behavior
- Homepage-only lower-page sections now load when needed instead of inflating the initial storefront entry.
- Cloudflare production builds now emit dedicated vendor chunks for:
  - React
  - router
  - selected UI libraries
  - animation libraries
  - icons
- Production main entry bundle improved roughly across this optimization sequence:
  - `1010 kB` -> `935 kB` -> `921 kB` -> `821 kB` -> `815 kB` -> `597 kB`

### Risk level
- Low
- These changes primarily affect when code is loaded and how bundles are emitted.
- No changes were made to:
  - public pricing logic
  - Stripe charge mapping
  - webhook email flow
  - admin authentication behavior
  - page content semantics used for SEO

### Verification
- Production build completed successfully after each optimization step
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 10:58:00

### Phase
- Additional storefront interaction deferral

### Changes made
- Split the quick-view trigger from the quick-view modal:
  - added `client/src/components/QuickViewButton.tsx`
  - trimmed `client/src/components/ProductQuickView.tsx`
- Updated both storefront pages to lazy-load the quick-view modal while keeping the small trigger button eager:
  - `client/src/pages/MainStore.tsx`
  - `client/src/pages/Shop.tsx`
- Added a dedicated data/state vendor chunk to the Cloudflare production build:
  - `vite.config.cloudflare.ts`
  - chunk includes:
    - `@tanstack/react-query`
    - `@supabase/supabase-js`
    - `zustand`

### Why
- Both main storefront pages were importing the full quick-view modal module just to render a small icon button on each product card.
- Shared data/state libraries were still bundled into the main production entry even after route and vendor chunking improvements.
- This kept the initial storefront payload larger than necessary on mobile and slowed first-load caching efficiency.

### New behavior
- Quick-view modal code now loads only when a user actually opens it.
- A new dedicated `data-vendor` production chunk now carries the shared app data/state libraries.
- Production main entry bundle improved further:
  - `597 kB` -> `577 kB` -> `376 kB`

### Risk level
- Low
- This changes code-loading boundaries, not business logic.
- No changes were made to:
  - product pricing
  - checkout flow
  - Stripe mapping
  - webhook handling
  - SEO page content

### Verification
- Production build completed successfully after the quick-view split
- Production build completed successfully after the data vendor split
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 11:08:00

### Phase
- Build config parity and local verification hardening

### Changes made
- Synced the default Vite config chunk strategy with the production Cloudflare config:
  - `vite.config.ts`
- Added the same dedicated `data-vendor` chunk in the default config:
  - `@tanstack/react-query`
  - `@supabase/supabase-js`
  - `zustand`
- Removed a stale `terser` requirement from `vite.config.ts`

### Why
- The Cloudflare production path had been optimized, but the default Vite config still lagged behind.
- During direct verification of `vite.config.ts`, the build failed because that config still forced `minify: 'terser'` even though `terser` was not installed in this worktree.
- That meant local production-style verification could fail for reasons unrelated to the actual storefront code.

### New behavior
- Default Vite builds now use the same main chunking strategy as the Cloudflare production path.
- The default Vite config no longer depends on an uninstalled optional minifier.
- Direct verification of the standard Vite config now completes successfully.

### Risk level
- Low
- This is a build-path/configuration correction.
- No changes were made to storefront behavior, checkout, pricing, or SEO content.

### Verification
- Direct build using `vite.config.ts` completed successfully after the fix
- Cloudflare production build remained healthy
- Production SEO audit remained clean in the main build path:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 11:22:00

### Phase
- Mobile storefront polish and live-layout cleanup

### Changes made
- Tightened mobile layout behavior in:
  - `client/src/pages/MainStore.tsx`
- Added a page-level horizontal overflow guard for the homepage wrapper
- Reduced mobile header wrap pressure and replaced the broken stacked brand text with a compact mobile label (`SSP`)
- Adjusted the fixed support bar spacing for mobile
- Reduced and raised the WhatsApp button on mobile
- Hid the WhatsApp hover tooltip on mobile so it cannot create off-screen layout width

### Why
- Manual mobile inspection of the storefront revealed visible polish issues:
  - horizontal overflow / bottom scrollbar
  - header branding collapsing poorly on narrow screens
  - floating WhatsApp button colliding with the fixed support bar
- These problems hurt perceived quality and mobile usability, especially above the fold where first impressions matter most.

### New behavior
- Homepage no longer introduces horizontal scrolling in the tested mobile viewport.
- Mobile header now keeps a clean compact brand mark instead of wrapping the full brand name awkwardly.
- The WhatsApp action remains visible but no longer crowds the support bar the same way on mobile.

### Risk level
- Low
- This is a layout and spacing correction on the homepage.
- No changes were made to:
  - pricing
  - checkout logic
  - Stripe mappings
  - email flow
  - SEO copy structure

### Verification
- Cloudflare production build completed successfully
- Worker build completed successfully
- SEO audit remained clean:
  - `Pages scanned: 929`
  - `Issues found: 0`
- Local mobile preview verified after build:
  - horizontal overflow removed
  - header brand no longer breaks vertically
  - support/chat overlap improved materially

---

## 2026-03-28 11:41:00

### Phase
- Storefront conversion-card polish

### Changes made
- Updated homepage product cards in:
  - `client/src/pages/MainStore.tsx`
- Updated shop product cards in:
  - `client/src/pages/Shop.tsx`
- Added compact reassurance strips directly inside IPTV plan cards:
  - instant email credentials
  - setup tutorial included
  - 24/7 human support
- Added compact reassurance strips directly inside device cards:
  - Reloaded Fire TV all-in-one flow
  - educational tutorial included
  - 1-year access + support
- Fixed awkward device CTA wording in the shop page:
  - `Add 2 to Cart` style text now renders correctly instead of missing spacing

### Why
- The most important conversion surfaces are the product cards themselves.
- The cards already had strong content, but some of the best trust signals were buried lower on the page instead of sitting beside the purchase decision.
- The shop device CTA had awkward copy spacing, which weakened polish at a key moment.

### New behavior
- Shoppers now see core reassurance closer to pricing and the buy button on both storefront pages.
- Card messaging feels more premium and easier to scan without changing pricing, checkout flow, or the main SEO copy structure.
- Device CTA wording is cleaner and more professional.

### Risk level
- Low
- This is presentation and conversion-copy polish inside existing product cards.
- No changes were made to:
  - product prices
  - add-to-cart logic
  - checkout behavior
  - Stripe mapping
  - email/webhook flow

### Verification
- Cloudflare production build completed successfully after the card polish pass
- Worker build completed successfully
- SEO audit remained clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 09:12:00

### Phase
- Deployment and operational health alignment

### Change made
- Updated the runtime health endpoint in:
  - `worker/index.ts`

### Why
- Existing deployment docs and smoke-test expectations say `/api/health` should expose whether Stripe, Resend, and Supabase bindings are present.
- The real route only returned:
  - `status`
  - `timestamp`
  - `version`
- This created an ops mismatch where deployment guidance and runtime behavior were no longer aligned.

### New behavior
- `/api/health` still preserves:
  - `status`
  - `timestamp`
  - `version`
- It now also exposes:
  - `stripe`
  - `resend`
  - `supabase`
- And adds `details` fields for:
  - Supabase URL/service/anon presence
  - webhook secret presence
  - from-email presence
  - admin username/password presence
  - JWT secret presence

### Risk level
- Low
- Additive response change only
- Existing simple health consumers still work
- No change to checkout, Stripe charging, webhook behavior, or customer routing

### Verification
- Production build completed successfully after this change
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`

---

## 2026-03-28 09:04:00

### Phase
- Admin/operator tooling stabilization

### Changes made
- Added authenticated admin environment status route in:
  - `worker/routes/admin.ts`
- Updated the admin panel to use the admin route instead of the production-disabled debug route:
  - `client/src/pages/AdminPanel.tsx`

### Why
- The admin panel was trying to load environment diagnostics from `/api/debug`.
- That endpoint is intentionally disabled in production.
- Result: environment/tooling status in the admin panel was unreliable or broken where it matters most.

### New behavior
- Admin now reads environment status from `/api/admin/env-status`.
- Status payload now exposes operator-relevant flags:
  - Stripe key present
  - Stripe webhook secret present
  - Resend key/from-email present
  - whether Supabase is using a real service key or anon fallback
  - whether admin auth is relying on default credential fallback
  - whether JWT auth is relying on default secret fallback
- Admin UI now shows clearer warning states for:
  - anon-key fallback
  - default admin credential fallback
  - default JWT secret fallback

### Risk level
- Low
- This does not change checkout, Stripe charging, shadow-product mapping, or customer-facing routing.
- It improves admin visibility without depending on a production-disabled endpoint.

### Verification
- Production build completed successfully after this change
- Worker build completed successfully
- SEO audit result stayed clean:
  - `Pages scanned: 929`
  - `Issues found: 0`
