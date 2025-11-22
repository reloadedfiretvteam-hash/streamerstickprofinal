# 🔒 SQUARE SECURE DOMAIN SETUP FOR BOLT

**Important:** The user has a secure subdomain for Square payment processing

---

## 🔒 SECURE DOMAIN INFORMATION

**Secure Subdomain for Square Payments:**
- **Domain:** `secure.streamstickpro.com` (or similar secure subdomain)
- **Purpose:** Square payment processing / Concierge landing page
- **Component:** `ConciergePage.tsx` or `ConciergeLanding.tsx`

---

## 📋 WHAT BOLT NEEDS TO KNOW

### Square Payment Setup:
1. ✅ **Payment Processor:** Square (NOT Stripe)
2. ✅ **Square Checkout Component:** `src/components/SquareCheckout.tsx`
3. ✅ **Checkout Page:** `src/pages/NewCheckoutPage.tsx`
4. ✅ **Concierge/Secure Page:** `src/pages/ConciergePage.tsx` or `ConciergeLanding.tsx`

### Secure Domain Configuration:
- The secure subdomain (`secure.streamstickpro.com`) should:
  - Point to the same Cloudflare Pages project
  - Serve the Concierge/secure payment page
  - Be configured in Cloudflare DNS

---

## 🎯 CLOUDFLARE DOMAIN SETUP

**When connecting domains to Cloudflare Pages:**

1. **Main Domain:** `streamstickpro.com`
   - Connects to: `streamerstickprofinal` project
   - Shows: Main website

2. **Secure Subdomain:** `secure.streamstickpro.com`
   - Connects to: Same `streamerstickprofinal` project
   - Shows: Concierge/Square payment page
   - **This is important for Square compliance**

---

## 📝 ROUTING INFORMATION

**The app routes based on domain:**
- Main domain (`streamstickpro.com`) → Shows main website
- Secure subdomain (`secure.streamstickpro.com`) → Shows Concierge/Secure page

**Files involved:**
- `src/AppRouter.tsx` - Handles routing
- `src/pages/ConciergePage.tsx` - Secure/concierge page
- `src/pages/NewCheckoutPage.tsx` - Checkout with Square

---

## ⚠️ IMPORTANT FOR BOLT

**When setting up domains in Cloudflare:**
1. Connect main domain: `streamstickpro.com` to `streamerstickprofinal` project
2. **ALSO connect secure subdomain:** `secure.streamstickpro.com` to the SAME project
3. Both domains point to the same project but serve different pages based on routing

---

## 🔧 HOW TO ADD SECURE SUBDOMAIN

1. In Cloudflare Pages project `streamerstickprofinal`
2. Go to "Domains" tab
3. Click "Add custom domain"
4. Enter: `secure.streamstickpro.com`
5. Follow instructions to connect

**OR in Cloudflare DNS:**
1. Go to DNS settings for `streamstickpro.com`
2. Add CNAME record:
   - Name: `secure`
   - Target: `[your-cloudflare-pages-url].pages.dev`
   - Proxy: Enabled (orange cloud)

---

## ✅ VERIFICATION

**After setup, verify:**
- `streamstickpro.com` → Shows main website ✅
- `secure.streamstickpro.com` → Shows Concierge/Secure page ✅
- Square checkout works on secure domain ✅

---

**BOLT: Make sure to set up BOTH the main domain AND the secure subdomain!**

