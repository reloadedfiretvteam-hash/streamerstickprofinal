# 🔧 FIX: "Stripe is not available" Error on Checkout

## 🚨 THE PROBLEM:

The checkout page shows "Stripe is not available" because the **Stripe Publishable Key** is missing from Cloudflare environment variables.

---

## ✅ QUICK FIX - STEP BY STEP:

### STEP 1: Get Your Stripe Publishable Key

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/apikeys
2. Log in to your Stripe account
3. Find **"Publishable key"** (starts with `pk_live_` for live mode or `pk_test_` for test mode)
4. Click **"Copy"** to copy the entire key
5. **Keep this tab open** - you'll need it in Step 2

---

### STEP 2: Add to Cloudflare Environment Variables

1. Go to **Cloudflare Dashboard**: https://dash.cloudflare.com
2. Log in
3. Click **"Pages"** (left menu)
4. Click **your project name**
5. Click **"Settings"** (top menu)
6. Click **"Environment variables"** (left menu)

### STEP 3: Add the Variable

1. Click **"Add variable"** button
2. **Variable name:** `VITE_STRIPE_PUBLISHABLE_KEY`
3. **Value:** Paste the Stripe publishable key you copied in Step 1
4. **Check boxes:** 
   - ✅ Production
   - ✅ Preview (optional, but recommended)
5. Click **"Save"**

---

### STEP 4: Trigger a New Build

**IMPORTANT:** Cloudflare needs to rebuild for the environment variable to take effect!

**Option A: Automatic (Recommended)**
1. Make any small change to your code (like adding a space to a file)
2. Commit and push to GitHub
3. Cloudflare will automatically rebuild

**Option B: Manual Trigger**
1. In Cloudflare Pages → Your Project → Settings
2. Scroll down to **"Builds & deployments"**
3. Click **"Retry deployment"** on the latest build
4. OR click **"Create deployment"** to trigger a new build

---

## ✅ VERIFY IT'S WORKING:

1. **Wait 2-5 minutes** for Cloudflare to rebuild
2. **Clear your browser cache:**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Clear cached images and files
   - OR press `Ctrl + Shift + R` for a hard refresh
3. **Go to your checkout page:** `https://yourdomain.com/checkout`
4. **Add a product to cart first** (go to `/shop` and click "Add to Cart")
5. **Checkout should now show:**
   - ✅ Customer Information form (Step 1)
   - ✅ Payment method selection (Step 2)
   - ✅ Stripe payment form (Step 3)

---

## 🐛 IF IT STILL DOESN'T WORK:

### Check 1: Verify Environment Variable

1. Go to Cloudflare → Pages → Your Project → Settings → Environment Variables
2. Make sure `VITE_STRIPE_PUBLISHABLE_KEY` exists
3. Make sure it starts with `pk_live_` or `pk_test_`
4. Make sure there are **no extra spaces** before or after the key

### Check 2: Verify Build Logs

1. Go to Cloudflare → Pages → Your Project → Deployments
2. Click on the latest deployment
3. Check the build logs for errors
4. Look for messages about environment variables

### Check 3: Test in Browser Console

1. Open your checkout page
2. Press `F12` to open Developer Tools
3. Click **"Console"** tab
4. Type this and press Enter:
   ```javascript
   console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
   ```
5. If it shows `undefined` or `null`, the environment variable isn't set
6. If it shows your key, the variable is set correctly

### Check 4: Verify Cart Has Items

The checkout page shows "Cart is Empty" if there are no items. Make sure:
1. You've added a product to cart from `/shop` page
2. The cart localStorage has items
3. Try refreshing the page after adding to cart

---

## 📋 CHECKLIST:

- [ ] Stripe publishable key copied from Stripe Dashboard
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` added to Cloudflare environment variables
- [ ] Variable has correct value (starts with `pk_`)
- [ ] "Production" checkbox is checked
- [ ] Cloudflare deployment triggered/retried
- [ ] Waited 2-5 minutes for rebuild
- [ ] Browser cache cleared
- [ ] Product added to cart before going to checkout
- [ ] Checkout page shows forms correctly

---

## 🎯 WHAT THE CHECKOUT SHOULD SHOW:

**Step 1:** Customer Information form with:
- Full Name field
- Email Address field
- Phone Number field
- "Continue to Payment" button

**Step 2:** Payment Method selection with:
- Card Payment button (Stripe)
- Bitcoin button
- Cash App button

**Step 3:** Payment form (when Stripe is selected) with:
- Stripe Payment Element (card input fields)
- Apple Pay / Google Pay options
- "Pay $X.XX" button

---

## ✅ AFTER FIXING:

Once `VITE_STRIPE_PUBLISHABLE_KEY` is set and Cloudflare rebuilds:
- ✅ Checkout page will load properly
- ✅ Customer information form will appear
- ✅ Payment method selection will work
- ✅ Stripe payment form will load
- ✅ No more "Stripe is not available" error

**The checkout page IS built - it just needs the Stripe key to function!** 🚀

