# 🔍 EMAIL DIAGNOSTIC: Product Purchase Emails Not Working

## Problem Summary
- ✅ **Free Trial Emails**: Working perfectly
- ❌ **Product Purchase Emails**: NOT working (neither customer nor owner receives emails)

---

## 🎯 ROOT CAUSE ANALYSIS

### Why Free Trials Work
**File:** `worker/routes/trial.ts`
- Direct POST endpoint: `/api/free-trial`
- Called directly from frontend
- Uses Resend API: `new Resend(c.env.RESEND_API_KEY)`
- Emails sent immediately

### Why Product Purchases Don't Work
**Files:** `worker/routes/webhook.ts` + `worker/email.ts`
- Depends on Stripe webhook events
- Webhook handler processes `checkout.session.completed` event
- **MOST LIKELY CAUSE:** Stripe webhook URL pointing to wrong endpoint

---

## 🔍 HYPOTHESES TO TEST

### Hypothesis A: Webhook Not Reaching Cloudflare Worker ✅ INSTRUMENTED
**Test:** Check if webhooks are being received
- **Instrumentation Added:** Logs webhook reception, event type, email sending attempts
- **Expected:** If webhook not received, logs will show no webhook activity
- **Action:** Verify Stripe Dashboard → Webhooks → URL

### Hypothesis B: Missing Stripe Signature ✅ INSTRUMENTED  
**Test:** Check if signature validation passes
- **Instrumentation Added:** Logs signature presence and validation
- **Expected:** Should pass if webhook secret configured correctly

### Hypothesis C: Webhook Secret Not Configured ✅ INSTRUMENTED
**Test:** Check if STRIPE_WEBHOOK_SECRET exists
- **Instrumentation Added:** Logs webhook secret configuration status
- **Expected:** Should be configured in Cloudflare

### Hypothesis D: Signature Verification Failed ✅ INSTRUMENTED
**Test:** Check if Stripe signature verification succeeds
- **Instrumentation Added:** Logs signature verification errors
- **Expected:** Should pass if webhook secret matches Stripe

### Hypothesis E: Wrong Event Type ✅ INSTRUMENTED
**Test:** Check what event types are being received
- **Instrumentation Added:** Logs all event types received
- **Expected:** Should receive `checkout.session.completed` or `payment_intent.succeeded`

### Hypothesis F: Error Processing Event ✅ INSTRUMENTED
**Test:** Check if errors occur during event processing
- **Instrumentation Added:** Logs all processing errors with stack traces
- **Expected:** Should process without errors

### Hypothesis G: Unexpected Webhook Error ✅ INSTRUMENTED
**Test:** Check for unexpected errors
- **Instrumentation Added:** Top-level error handler logs

### Hypothesis H: Order Not Found ✅ INSTRUMENTED
**Test:** Check if order exists in database when webhook processes
- **Instrumentation Added:** Logs when order not found for session
- **Expected:** Order should exist if checkout completed successfully

### Hypothesis I: Order Confirmation Email Failed ✅ INSTRUMENTED
**Test:** Check if sendOrderConfirmation throws errors
- **Instrumentation Added:** Logs email sending attempts and failures
- **Expected:** Should send successfully

### Hypothesis J: Owner Notification Failed ✅ INSTRUMENTED
**Test:** Check if sendOwnerOrderNotification throws errors
- **Instrumentation Added:** Logs owner notification attempts and failures

### Hypothesis K: Credentials Email Failed ✅ INSTRUMENTED
**Test:** Check if sendCredentialsEmail throws errors
- **Instrumentation Added:** Logs credentials email attempts and failures

### Hypothesis L: Credentials Already Sent ✅ INSTRUMENTED
**Test:** Check if credentials already marked as sent
- **Instrumentation Added:** Logs when credentials already sent (skips)

### Hypothesis M: Missing Customer Email ✅ INSTRUMENTED
**Test:** Check if order has customer email
- **Instrumentation Added:** Logs when customerEmail is missing
- **Expected:** Should have email from checkout session

### Hypothesis N: RESEND_API_KEY Missing ✅ INSTRUMENTED
**Test:** Check if RESEND_API_KEY is configured
- **Instrumentation Added:** Logs RESEND_API_KEY presence before sending
- **Expected:** Should be configured (free trials work, so likely is)

### Hypothesis O: Resend API Error ✅ INSTRUMENTED
**Test:** Check if Resend API throws errors
- **Instrumentation Added:** Logs Resend API errors with full details
- **Expected:** Should succeed if API key is valid

---

## 📋 VERIFICATION STEPS

### Step 1: Verify Stripe Webhook Configuration

**CRITICAL:** Check which webhook URL Stripe is using:

1. Go to: https://dashboard.stripe.com/webhooks
2. Find your active webhook endpoint
3. **Check the URL:**
   - ❌ **WRONG:** `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
   - ✅ **CORRECT:** `https://secure.streamstickpro.com/api/stripe/webhook`

**If URL is WRONG:**
- Delete the old Supabase webhook
- Create new webhook pointing to Cloudflare Worker
- Copy the webhook secret (whsec_...)
- Add as `STRIPE_WEBHOOK_SECRET` in Cloudflare

### Step 2: Check Cloudflare Environment Variables

**In Cloudflare Pages Dashboard:**
1. Go to: Settings → Environment Variables
2. **Verify these exist:**
   - ✅ `RESEND_API_KEY` (starts with `re_`)
   - ✅ `RESEND_FROM_EMAIL` (should be `noreply@streamstickpro.com`)
   - ✅ `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
   - ✅ `STRIPE_SECRET_KEY` (starts with `sk_`)

### Step 3: Test Webhook Endpoint

**Visit this URL in your browser:**
```
https://secure.streamstickpro.com/api/debug/webhook-test
```

**Should show:**
- ✅ `hasWebhookSecret: true`
- ✅ `hasResendKey: true`
- ✅ `hasFromEmail: true`

### Step 4: Make a Test Purchase

1. Add product to cart
2. Complete checkout with Stripe test card
3. **Check logs:**
   - Visit: `https://secure.streamstickpro.com/.cursor/debug.log` (if accessible)
   - Or check Cloudflare Worker logs
   - Look for `[WEBHOOK]` and `[EMAIL]` log entries

---

## 🔧 LIKELY FIX

**99% Likely Issue:** Stripe webhook pointing to Supabase instead of Cloudflare Worker

**Fix:**
1. Update Stripe webhook URL to: `https://secure.streamstickpro.com/api/stripe/webhook`
2. Ensure events include: `checkout.session.completed` and `payment_intent.succeeded`
3. Copy webhook secret and add to Cloudflare as `STRIPE_WEBHOOK_SECRET`

**Once fixed, product purchase emails will work because they use the same Resend setup as free trials!**

---

## 📊 INSTRUMENTATION ADDED

I've added comprehensive logging to track:
- Webhook reception
- Event type processing
- Order lookup
- Email sending attempts
- All errors with stack traces

**After making a test purchase, check logs to see exactly where the flow breaks.**

