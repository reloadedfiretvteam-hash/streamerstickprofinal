# ✅ CLOUDFLARE STRIPE KEY SETUP - EXACT STEPS

## 🔍 IMPORTANT: Check Your Stripe Key Format

**Stripe Publishable Keys MUST start with:**
- `pk_live_` (for live/production)
- `pk_test_` (for test mode)

**Your key should look like:**
```
pk_live_51AbC123XyZ789...SjHgl4uSJifxbmMTwD3UVGA-DAKEe5TwM8Dm780U
```

**OR**

```
pk_test_51AbC123XyZ789...SjHgl4uSJifxbmMTwD3UVGA-DAKEe5TwM8Dm780U
```

---

## 📋 STEP-BY-STEP: Add Stripe Key to Cloudflare

### STEP 1: Get FULL Stripe Publishable Key

1. Go to: **https://dashboard.stripe.com/apikeys**
2. Log in to Stripe
3. Make sure you're in the correct mode:
   - **Live mode** = Real payments (starts with `pk_live_`)
   - **Test mode** = Test payments (starts with `pk_test_`)
4. Find **"Publishable key"** section
5. Click **"Reveal"** or **"Copy"** to get the FULL key
6. The key should be VERY long (about 100+ characters)
7. Copy the ENTIRE key including the `pk_live_` or `pk_test_` prefix

---

### STEP 2: Add to Cloudflare Environment Variables

1. Go to: **https://dash.cloudflare.com**
2. Log in
3. Click **"Pages"** (left sidebar)
4. Click **your project name** (streamerstickprofinal or similar)
5. Click **"Settings"** tab (top menu)
6. Click **"Environment variables"** (left sidebar)

### STEP 3: Add the Variable

1. Look for existing `VITE_STRIPE_PUBLISHABLE_KEY` variable
   - **If it exists:** Click the **pencil/edit icon** to edit it
   - **If it doesn't exist:** Click **"Add variable"** button

2. Fill in the form:
   - **Variable name:** `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Value:** Paste your FULL Stripe publishable key (must start with `pk_live_` or `pk_test_`)
   - **Environments:** 
     - ✅ Check **"Production"**
     - ✅ Check **"Preview"** (recommended)

3. Click **"Save"**

---

### STEP 4: Verify the Key

After saving, verify:
1. The variable name is exactly: `VITE_STRIPE_PUBLISHABLE_KEY`
2. The value starts with `pk_live_` or `pk_test_`
3. The value has NO extra spaces before or after
4. Both Production and Preview are checked

---

### STEP 5: Trigger Rebuild

**IMPORTANT:** Cloudflare must rebuild for the variable to take effect!

**Option A: Manual Rebuild (Fastest)**
1. Stay in Cloudflare Pages → Your Project
2. Go to **"Deployments"** tab
3. Find the latest deployment
4. Click the **three dots (⋯)** menu
5. Click **"Retry deployment"**

**Option B: Automatic Rebuild**
1. Make a tiny change to any file in your repo
2. Commit and push to GitHub
3. Cloudflare will auto-rebuild

---

### STEP 6: Wait and Test

1. **Wait 2-5 minutes** for Cloudflare to rebuild
2. **Clear browser cache:**
   - Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. **Test checkout:**
   - Go to `/shop`
   - Add product to cart
   - Go to `/checkout`
   - Should see customer information form

---

## ❗ COMMON MISTAKES:

❌ **Wrong:** Using Secret Key (starts with `sk_`) instead of Publishable Key
✅ **Correct:** Use Publishable Key (starts with `pk_`)

❌ **Wrong:** Using partial key (missing `pk_live_` or `pk_test_` prefix)
✅ **Correct:** Use FULL key with prefix

❌ **Wrong:** Extra spaces or line breaks in the key
✅ **Correct:** Copy exact key, no spaces

❌ **Wrong:** Variable name misspelled (e.g., `VITE_STRIPE_PUB_KEY`)
✅ **Correct:** Exact name: `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 🔍 HOW TO VERIFY IT'S WORKING:

### Method 1: Browser Console
1. Go to your checkout page
2. Press `F12` to open Developer Tools
3. Click **"Console"** tab
4. Type: `console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)`
5. Press Enter
6. Should show your key starting with `pk_`
7. If it shows `undefined`, the variable isn't set correctly

### Method 2: Checkout Page
1. Go to `/checkout` with items in cart
2. Fill in customer information
3. Click "Continue to Payment"
4. Select "Card Payment"
5. Click "Continue"
6. Should see Stripe payment form loading
7. If you see error, check browser console for details

---

## ✅ SUCCESS CHECKLIST:

- [ ] Stripe publishable key obtained from Stripe Dashboard
- [ ] Key starts with `pk_live_` or `pk_test_`
- [ ] Full key copied (100+ characters)
- [ ] Added to Cloudflare as `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Value has no extra spaces
- [ ] Production environment checked
- [ ] Cloudflare deployment retried/rebuilt
- [ ] Waited 2-5 minutes for rebuild
- [ ] Browser cache cleared
- [ ] Checkout page tested and working

---

## 🎯 EXPECTED RESULT:

After setting the key correctly and rebuilding:
- ✅ Checkout page loads without errors
- ✅ Customer information form appears
- ✅ Payment method selection works
- ✅ Stripe payment form loads correctly
- ✅ No "Stripe is not available" error

---

**Note:** The key you provided (`SjHgl4uSJifxbmMTwD3UVGA-DAKEe5TwM8Dm780U`) looks like it might be part of a Stripe key, but it's missing the `pk_live_` or `pk_test_` prefix. Make sure to get the FULL key from Stripe Dashboard!

