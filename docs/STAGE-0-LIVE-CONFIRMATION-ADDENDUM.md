# Stage 0 — Live confirmation addendum

**Date:** 2026-09-21  
**Mode:** Read-only (no schema writes, no deploys, no payment tests)  
**Secrets:** Not included in this document.

## GitHub

| Check | Result |
|-------|--------|
| Remote | `reloadedfiretvteam-hash/streamerstickprofinal` |
| Default branch | `clean-main` |
| Local branch | `clean-main` tracking `origin/clean-main` |
| Tip commit (remote) | `683893b` — Admin: plain-language Change prices guide… |
| Visibility | Public |

## Cloudflare Pages

| Check | Result |
|-------|--------|
| Token | Active / verified |
| Primary project (matches `wrangler.toml`) | `streamerstickpro-live` |
| Production branch | `clean-main` |
| Subdomain | `streamerstickpro-live.pages.dev` |
| Latest production deploy | success @ commit `683893b` |
| Secondary related project | `streamerstickprofinal` (subdomain `streamstickpro.pages.dev`, also `clean-main`) |

## Supabase

| Check | Result |
|-------|--------|
| Project ref (from JWT + `.env.example`) | `emlqlmfzqsnqokrqvmcm` |
| Auth health | OK (GoTrue) |
| Storage buckets | **`imiges` only** (public=true). No `images` bucket. |
| PostgREST OpenAPI paths | 57 relations/RPCs exposed |
| Edge Functions list API | **UNKNOWN** (management list endpoint returned 404 with service role; dashboard check still needed for which functions receive traffic) |

### Live table spot-checks (exact counts via Prefer: count=exact)

| Table | Live status |
|-------|-------------|
| `real_products` | Present — **29** rows |
| `orders` | Present — **218** rows |
| `blog_posts` | Present — **927** rows |
| `site_settings` | Present — **3** rows |
| `page_edits` | Present — **0** rows |
| `homepage_sections` | Present — **6** rows (legacy CMS; not wired to live AdminPanel Visual Editor path) |
| `tutorial_boxes` | Present — **0** rows |
| `media_library` | Present — **0** rows |
| `faq_items` | Present — **0** rows |
| `carousel_slides` | Present — **0** rows |
| `site_promotion` | **MISSING** from live PostgREST schema (code + migration exist in repo) |
| `shadow_products` | **MISSING** from live schema |
| `seo_ads` | **MISSING** from live schema |
| `seo_redirects` | **MISSING** (live has `redirects` instead) |
| `provisioning_jobs` | **MISSING** from live schema |
| `guides` / `navigation_items` | **MISSING** (to be created in Stage 2) |

### Conflict: code vs live DB

Repo Worker/admin assume tables such as `site_promotion`, `seo_ads`, `provisioning_jobs` that are **not** present on the live project OpenAPI surface. Live DB still has older CMS tables (`homepage_sections`, `media_library`, `tutorial_boxes`, `editable_sections`, …) that the production Vite admin largely ignores.

**Implication:** Stage 2 migrations must be additive and defensive (`create table if not exists`), with backups before apply. Promo admin features that write `site_promotion` will fail against live until that table is created.

## Payment zone reminder

Checkout/Stripe/webhook/provisioning paths remain **PROTECTED**. Stage 0 did not call Stripe or mutate orders.

## Security hardening note (2026-09-21)

**CRITICAL:** Live `site_settings` contained plaintext Stripe live keys (`stripe_publishable_key`, `stripe_secret_key`). Values are not recorded here. Rows were deleted during Stage 7; Stripe must come only from Cloudflare environment variables. Rotate Stripe keys if those DB values may have been exposed historically.

## Local workspace note

Working tree on `clean-main` had uncommitted local modifications at audit time (`AdminPanel.tsx`, `MainStore.tsx`, `Shop.tsx`, plus untracked ONN image helper scripts). Stage implementation should not discard owner local work without explicit instruction.
