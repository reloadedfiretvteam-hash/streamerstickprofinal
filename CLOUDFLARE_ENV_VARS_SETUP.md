# 🌐 CLOUDFLARE ENVIRONMENT VARIABLES SETUP

## 📋 Quick Copy-Paste Guide

Use these exact values in Cloudflare Pages → Settings → Environment Variables:

---

## ✅ REQUIRED VARIABLES (All with `VITE_` prefix)

### 1. Supabase Configuration

**Variable Name:** `VITE_SUPABASE_URL`  
**Value:** `https://emlqlmfzqsnqokrqvmcm.supabase.co`  
**Type:** Secret

---

**Variable Name:** `VITE_SUPABASE_ANON_KEY`  
**Value:** `[REDACTED — use Supabase Dashboard → Settings → API → Project API keys]`  
**Type:** Secret

---

### 2. Stripe Configuration

**Variable Name:** `VITE_STRIPE_PUBLISHABLE_KEY`  
**Value:** `pk_live_...` (Get from Stripe Dashboard → Developers → API Keys)  
**Type:** Secret  
**Note:** You need to get your publishable key from Stripe Dashboard

---

### 3. Storage Configuration

**Variable Name:** `VITE_STORAGE_BUCKET_NAME`  
**Value:** `images`  
**Type:** Plain Text

---

## 📝 STEP-BY-STEP INSTRUCTIONS

1. **Go to Cloudflare Dashboard:**
   - Navigate to: https://dash.cloudflare.com
   - Select your project/website

2. **Navigate to Environment Variables:**
   - Go to **Pages** → **Your Project** → **Settings** → **Environment Variables**

3. **Add Each Variable:**
   - Click **"Add variable"**
   - Enter variable name (exactly as shown above)
   - Enter value
   - Select type (Secret or Plain Text)
   - Click **"Save"**

4. **Redeploy:**
   - After adding all variables, trigger a new deployment
   - Go to **Deployments** → **Retry deployment** or push new code

---

## ⚠️ IMPORTANT NOTES

- **ALL variables MUST start with `VITE_` prefix** (this is a Vite/React project)
- **Use Secret type** for sensitive keys (Supabase keys, Stripe keys)
- **Use Plain Text** for non-sensitive values (bucket name)
- **After adding variables, redeploy** your site for changes to take effect

---

## ✅ VERIFICATION

After setting up variables, verify they're working:

1. Check browser console (should not show Supabase warnings)
2. Test checkout page (should load Stripe payment form)
3. Check network tab (should see successful Supabase API calls)

---

**Status:** Ready to configure ✅






