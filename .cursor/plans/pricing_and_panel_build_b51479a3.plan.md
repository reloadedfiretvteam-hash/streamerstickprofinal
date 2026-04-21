---
name: Pricing And Panel Build
overview: Repair pricing so the live page price always matches Stripe checkout, then implement the paid existing-customer panel flow with safe branching, two-step email delivery, and rollback protection.
todos:
  - id: repair-price-source-of-truth
    content: Align admin save, stored product pricing, Stripe shadow price usage, and storefront rendering so page price matches checkout
    status: in_progress
  - id: validate-price-sync
    content: Verify a single admin price change propagates to live page, shadow page, and checkout amount
    status: pending
  - id: build-existing-customer-paid-flow
    content: Implement paid checkout fields and fulfillment branching for existing username plus one-week fallback
    status: pending
  - id: split-paid-email-flow
    content: Separate payment confirmation from final account-result email and make branch handling idempotent
    status: pending
isProject: false
---

# Pricing Sync And Existing-Customer Panel Build

## Goal
Make product pricing trustworthy again so the admin panel, live page, shadow page, and Stripe checkout all agree on the same amount, then build the paid existing-customer XUI flow on top of that stable base.

## Core Rule
`real_products` should be the business source of truth for displayed pricing, and the checkout charge must always resolve from a Stripe price ID that has been synced to that same effective amount.

## Phase 1: Pricing Consistency Repair
Fix the path that decides what a product costs and ensure one admin change propagates correctly.

### What will be enforced
- Admin product edits update the product row and the effective sale price.
- Admin save must keep the Stripe-backed `shadowPriceId` aligned with that effective amount.
- Live product pages and shadow pages must read the same effective product pricing data.
- Checkout must charge the same effective amount the customer saw on the page.
- Site promotion logic must either use a valid promo price or safely fall back to the product's effective price.

### Files to audit and align
- [client/src/pages/AdminPanel.tsx](client/src/pages/AdminPanel.tsx)
- [client/src/pages/MainStore.tsx](client/src/pages/MainStore.tsx)
- [client/src/pages/ShadowStore.tsx](client/src/pages/ShadowStore.tsx)
- [client/src/pages/Shop.tsx](client/src/pages/Shop.tsx)
- [worker/routes/admin.ts](worker/routes/admin.ts)
- [worker/routes/checkout.ts](worker/routes/checkout.ts)
- [worker/storage.ts](worker/storage.ts)
- [worker/index.ts](worker/index.ts)
- [shared/schema.ts](shared/schema.ts)

### Main pricing risks to eliminate
- storefront price differs from Stripe checkout because `shadowPriceId` points to an old Stripe Price
- `sale_price` or `site_promotion` changes fail silently because Supabase/PostgREST schema state is out of sync
- live page and shadow page read slightly different pricing rules
- admin save updates display price but not the Stripe-backed charge path

### Root Cause Found In Current Code
Several storefront pages still carry hardcoded IPTV pricing tables instead of deriving all displayed prices from the product API:

- [client/src/pages/MainStore.tsx](client/src/pages/MainStore.tsx)
- [client/src/pages/Shop.tsx](client/src/pages/Shop.tsx)
- [client/src/pages/ShadowStore.tsx](client/src/pages/ShadowStore.tsx)

This means the current system can drift in two directions:
- admin + Stripe checkout may be correct while the page still shows stale hardcoded prices
- page display may be updated manually while checkout still charges from `shadowPriceId`

So the first pricing repair is not only backend sync. It also requires replacing hardcoded storefront IPTV prices with API-backed effective pricing everywhere.

## Phase 2: Existing-Customer Paid Checkout
After pricing is stable, add the paid IPTV existing-customer path.

### Confirmed paid behavior
- show `Existing customer`
- show `Current username`
- show `Expired more than 1 week` as always visible
- if username is found in the panel, update that existing line
- if username is not found and `expired > 1 week` is true, create a new account with new credentials
- if username is not found and fallback is not allowed, move to manual review instead of guessing

### Files to align
- [client/src/pages/Checkout.tsx](client/src/pages/Checkout.tsx)
- [shared/schema.ts](shared/schema.ts)
- [worker/routes/checkout.ts](worker/routes/checkout.ts)
- [worker/routes/webhook.ts](worker/routes/webhook.ts)
- [worker/email.ts](worker/email.ts)
- [worker/storage.ts](worker/storage.ts)

## Phase 3: Email Safety
Use two paid emails:
- payment confirmation right after successful payment
- account-result email only after the provisioning branch is actually known

The second email must branch correctly:
- existing account updated: send existing account / renewal info
- new account created: send new credentials
- unresolved/manual review: do not send misleading credentials

## Phase 4: Rollout Safety
Ship the panel-connected behavior behind flags while keeping the current fallback/manual path available.

### Guardrails
- never trust only the local `customers` table as proof that a panel line still exists
- use exact username matching only for existing-user updates
- make webhook and email handling idempotent so retries do not duplicate provisioning or sends
- keep ambiguous panel results in manual review
- preserve country/bouquet selections across both new-account and existing-account branches

## Build Order
1. Remove hardcoded storefront IPTV prices and derive displayed price from API-backed effective pricing
2. Repair admin save and Stripe `shadowPriceId` sync behavior
3. Verify storefront and checkout amount alignment
4. Add checkout payload fields for existing-customer paid flow
5. Move account-resolution branching to fulfillment/webhook stage
6. Split payment-confirmed email from account-result email
7. Add admin visibility for resolved branch and manual-review cases

## Validation
- Change one product price in admin and verify:
  - live page updates correctly
  - shadow page updates correctly
  - checkout session amount matches the page amount
- Change one sale price and verify the same end-to-end behavior
- Verify one active promo fallback path
- Verify one existing-customer paid renewal/update path
- Verify one fallback-to-new-account path
- Verify one manual-review path for username-not-found without fallback

## Immediate First Fix When Implementation Starts
The first implementation slice should be:

1. replace hardcoded IPTV pricing matrices on the storefront pages with product-API-driven effective pricing
2. confirm those pages render `sale_price` / effective amount consistently
3. then harden admin save so changing a price also updates the Stripe-backed checkout price path

This order gives the fastest visible win: the customer-facing page price will stop drifting from checkout.

## Expected Outcome
You can change a product price in admin and have the real page, shadow page, and Stripe checkout stay aligned, and you can then safely roll out paid existing-customer XUI updates without misleading emails or risky panel guesses.