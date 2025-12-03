# 🔐 SUPABASE EDGE FUNCTIONS SECRETS SETUP

## 📋 Quick Copy-Paste Guide

Add these secrets in Supabase Dashboard → Edge Functions → Settings → Secrets:

---

## ✅ REQUIRED SECRETS

### 1. Stripe Configuration

**Secret Name:** `STRIPE_SECRET_KEY`  
**Value:** `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`  
**Description:** Stripe Live Secret Key for payment processing

---

### 2. Stripe Webhook (Set after webhook creation)

**Secret Name:** `STRIPE_WEBHOOK_SECRET`  
**Value:** `whsec_...` (Get from Stripe Dashboard after creating webhook)  
**Description:** Stripe webhook signing secret for signature verification

**How to get:**
1. Create webhook in Stripe Dashboard (see STRIPE_WEBHOOK_SETUP.md)
2. Copy the "Signing secret" (starts with `whsec_...`)
3. Paste here

---

### 3. Supabase Configuration

**Secret Name:** `SUPABASE_URL`  
**Value:** `https://emlqlmfzqsnqokrqvmcm.supabase.co`  
**Description:** Your Supabase project URL

---

**Secret Name:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** (Get from Supabase Dashboard → Settings → API → service_role key)  
**Description:** Supabase service role key (⚠️ Keep secret!)

**How to get:**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api
2. Find **"service_role" key** (under "Project API keys")
3. Click **"Reveal"** to show the key
4. Copy the entire key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## 📝 STEP-BY-STEP INSTRUCTIONS

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions

2. **Navigate to Secrets:**
   - Click **"Settings"** or **"Secrets"** in the left sidebar
   - Or go directly to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings

3. **Add Each Secret:**
   - Click **"Add secret"** or **"New secret"**
   - Enter secret name (exactly as shown above)
   - Enter value
   - Click **"Save"** or **"Add"**

4. **Verify Secrets:**
   - All secrets should appear in the list
   - Make sure names match exactly (case-sensitive)

---

## ⚠️ IMPORTANT NOTES

- **Secret names are case-sensitive** - use exact names shown above
- **Do NOT share service role key** - it has full database access
- **Webhook secret** must be set AFTER creating the webhook in Stripe
- **Secrets are available** to all Edge Functions automatically

---

## ✅ VERIFICATION

After setting up secrets, test Edge Functions:

1. **Test stripe-payment-intent:**
   ```bash
   curl -X POST https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-payment-intent \
     -H "Content-Type: application/json" \
     -d '{"realProductId": "test-id", "customerEmail": "test@example.com", "customerName": "Test"}'
   ```

2. **Check Edge Function logs:**
   - Go to Edge Functions → Select function → Logs
   - Should not show "Missing env vars" errors

---

## 🔄 UPDATING SECRETS

If you need to update a secret:

1. Go to Edge Functions → Settings → Secrets
2. Find the secret you want to update
3. Click **"Edit"** or **"Update"**
4. Enter new value
5. Click **"Save"**

**Note:** Changes take effect immediately for new function invocations.

---

**Status:** Ready to configure ✅






