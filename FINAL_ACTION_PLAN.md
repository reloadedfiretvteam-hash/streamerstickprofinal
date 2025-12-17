# 🎯 FINAL ACTION PLAN - Complete These 3 Steps

## ✅ WHAT I'VE COMPLETED FOR YOU:

### 1. Updated Local Environment ✅
- **Updated `.env` file** with correct Supabase project (emlqlmfzqsnqokrqvmcm)
- **Added Stripe publishable key** to .env
- **Built the site** with new credentials
- **Pushed to GitHub** (branch: clean-main)

### 2. Verified Function Files ✅
All 4 Supabase Edge Functions exist and are ready:
- ✅ `stripe-payment-intent` (107 lines)
- ✅ `stripe-webhook` (427 lines) 
- ✅ `send-order-emails` (176 lines)
- ✅ `send-credentials-email` (264 lines)

### 3. Created Deployment Guides ✅
- ✅ Complete step-by-step guides
- ✅ Copy-paste value files
- ✅ Deployment checklists

---

## 🚨 WHAT YOU NEED TO DO NOW (3 Simple Steps):

### STEP 1: Deploy Supabase Functions (10 minutes)

**Option A: Via Supabase CLI (Recommended)**

```powershell
# Install Supabase CLI (run as Administrator)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases

# Login to Supabase
supabase login

# Deploy all 4 functions
supabase functions deploy stripe-payment-intent --project-ref emlqlmfzqsnqokrqvmcm
supabase functions deploy stripe-webhook --project-ref emlqlmfzqsnqokrqvmcm
supabase functions deploy send-order-emails --project-ref emlqlmfzqsnqokrqvmcm
supabase functions deploy send-credentials-email --project-ref emlqlmfzqsnqokrqvmcm
```

**Option B: Via Dashboard (If CLI doesn't work)**

1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
2. Login with: reloadedfiretvteam@gmail.com / Starevan11$
3. For each function:
   - Click "Create a new function"
   - Enter function name (e.g., `stripe-payment-intent`)
   - Open local file: `supabase/functions/[function-name]/index.ts`
   - Copy ALL the code
   - Paste into Supabase editor
   - Click "Deploy function"

---

### STEP 2: Set Supabase Secrets (5 minutes)

**Via CLI:**
```powershell
supabase secrets set STRIPE_SECRET_KEY=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 --project-ref emlqlmfzqsnqokrqvmcm

supabase secrets set SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co --project-ref emlqlmfzqsnqokrqvmcm

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDQ5MiwiZXhwIjoyMDc5NDYwNDkyfQ.m3xw006mSdP1DeunLo4CoNDonIIXkQSt353VL-ibb0c --project-ref emlqlmfzqsnqokrqvmcm

# Get webhook secret from Stripe dashboard first:
# https://dashboard.stripe.com/webhooks → Click we_1SYe14HBw27Y92Ci0z5p0Wkl → Reveal signing secret

supabase secrets set STRIPE_WEBHOOK_SECRET=[PASTE_WEBHOOK_SECRET_HERE] --project-ref emlqlmfzqsnqokrqvmcm
```

**Via Dashboard:**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/functions
2. Scroll to "Secrets" section
3. Click "Add secret" for each:
   - Name: `STRIPE_SECRET_KEY`
     Value: `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`
   
   - Name: `SUPABASE_URL`
     Value: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
   
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDQ5MiwiZXhwIjoyMDc5NDYwNDkyfQ.m3xw006mSdP1DeunLo4CoNDonIIXkQSt353VL-ibb0c`
   
   - Name: `STRIPE_WEBHOOK_SECRET`
     Value: Get from https://dashboard.stripe.com/webhooks (webhook ID: we_1SYe14HBw27Y92Ci0z5p0Wkl)

---

### STEP 3: Set Cloudflare Environment Variables (5 minutes)

1. Go to: https://dash.cloudflare.com
2. Click "Pages" → Click your project
3. Click "Settings" → "Environment variables"
4. Add these 4 variables (Production environment):

   - Name: `VITE_SUPABASE_URL`
     Value: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
     ☑ Encrypt
   
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg`
     ☑ Encrypt
   
   - Name: `VITE_STRIPE_PUBLISHABLE_KEY`
     Value: `pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8`
     ☑ Encrypt
   
   - Name: `VITE_STORAGE_BUCKET_NAME`
     Value: `images`
     ☐ Don't encrypt

5. Click "Save"
6. Go to "Deployments" tab
7. Click three dots (⋮) on latest deployment
8. Click "Retry deployment"
9. Wait 3-5 minutes

---

## 🎉 THAT'S IT!

After completing these 3 steps:
- Your Supabase functions will be live
- Your secrets will be configured
- Your Cloudflare site will redeploy with new credentials
- Everything will be working!

---

## 🧪 Testing After Deployment

1. Visit: `https://[your-site].com/stripe-checkout`
2. Products should load automatically from `real_products` table
3. Try adding a product to cart
4. Test checkout flow
5. Check Supabase logs: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/logs

---

## 📞 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm
- **Supabase Functions:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions
- **Supabase Secrets:** https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/functions
- **Stripe Webhooks:** https://dashboard.stripe.com/webhooks
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **GitHub Repo:** https://github.com/reloadedfiretvteam-hash/streamerstickprofinal

---

## 📋 Summary of Changes

### Files I Updated:
- ✅ `.env` - Updated Supabase URL and keys
- ✅ Created deployment guides (this file and others)
- ✅ Committed and pushed to GitHub

### Files Ready to Deploy:
- ✅ `supabase/functions/stripe-payment-intent/index.ts`
- ✅ `supabase/functions/stripe-webhook/index.ts`
- ✅ `supabase/functions/send-order-emails/index.ts`
- ✅ `supabase/functions/send-credentials-email/index.ts`

### What's Left:
- ⏳ Deploy 4 functions to Supabase (Step 1)
- ⏳ Set 4 secrets in Supabase (Step 2)
- ⏳ Set 4 variables in Cloudflare (Step 3)

**Total time remaining: ~20 minutes**

---

**YOU'VE GOT THIS! 🚀**


