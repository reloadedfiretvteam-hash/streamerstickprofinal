# 🔍 How to Identify Old vs New Webhook

## Quick Answer

**OLD/WRONG Webhook URL:**
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
```
☝️ This is Supabase - **DELETE THIS ONE** ❌

**NEW/CORRECT Webhook URL:**
```
https://secure.streamstickpro.com/api/stripe/webhook
```
☝️ This is Cloudflare Worker - **USE THIS ONE** ✅

---

## 📋 Step-by-Step: How to Check in Stripe Dashboard

### Step 1: Go to Stripe Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. You'll see a list of webhook endpoints

### Step 2: Look at the URLs

You'll see webhook endpoints listed. Look at the **URL** column:

#### ❌ OLD ONE (Supabase) - DELETE THIS:
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
                    ↑
            This tells you it's Supabase!
```

**Signs it's the old one:**
- Contains `supabase.co`
- Contains `/functions/v1/`
- Has a long project ID: `emlqlmfzqsnqokrqvmcm`

#### ✅ NEW ONE (Cloudflare) - KEEP THIS:
```
https://secure.streamstickpro.com/api/stripe/webhook
                    ↑
          This is your domain!
```

**Signs it's the correct one:**
- Uses your domain: `streamstickpro.com`
- Has `/api/stripe/webhook` path
- No mention of Supabase

---

## 🎯 What You'll See in Stripe Dashboard

### Example 1: OLD Supabase Webhook ❌
```
┌──────────────────────────────────────────────────────────────┐
│ Webhook Endpoints                                             │
├──────────────────────────────────────────────────────────────┤
│ URL: https://emlqlmfzqsnqokrqvmcm.supabase.co/...            │
│ Status: Enabled                                               │
│ Events: checkout.session.completed, payment_intent.succeeded  │
│                                                               │
│ [Delete] [Edit]                                              │
└──────────────────────────────────────────────────────────────┘
```
☝️ **This is OLD - Delete it!**

### Example 2: NEW Cloudflare Webhook ✅
```
┌──────────────────────────────────────────────────────────────┐
│ Webhook Endpoints                                             │
├──────────────────────────────────────────────────────────────┤
│ URL: https://secure.streamstickpro.com/api/stripe/webhook    │
│ Status: Enabled                                               │
│ Events: checkout.session.completed, payment_intent.succeeded  │
│                                                               │
│ [Delete] [Edit]                                              │
└──────────────────────────────────────────────────────────────┘
```
☝️ **This is CORRECT - Keep this one!**

---

## 🔍 Visual Guide: Which is Which?

### Look for these keywords:

| Keyword | What It Means | Action |
|---------|---------------|--------|
| `supabase.co` | ❌ OLD Supabase webhook | DELETE |
| `supabase` | ❌ OLD Supabase webhook | DELETE |
| `/functions/v1/` | ❌ OLD Supabase Edge Function | DELETE |
| `streamstickpro.com` | ✅ NEW Cloudflare webhook | KEEP |
| `/api/stripe/webhook` | ✅ NEW Cloudflare Worker | KEEP |
| `secure.streamstickpro.com` | ✅ NEW Cloudflare domain | KEEP |

---

## 📝 What You Should See

### Scenario 1: Only Supabase Webhook ❌

**If you see ONLY:**
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
```

**Action:**
1. Click on it
2. Click "..." → "Delete webhook"
3. Click "+ Add endpoint"
4. Create new webhook with: `https://secure.streamstickpro.com/api/stripe/webhook`

### Scenario 2: Both Exist ⚠️

**If you see BOTH:**
```
1. https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook  ← DELETE
2. https://secure.streamstickpro.com/api/stripe/webhook                  ← KEEP
```

**Action:**
1. Delete the Supabase one (the first one)
2. Keep the Cloudflare one (the second one)
3. Make sure the Cloudflare one has these events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`

### Scenario 3: Only Cloudflare Webhook ✅

**If you see ONLY:**
```
https://secure.streamstickpro.com/api/stripe/webhook
```

**Action:**
- ✅ Perfect! You're all set!
- Just verify it has the correct events selected

---

## 🛠️ How to Fix It

### Option 1: Delete Old, Create New

1. **Delete old Supabase webhook:**
   - Click on Supabase webhook
   - Click "..." → "Delete webhook"
   - Confirm deletion

2. **Create new Cloudflare webhook:**
   - Click "+ Add endpoint"
   - URL: `https://secure.streamstickpro.com/api/stripe/webhook`
   - Events:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
   - Click "Add endpoint"

3. **Copy webhook secret:**
   - Click on the new webhook
   - Click "Reveal" next to "Signing secret"
   - Copy the secret (starts with `whsec_`)
   - Add to Cloudflare as `STRIPE_WEBHOOK_SECRET`

### Option 2: Update Existing Webhook

1. Click on the Supabase webhook
2. Click "..." → "Update details"
3. Change URL to: `https://secure.streamstickpro.com/api/stripe/webhook`
4. Verify events are selected
5. Click "Update endpoint"
6. Copy new webhook secret
7. Update `STRIPE_WEBHOOK_SECRET` in Cloudflare

---

## ✅ Quick Checklist

When you look at Stripe webhooks, ask yourself:

- [ ] Does the URL contain `supabase.co`? → ❌ OLD (delete it)
- [ ] Does the URL contain `streamstickpro.com`? → ✅ NEW (keep it)
- [ ] Does it have `/functions/v1/`? → ❌ OLD (delete it)
- [ ] Does it have `/api/stripe/webhook`? → ✅ NEW (keep it)

---

## 🎯 Summary

**OLD = Supabase = DELETE:**
- URL contains: `supabase.co`
- Example: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`

**NEW = Cloudflare = KEEP:**
- URL contains: `streamstickpro.com`
- Example: `https://secure.streamstickpro.com/api/stripe/webhook`

**Just look at the URL in Stripe dashboard - if it says "supabase", it's old!** ✅

