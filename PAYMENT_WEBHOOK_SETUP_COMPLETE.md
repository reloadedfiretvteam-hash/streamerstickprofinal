# ✅ Payment Webhook Setup - Complete

## 🎯 What Was Implemented

A **dedicated Stripe payment webhook handler** that:
- ✅ Only handles **paid purchases** (not free trials)
- ✅ Sends **confirmation emails to customers** via Resend
- ✅ Sends **notification emails to owner** via Resend
- ✅ Uses **Stripe metadata** for product info (cloaked pages don't affect it)
- ✅ Completely separate from free trial logic

## 📁 Files Created/Modified

### New Files:
- `server/paymentWebhookHandler.ts` - Dedicated payment webhook handler
- `scripts/setup-payment-webhook-env.mjs` - Cloudflare environment setup script
- `scripts/test-payment-webhook.mjs` - Testing script

### Modified Files:
- `server/webhookHandlers.ts` - Updated to use new payment handler
- Existing EmailService emails still work for detailed credentials emails

## 🔧 How It Works

### Flow for Paid Purchases:

1. **Stripe sends webhook** → `checkout.session.completed` or `payment_intent.succeeded`
2. **Payment handler runs first**:
   - Checks if it's a paid purchase (not free trial)
   - Gets product name from Stripe metadata (not page URLs)
   - Sends confirmation email to customer
   - Sends notification email to owner
3. **Existing handler runs after**:
   - Updates order in database
   - Generates credentials
   - Sends detailed credentials email (scheduled)

### Key Features:

- **Uses Metadata**: Product name comes from `session.metadata.product_name` or `session.metadata.realProductName`
- **Ignores Free Trials**: Checks `session.metadata.trial === 'true'` or `amount_total === 0`
- **Separate from Free Trials**: Free trial emails handled elsewhere, never mixed
- **Error Handling**: Email failures don't break webhook processing

## 🔑 Environment Variables Required

### Cloudflare Pages Environment Variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `RESEND_API_KEY` | Resend API key | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Email sender address | `noreply@streamstickpro.com` |
| `OWNER_EMAIL` | Owner notification email | `reloadedfiretvteam@gmail.com` |

### Already Set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## 🚀 Setup Steps

### 1. Get Required Keys

**Stripe Webhook Secret:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint
3. Click on it
4. Copy the "Signing secret" (starts with `whsec_`)

**Resend API Key:**
1. Go to: https://resend.com/api-keys
2. Copy your API key (starts with `re_`)

**Supabase Service Role Key:**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api
2. Copy the "service_role" key (⚠️ Keep secret!)

### 2. Set Up Cloudflare Environment Variables

**Option A: Via Script (Recommended)**
```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_API_TOKEN=your_api_token
export STRIPE_WEBHOOK_SECRET=whsec_...
export RESEND_API_KEY=re_...
export SUPABASE_SERVICE_ROLE_KEY=eyJ...

node scripts/setup-payment-webhook-env.mjs
```

**Option B: Manual Setup**
1. Go to: https://dash.cloudflare.com
2. Navigate to: **Pages** → **streamerstickprofinal** → **Settings** → **Environment Variables**
3. Add each variable listed above
4. Click **Save**
5. Trigger a new deployment

### 3. Verify Stripe Webhook Configuration

1. Go to: https://dashboard.stripe.com/webhooks
2. Ensure your webhook endpoint is:
   - `https://streamstickpro.com/api/stripe/webhook` (or your domain)
   - Events selected: `checkout.session.completed`, `payment_intent.succeeded`
   - Status: **Enabled**

### 4. Test the Webhook

**Option A: Stripe Dashboard**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook
3. Click **"Send test webhook"**
4. Select: `checkout.session.completed`
5. Check emails are received

**Option B: Test Script**
```bash
node scripts/test-payment-webhook.mjs
```

**Option C: Real Test Payment**
1. Make a test purchase with card: `4242 4242 4242 4242`
2. Check customer email for confirmation
3. Check owner email for notification
4. Verify in Stripe Dashboard → Webhooks → Recent events

## ✅ Verification Checklist

- [ ] Cloudflare environment variables set
- [ ] Stripe webhook endpoint configured
- [ ] Webhook secret in Cloudflare
- [ ] Resend API key in Cloudflare
- [ ] Test webhook sends emails successfully
- [ ] Customer receives confirmation email
- [ ] Owner receives notification email
- [ ] Free trial logic unchanged (still works)
- [ ] Paid purchase emails work
- [ ] Metadata-based product names work (cloaked pages don't matter)

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Resend API Key:**
   - Verify `RESEND_API_KEY` is set correctly in Cloudflare
   - Check Resend dashboard for API key status

2. **Check Email Addresses:**
   - Verify `OWNER_EMAIL` is correct
   - Check customer email in Stripe session

3. **Check Webhook Logs:**
   - View server logs for errors
   - Check Stripe Dashboard → Webhooks → Recent events

### Webhook Not Receiving Events

1. **Verify Endpoint URL:**
   - Check webhook URL matches your domain
   - Ensure endpoint is accessible

2. **Check Webhook Secret:**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
   - Regenerate if needed

3. **Check Event Types:**
   - Ensure `checkout.session.completed` and `payment_intent.succeeded` are selected
   - Enable webhook in Stripe dashboard

### Duplicate Emails

The system is designed to:
- Payment handler sends immediate confirmation
- EmailService sends detailed credentials email later
- This is intentional - customer gets both confirmation and credentials

If you want to disable the EmailService emails, modify `server/webhookHandlers.ts` to skip those calls.

## 📊 Code Structure

```
server/
├── paymentWebhookHandler.ts    ← New: Dedicated payment handler
├── webhookHandlers.ts          ← Updated: Uses payment handler
├── emailService.ts             ← Unchanged: Still sends credentials emails
└── resendClient.ts             ← Unchanged: Resend client setup

scripts/
├── setup-payment-webhook-env.mjs  ← New: Cloudflare setup
└── test-payment-webhook.mjs       ← New: Testing script
```

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Customer receives immediate confirmation email after payment
- ✅ Owner receives notification email with order details
- ✅ Emails include correct product names (from metadata)
- ✅ Free trials still work (separate logic)
- ✅ Cloaked pages don't affect email content
- ✅ Webhook events show as successful in Stripe dashboard

---

**Status**: ✅ Implementation Complete | Ready for Testing

