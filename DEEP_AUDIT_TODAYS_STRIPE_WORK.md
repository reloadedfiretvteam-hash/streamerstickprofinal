# DEEP AUDIT: Today's Stripe Integration Work

## ARCHITECTURE OVERVIEW

### Two-Table System (Real Products vs Cloaked Products)

1. **`real_products` Table**
   - Real products customers see on main website
   - Used on: ShopPage, FireSticksPage, IPTVServicesPage, NewCheckoutPage
   - Contains actual product names, descriptions, images
   - Managed via: RealProductManager component

2. **`stripe_products` Table**  
   - Cloaked/compliant products for Stripe compliance
   - Used on: StripeSecureCheckoutPage (shadow page)
   - Contains compliant product names (e.g., "Content Management Service" instead of "IPTV")
   - Managed via: StripeProductManager component
   - Only shown on `pay.streamstickpro.com` subdomain

### Two Checkout Pages System

1. **Main Checkout Page** (`/checkout`)
   - Component: `NewCheckoutPage.tsx`
   - Customer sees: REAL products from `real_products` table
   - Cart-based checkout
   - Payment methods: Stripe, Bitcoin, Cash App
   - Uses: `create-payment-intent` edge function (cart-based)

2. **Shadow/Cloaked Checkout Page** (`pay.streamstickpro.com` or `/stripe-checkout`)
   - Component: `StripeSecureCheckoutPage.tsx`
   - Stripe sees: CLOAKED products from `stripe_products` table
   - Single product checkout
   - Payment method: Stripe only
   - Uses: `stripe-payment-intent` edge function (single product)

### Routing Logic (AppRouter.tsx)

```typescript
// Stripe payment subdomain → Shadow page (cloaked products)
if (isStripePaymentHost()) {
  return <StripeSecureCheckoutPage />; // Uses stripe_products
}

// Main checkout route → Real products
if (currentPath === '/checkout') {
  return <NewCheckoutPage />; // Uses real_products from cart
}
```

### Payment Intent Edge Functions

1. **`create-payment-intent`** (for main checkout)
   - Accepts: `amount`, `currency`, `customerInfo`
   - Creates PaymentIntent for cart total
   - Used by: NewCheckoutPage (main checkout)

2. **`stripe-payment-intent`** (for shadow page)
   - Accepts: `productId`, `customerEmail`, `customerName`
   - Fetches product from `stripe_products` table
   - Creates PaymentIntent for single product
   - Used by: StripeSecureCheckoutPage (shadow page)

### Current Issue

**Problem:** Stripe payment disappeared from main checkout page (`NewCheckoutPage.tsx`)

**Solution Needed:**
- Restore Stripe payment option on main checkout
- Customer sees real products, but Stripe processes payment
- Payment intent should be created with compliant product names in metadata
- Order should be saved with real product information

### Key Files Modified Today

1. `src/pages/NewCheckoutPage.tsx` - Main checkout (needs Stripe restored)
2. `src/pages/StripeSecureCheckoutPage.tsx` - Shadow page (working)
3. `src/components/StripeCheckout.tsx` - Stripe checkout component
4. `src/components/StripePaymentForm.tsx` - Payment form component
5. `supabase/functions/create-payment-intent/index.ts` - Cart payment intent
6. `supabase/functions/stripe-payment-intent/index.ts` - Single product payment intent
7. `src/AppRouter.tsx` - Routing logic

### Environment Variables

- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_STRIPE_HOSTS` - Comma-separated list of Stripe subdomains (default: `pay.streamstickpro.com`)
- `STRIPE_SECRET_KEY` - Stripe secret key (in Supabase secrets or env)

### Database Tables

1. **`stripe_products`** - Cloaked products for Stripe
2. **`real_products`** - Real products for customers
3. **`orders`** - Order records
4. **`site_settings`** - Stripe keys stored here

### Payment Flow (How It Should Work)

1. Customer browses main site → sees real products
2. Customer adds to cart → real products stored in localStorage
3. Customer goes to `/checkout` → sees real products in cart
4. Customer selects Stripe payment → creates payment intent
5. Payment intent created with:
   - Real product names in order metadata
   - Compliant product names in Stripe metadata (for compliance)
6. Customer completes payment → order saved with real products
7. Stripe only sees compliant product names in their system

### What Needs to Be Fixed

1. ✅ Remove all Square references (DONE)
2. ✅ Restore Stripe on main checkout page (IN PROGRESS)
3. ⚠️ Ensure payment intent includes both real and cloaked product info
4. ⚠️ Verify order saving works correctly
5. ⚠️ Test payment flow end-to-end







