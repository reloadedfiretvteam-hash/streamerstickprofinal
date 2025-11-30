# ✅ STRIPE WEBHOOK SETUP - VERIFICATION CHECKLIST

## 🎯 YOU'RE ON THE RIGHT PAGE!

You're in **Stripe Dashboard → Webhooks** - this is correct! You need to verify your webhook is set up properly.

---

## ✅ CHECK YOUR WEBHOOK SETTINGS:

### 1. ENDPOINT URL - VERIFY IT'S CORRECT:

**Your Current URL:**
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
```

**This looks correct!** It's pointing to your Supabase Edge Function.

**Make sure:**
- ✅ The project ID matches your Supabase project (`emlqlmfzqsnqokrqvmcm`)
- ✅ The path is `/functions/v1/stripe-webhook`
- ✅ It uses `https://` (not `http://`)

---

### 2. EVENTS - MUST HAVE THESE SELECTED:

**Required Events:**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.created` (optional, but recommended)
- ✅ `payment_intent.processing` (optional, but recommended)
- ✅ `payment_intent.canceled` (optional, but recommended)

**How to Check:**
1. In Stripe Webhooks page, click on your webhook endpoint
2. Scroll down to **"Events to send"** section
3. Make sure at minimum:
   - `payment_intent.succeeded` is checked ✅
   - `payment_intent.payment_failed` is checked ✅

**If missing, add them:**
1. Click **"Add events"** or **"Select events"**
2. Search for "payment_intent"
3. Check the boxes for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Click **"Add events"** or **"Update"**

---

### 3. API VERSION:

**Your Current:** `2025-11-17.clover`

**This is fine!** Stripe updates API versions, but this should work.

**If you want to update (optional):**
- Click on the API version dropdown
- Select the latest version
- Stripe will warn you if there are breaking changes
- For now, your current version should work fine

---

### 4. WEBHOOK SIGNING SECRET - COPY THIS!

**THIS IS IMPORTANT!** You need to copy the signing secret and add it to Supabase.

1. On the webhook page, find **"Signing secret"** section
2. Click **"Reveal"** or **"Copy"** button
3. It will look like: `whsec_xxxxxxxxxxxxxxxxxxxxx`
4. **Copy this entire secret** (starts with `whsec_`)

---

### 5. ADD SIGNING SECRET TO SUPABASE:

After copying the signing secret:

1. Go to **Supabase Dashboard** → Your Project
2. Click **"Edge Functions"** (left menu)
3. Click **"Secrets"** (or look for "Manage secrets")
4. Check if `STRIPE_WEBHOOK_SECRET` exists:
   - **If it exists:** Click edit and update it
   - **If it doesn't exist:** Click "Add new secret"
5. **Key:** `STRIPE_WEBHOOK_SECRET`
6. **Value:** Paste the signing secret you copied (starts with `whsec_`)
7. Click **"Save"**

---

### 6. TEST THE WEBHOOK:

1. In Stripe Webhooks page
2. Find your webhook endpoint
3. Click **"Send test webhook"** button
4. Select event: `payment_intent.succeeded`
5. Click **"Send test webhook"**
6. Check if it shows **"Success"** or any errors

---

## ✅ COMPLETE CHECKLIST:

**Stripe Webhook Settings:**
- [ ] Endpoint URL is correct: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
- [ ] Event `payment_intent.succeeded` is selected
- [ ] Event `payment_intent.payment_failed` is selected
- [ ] Webhook signing secret is copied (`whsec_...`)

**Supabase Settings:**
- [ ] `STRIPE_WEBHOOK_SECRET` secret is added to Supabase Edge Functions
- [ ] Value matches the signing secret from Stripe
- [ ] `stripe-webhook` Edge Function is deployed

**Testing:**
- [ ] Test webhook sent successfully
- [ ] Check Supabase Edge Function logs for any errors

---

## 🔍 WHAT TO DO RIGHT NOW:

### Step 1: Verify Events
1. Stay on Stripe Webhooks page
2. Click your webhook endpoint
3. Scroll to **"Events to send"**
4. Make sure `payment_intent.succeeded` and `payment_intent.payment_failed` are selected
5. If not, add them

### Step 2: Copy Signing Secret
1. On the same webhook page
2. Find **"Signing secret"**
3. Click **"Reveal"** or **"Copy"**
4. Copy the secret (starts with `whsec_`)

### Step 3: Add to Supabase
1. Go to Supabase Dashboard
2. Edge Functions → Secrets
3. Add or update `STRIPE_WEBHOOK_SECRET` with the copied secret

### Step 4: Test
1. Go back to Stripe
2. Click **"Send test webhook"**
3. Make sure it succeeds

---

## ❓ DO YOU NEED TO CHANGE ANYTHING?

**Probably NOT if:**
- ✅ Your endpoint URL is correct
- ✅ Events are selected
- ✅ Signing secret is in Supabase

**You DO need to check:**
- ✅ Events are selected (especially `payment_intent.succeeded`)
- ✅ Signing secret is copied and added to Supabase
- ✅ Webhook is tested and working

---

## 🎯 SUMMARY:

You're on the right page! Just verify:
1. **Events are selected** (payment_intent.succeeded, payment_intent.payment_failed)
2. **Copy the signing secret** (whsec_...)
3. **Add it to Supabase** as `STRIPE_WEBHOOK_SECRET`
4. **Test the webhook** to make sure it works

**You don't need to change the endpoint URL or API version** - those look correct!

