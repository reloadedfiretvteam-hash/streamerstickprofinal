# 🔍 Quick Guide: Check Your Stripe Webhook

## Option 1: Use the Script (Easiest)

I've created a script that will check your Stripe webhooks for you.

### Steps:

1. **Set your Stripe secret key:**
   
   **Windows PowerShell:**
   ```powershell
   $env:STRIPE_SECRET_KEY="sk_live_YOUR_SECRET_KEY_HERE"
   ```
   
   **Or if you have it in your environment already, just run:**
   ```powershell
   npx tsx check-stripe-webhook.ts
   ```

2. **Run the script:**
   ```powershell
   npx tsx check-stripe-webhook.ts
   ```

3. **The script will tell you:**
   - ✅ Which webhook is correct (Cloudflare)
   - ❌ Which webhook is old (Supabase)
   - What to do next

---

## Option 2: Check Manually in Stripe Dashboard

### Step 1: Go to Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. You'll see a list of webhook endpoints

### Step 2: Look at the URLs

**Find the webhook URL** - it will look like one of these:

#### ❌ OLD ONE (Supabase) - Delete this:
```
https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
                    ↑
           This is the OLD one!
```

#### ✅ NEW ONE (Cloudflare) - Keep this:
```
https://secure.streamstickpro.com/api/stripe/webhook
                    ↑
           This is the CORRECT one!
```

### Step 3: What You'll See

The dashboard will show something like:

```
┌─────────────────────────────────────────────────────────────┐
│ Webhook Endpoints                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. https://emlqlmfzqsnqokrqvmcm.supabase.co/...            │
│    Status: Enabled                                          │
│    [Delete] [Edit]                                          │
│                                                              │
│ 2. https://secure.streamstickpro.com/api/stripe/webhook    │
│    Status: Enabled                                          │
│    [Delete] [Edit]                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**If you see #1 (with supabase.co):**
- ❌ That's the OLD one - DELETE IT

**If you see #2 (with streamstickpro.com):**
- ✅ That's the CORRECT one - KEEP IT

---

## 🎯 Quick Decision Guide

**Ask yourself:**
- Does the URL contain `supabase.co`? → ❌ OLD - Delete it
- Does the URL contain `streamstickpro.com`? → ✅ NEW - Keep it
- Does it have `/functions/v1/`? → ❌ OLD - Delete it
- Does it have `/api/stripe/webhook`? → ✅ NEW - Keep it

---

## 🔧 What to Do Based on What You Find

### Scenario A: Only Supabase Webhook ❌
**Action:** Delete it, create new Cloudflare webhook

### Scenario B: Only Cloudflare Webhook ✅
**Action:** Perfect! You're all set!

### Scenario C: Both Webhooks ⚠️
**Action:** Delete Supabase one, keep Cloudflare one

---

## 📝 Need Your Stripe Secret Key?

Your publishable key is:
```
pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8
```

But to check webhooks, you need your **SECRET KEY** (starts with `sk_live_`).

**Where to find it:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Find "Secret key" (not publishable key)
3. Click "Reveal test key" or "Reveal live key"
4. Copy it (starts with `sk_live_`)

**⚠️ Keep your secret key private! Never share it publicly!**

---

## ✅ After You Check

Once you know which webhook you have, let me know:
- Do you see the Supabase webhook? (old one)
- Do you see the Cloudflare webhook? (new one)
- Which one should we keep/delete?

Then I can help you fix it! 🚀

