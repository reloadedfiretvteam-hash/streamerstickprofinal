# Agent Task Scopes

This document defines the clear separation of responsibilities between two agents working on this repository to avoid redundancies and overlapping work.

---

## Agent A: Stripe Integration & Secure Checkout

### Primary Responsibilities

Agent A is exclusively responsible for all Stripe-related payment processing and secure checkout functionality.

### Files & Components Owned by Agent A

#### Frontend Components
- `src/components/StripeCheckout.tsx` - Main Stripe checkout component
- `src/components/StripePaymentForm.tsx` - Stripe Elements integration form
- `src/pages/StripeCheckoutPage.tsx` - Stripe checkout page
- `src/pages/StripeSecureCheckoutPage.tsx` - Secure Stripe checkout page

#### Backend Functions
- `supabase/functions/stripe-payment-intent/index.ts` - PaymentIntent creation
- `supabase/functions/confirm-payment/` - Payment confirmation handler

#### Database Tables
- `stripe_products` - Products configured for Stripe payments

### Tasks for Agent A

1. **Ensure Stripe PaymentIntent and Elements integration is production-ready**
   - Validate `stripe-payment-intent` Edge Function handles all edge cases
   - Ensure proper error handling for failed payments
   - Verify 3D Secure authentication flows work correctly
   - Test PaymentIntent metadata is correctly populated

2. **Address bugs in secure checkout flows**
   - Fix any issues in `StripeSecureCheckoutPage.tsx`
   - Ensure `StripePaymentForm.tsx` properly mounts/unmounts Stripe Elements
   - Handle network errors gracefully
   - Validate form inputs before creating PaymentIntent

3. **Ensure secret key storage in Supabase Edge Functions**
   - Verify `STRIPE_SECRET_KEY` is properly configured in Supabase secrets
   - Ensure no secret keys are exposed in client-side code
   - Validate environment variable access in Edge Functions

4. **Successfully validate transactions end-to-end**
   - Test complete purchase flow from product selection to payment confirmation
   - Verify receipt emails are triggered
   - Ensure order records are created in the database
   - Test refund flows if applicable

### Acceptance Criteria for Agent A

- [ ] All Stripe payments process successfully in test mode
- [ ] Error messages are user-friendly and actionable
- [ ] No secret keys are exposed in client code or logs
- [ ] PaymentIntent creation succeeds with proper metadata
- [ ] 3D Secure flows complete successfully
- [ ] Payment confirmation redirects work correctly

---

## Agent B: Shopping Cart & Product Listings

### Primary Responsibilities

Agent B is exclusively responsible for the shopping cart functionality and product display/management.

### Files & Components Owned by Agent B

#### Frontend Components
- `src/context/CartContext.tsx` - Cart context definition
- `src/components/CartProvider.tsx` - Cart state management with localStorage
- `src/components/CartSidebar.tsx` - Cart sidebar UI
- `src/components/Shop.tsx` - Main shop component with product listings
- `src/components/ValidatedImage.tsx` - Image validation component
- `src/pages/ShopPage.tsx` - Shop page

#### Database Migrations
- `supabase/migrations/20251124000000_fix_product_image_urls.sql` - Product image URL fixes
- `supabase/migrations/20251124000001_fix_blog_post_image_urls.sql` - Blog image URL fixes

#### Database Tables
- `real_products` - Main products table
- `products_full` - Extended product data
- `product_images` - Product images table

### Tasks for Agent B

1. **Fix bugs for cart persistence and update flows**
   - Verify `CartProvider.tsx` correctly persists to localStorage
   - Ensure `updateQuantity` handles edge cases (0, negative values)
   - Test cart state survives page refreshes
   - Validate cart item validation on load from storage

2. **Validate all products have `main_image` URLs in `real_products`**
   - Query `real_products` table for any NULL or empty `main_image` values
   - Ensure all Fire Stick products have correct image paths
   - Ensure all IPTV subscription products have correct image paths
   - Verify `getStorageUrl()` function works for all image types

3. **Run migrations for '20251124000000_fix_product_image_urls.sql'**
   - Verify migration has been applied to production database
   - Check that image URLs are now relative paths (e.g., 'firestick 4k.jpg')
   - Confirm no hardcoded Supabase URLs remain in product records

4. **Verify all product routes and images are functional**
   - Test Shop component renders all products correctly
   - Verify `ValidatedImage` component falls back gracefully
   - Test product images load from Supabase storage
   - Ensure product filtering (firestick vs IPTV) works correctly

### Acceptance Criteria for Agent B

- [ ] Cart persists items across page refreshes
- [ ] Quantity updates work correctly (including removal at 0)
- [ ] All products display their images correctly
- [ ] No broken image placeholders visible
- [ ] Product filtering works on Shop page
- [ ] Migration has been applied and verified

---

## Shared Responsibilities

These areas may require coordination between both agents:

### Checkout Flow Integration
- When Agent A modifies checkout pages that display cart items
- When Agent B modifies cart data structures used by checkout

### Environment Variables
- `VITE_STRIPE_PUBLISHABLE_KEY` - Used by Agent A's components
- `VITE_SUPABASE_URL` - Used by both agents
- `VITE_SUPABASE_ANON_KEY` - Used by both agents

### Coordination Protocol

1. **Before making changes to shared files**, notify the other agent
2. **Pull latest changes** before starting any new task
3. **Create focused commits** that clearly indicate which agent made them
4. **Use descriptive branch names** with agent prefix (e.g., `agent-a/stripe-fix`, `agent-b/cart-update`)

---

## File Ownership Summary

| File/Directory | Owner | Notes |
|---------------|-------|-------|
| `src/components/Stripe*.tsx` | Agent A | All Stripe-related components |
| `src/pages/Stripe*.tsx` | Agent A | All Stripe-related pages |
| `supabase/functions/stripe-*` | Agent A | Stripe Edge Functions |
| `supabase/functions/confirm-payment` | Agent A | Payment confirmation |
| `src/context/CartContext.tsx` | Agent B | Cart context |
| `src/components/CartProvider.tsx` | Agent B | Cart state management |
| `src/components/CartSidebar.tsx` | Agent B | Cart UI |
| `src/components/Shop.tsx` | Agent B | Product listings |
| `src/components/ValidatedImage.tsx` | Agent B | Image validation |
| `supabase/migrations/*product*` | Agent B | Product-related migrations |

---

## Communication Protocol

1. **Daily Standup**: Both agents report progress and blockers
2. **Before Merge**: Agent must verify their changes don't conflict
3. **After Merge**: Notify the other agent of merged changes
4. **Blocking Issue**: Immediately notify the other agent if work is blocked

This separation ensures that neither agent works on the same files simultaneously, preventing merge conflicts and redundant work.
