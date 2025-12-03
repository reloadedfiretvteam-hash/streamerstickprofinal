# 🔔 STRIPE WEBHOOK SETUP GUIDE

## 📋 Overview

This guide will help you set up Stripe webhooks to receive payment events and update your database automatically.

---

## 🎯 STEP 1: CREATE WEBHOOK ENDPOINT

### Go to Stripe Dashboard:

1. **Navigate to Webhooks:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click **"Add endpoint"** button

2. **Enter Endpoint URL:**
   ```
   https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
   ```
   
   **Important:** Use your exact Supabase project URL

3. **Select Events to Listen To:**
   
   Check these events:
   - ✅ `payment_intent.succeeded` - Payment completed successfully
   - ✅ `payment_intent.payment_failed` - Payment failed
   - ✅ `payment_intent.canceled` - Payment canceled
   - ✅ `payment_intent.processing` - Payment is processing
   - ✅ `payment_intent.created` - Payment intent created

4. **Click "Add endpoint"**

---

## 🔑 STEP 2: GET WEBHOOK SIGNING SECRET

### After Creating Webhook:

1. **Click on the webhook** you just created
2. **Find "Signing secret"** section
3. **Click "Reveal"** to show the secret
4. **Copy the secret** (starts with `whsec_...`)

**Example format:** `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

---

## 🔐 STEP 3: ADD SECRET TO SUPABASE

### Add to Supabase Edge Functions Secrets:

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings

2. **Add Secret:**
   - Secret Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (the secret you copied from Stripe)
   - Click **"Save"**

---

## ✅ STEP 4: VERIFY WEBHOOK

### Test Webhook:

1. **Go to Stripe Dashboard → Webhooks**
2. **Click on your webhook**
3. **Click "Send test webhook"**
4. **Select event:** `payment_intent.succeeded`
5. **Click "Send test webhook"**

### Check Supabase Logs:

1. **Go to Supabase Dashboard → Edge Functions**
2. **Click on `stripe-webhook` function**
3. **Click "Logs" tab**
4. **Verify** you see the test webhook event logged

---

## 🧪 STEP 5: TEST WITH REAL PAYMENT

### Test Payment Flow:

1. **Use Stripe Test Card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)

2. **Complete a test payment** on your checkout page

3. **Verify in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/payments
   - Find your test payment
   - Check webhook delivery status

4. **Verify in Supabase:**
   - Check `payment_transactions` table for new record
   - Check Edge Function logs for webhook events

---

## 🔍 WEBHOOK EVENTS HANDLED

### `payment_intent.succeeded`
- ✅ Payment completed successfully
- ✅ Creates record in `payment_transactions` table
- ✅ Status: `confirmed`

### `payment_intent.payment_failed`
- ✅ Payment failed
- ✅ Creates record in `payment_transactions` table
- ✅ Status: `failed`

### `payment_intent.canceled`
- ✅ Payment canceled
- ✅ Logged for audit purposes

### `payment_intent.processing`
- ✅ Payment is processing
- ✅ Logged for status tracking

### `payment_intent.created`
- ✅ Payment intent created
- ✅ Logged for tracking

---

## 🐛 TROUBLESHOOTING

### Webhook Not Receiving Events

**Check:**
1. ✅ Webhook endpoint URL is correct
2. ✅ Events are selected in Stripe
3. ✅ Webhook is enabled (not paused)
4. ✅ Supabase Edge Function is deployed

### "Invalid signature" Error

**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` in Supabase matches Stripe signing secret
2. Make sure you copied the entire secret (starts with `whsec_...`)
3. Check for extra spaces or characters

### Webhook Events Not Appearing in Database

**Check:**
1. ✅ `payment_transactions` table exists
2. ✅ Edge Function logs for errors
3. ✅ Database permissions allow inserts

---

## 📊 WEBHOOK MONITORING

### View Webhook Activity:

1. **Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on your webhook
   - View "Recent events" tab

2. **Supabase Logs:**
   - Go to: Edge Functions → `stripe-webhook` → Logs
   - View function invocations and responses

---

## 🔄 UPDATING WEBHOOK

### To Update Webhook URL:

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Click **"Edit"**
4. Update endpoint URL
5. Click **"Save"**

### To Add More Events:

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Click **"Edit"**
4. Select additional events
5. Click **"Save"**

---

## ✅ CHECKLIST

- [ ] Webhook endpoint created in Stripe
- [ ] Endpoint URL is correct
- [ ] Events selected (payment_intent.*)
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Supabase
- [ ] Test webhook sent successfully
- [ ] Real payment test completed
- [ ] Database records created correctly

---

**Status:** Ready to configure ✅






