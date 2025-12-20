# 🚨 STRIPE WEBHOOK EMAIL ISSUE - DIAGNOSIS REPORT

## ✅ WHAT'S WORKING
- **Free Trial Emails**: Working perfectly ✅
  - Located in: `worker/routes/trial.ts`
  - Direct POST endpoint: `/api/free-trial`
  - Uses Resend API directly
  - Sends emails immediately when form is submitted

## ❌ THE PROBLEM

### Root Cause
Your Stripe webhook is pointing to the **WRONG endpoint**. You have TWO webhook handlers:

1. **OLD/UNUSED**: Supabase Edge Function ❌
   - Location: `supabase/functions/stripe-webhook/index.ts`
   - URL: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
   - **This is what Stripe is currently configured to use**
   - This function tries to call other Supabase functions for emails
   - Does NOT use your working Resend setup

2. **CORRECT/CURRENT**: Cloudflare Worker ✅
   - Location: `worker/routes/webhook.ts`
   - URL: `https://secure.streamstickpro.com/api/stripe/webhook`
   - **This is what SHOULD be configured in Stripe**
   - Uses the same Resend email system as free trials
   - Has proper email sending code for product purchases

### Why Product Purchase Emails Don't Work

**Current Flow (BROKEN):**
```
Customer Purchase → Stripe Checkout → Payment Complete
    ↓
Stripe sends webhook to: Supabase Edge Function ❌
    ↓
Supabase function tries to send emails via Supabase email functions
    ↓
Emails don't get sent (different system, may not be configured)
```

**Correct Flow (SHOULD BE):**
```
Customer Purchase → Stripe Checkout → Payment Complete
    ↓
Stripe sends webhook to: Cloudflare Worker ✅
    ↓
worker/routes/webhook.ts processes checkout.session.completed
    ↓
Calls worker/email.ts → Uses Resend API (same as free trials)
    ↓
✅ Customer gets confirmation email
✅ Customer gets credentials email (5 min delay)
✅ Owner gets notification email
```

## 🔧 THE FIX

### Step 1: Update Stripe Webhook URL

**Go to Stripe Dashboard:**
1. Navigate to: https://dashboard.stripe.com/webhooks
2. Find your current webhook (the one pointing to Supabase)
3. Click on it → Click "..." → "Update details"
4. Change the endpoint URL to:
   ```
   https://secure.streamstickpro.com/api/stripe/webhook
   ```
5. Make sure these events are selected:
   - ✅ `checkout.session.completed` (REQUIRED for emails)
   - ✅ `payment_intent.succeeded` (REQUIRED for emails)
   - ✅ `payment_intent.payment_failed`
6. Click "Update endpoint"

### Step 2: Verify Cloudflare Environment Variables

**Go to Cloudflare Pages:**
1. Navigate to: Your Project → Settings → Environment Variables
2. Verify these exist and are set correctly:

| Variable Name | What It Should Be |
|--------------|-------------------|
| `STRIPE_WEBHOOK_SECRET` | Your webhook signing secret (starts with `whsec_`) |
| `RESEND_API_KEY` | Your Resend API key (starts with `re_`) |
| `RESEND_FROM_EMAIL` | `noreply@streamstickpro.com` (or your verified email) |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with `sk_live_`) |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |

### Step 3: Get the Webhook Secret

After updating the webhook URL in Stripe:
1. In Stripe webhook settings, click on your webhook
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add/update it in Cloudflare: `STRIPE_WEBHOOK_SECRET`

### Step 4: Test the Webhook

1. Go back to Stripe Dashboard → Webhooks
2. Click your webhook (now with correct URL)
3. Click "Send test webhook"
4. Select: `checkout.session.completed`
5. Click "Send test webhook"
6. Check if it shows "Success" ✅

### Step 5: Make a Test Purchase

1. Go to your website
2. Add a product to cart
3. Complete checkout (use test card if in test mode)
4. Check:
   - ✅ Order confirmation email arrives immediately
   - ✅ Credentials email arrives within 5 minutes
   - ✅ Owner notification email arrives

## 📋 CODE ANALYSIS

### How Free Trials Work (WORKING ✅)

**File**: `worker/routes/trial.ts`
- Direct POST request to `/api/free-trial`
- Creates Resend client: `new Resend(c.env.RESEND_API_KEY)`
- Sends emails immediately using `resend.emails.send()`
- Uses same environment variables as product purchases

### How Product Purchases Should Work

**File**: `worker/routes/webhook.ts`
- Handles Stripe webhook at `/api/stripe/webhook`
- Processes `checkout.session.completed` event
- Calls `sendOrderConfirmation()` from `worker/email.ts`
- Calls `sendCredentialsEmail()` from `worker/email.ts`
- Uses same Resend setup as free trials

**File**: `worker/email.ts`
- `sendOrderConfirmation()` - Sends immediate order confirmation
- `sendCredentialsEmail()` - Sends credentials with YouTube video
- `sendOwnerOrderNotification()` - Notifies owner
- All use: `new Resend(env.RESEND_API_KEY)`

## 🔍 VERIFICATION CHECKLIST

Before reporting it's fixed, verify:

- [ ] Stripe webhook URL is: `https://secure.streamstickpro.com/api/stripe/webhook`
- [ ] Webhook events include: `checkout.session.completed` and `payment_intent.succeeded`
- [ ] `STRIPE_WEBHOOK_SECRET` exists in Cloudflare (matches Stripe webhook secret)
- [ ] `RESEND_API_KEY` exists in Cloudflare (starts with `re_`)
- [ ] `RESEND_FROM_EMAIL` exists in Cloudflare
- [ ] Test webhook shows "Success" in Stripe dashboard
- [ ] Test purchase sends confirmation email immediately
- [ ] Test purchase sends credentials email within 5 minutes

## 💡 KEY INSIGHT

The free trial emails work because they're **direct API calls** to your Cloudflare Worker, which uses Resend correctly.

Product purchase emails don't work because Stripe is sending webhooks to the **old Supabase endpoint**, which doesn't use your Resend setup.

**Once you point Stripe to the correct Cloudflare Worker endpoint, product purchase emails will work exactly like free trial emails because they use the same code path!**

