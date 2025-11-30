# ✅ ALL CLOUDFLARE VARIABLES CHECKLIST

## 🎯 YOUR CODE NEEDS THESE VARIABLES (ALL WITH `VITE_` PREFIX):

Your code uses **Vite**, so ALL variables need `VITE_` prefix, NOT `NEXT_PUBLIC_`!

---

## ✅ REQUIRED VARIABLES:

### 1. Supabase Variables:
- ✅ `VITE_SUPABASE_URL` ← Your Supabase Project URL
- ✅ `VITE_SUPABASE_ANON_KEY` ← Your Supabase Anon Key

### 2. Stripe Variables:
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` ← Your Stripe Publishable Key

### 3. Storage Variable:
- ✅ `VITE_STORAGE_BUCKET_NAME` = `images` (usually just "images")

### 4. Optional but Recommended:
- ✅ `VITE_STRIPE_HOSTS` = `pay.streamstickpro.com`
- ✅ `VITE_ADMIN_DEFAULT_USER` = `admin`
- ✅ `VITE_ADMIN_DEFAULT_PASSWORD` = `admin123`
- ✅ `VITE_ADMIN_DEFAULT_EMAIL` = `reloadedfirestvteam@gmail.com`

---

## 🔍 WHAT TO CHECK IN CLOUDFLARE:

### STEP 1: Check Your Current Variables

1. Go to Cloudflare → Pages → Your Project → Settings → Environment Variables
2. Look at ALL your variables
3. Check which ones start with `NEXT_PUBLIC_`

### STEP 2: Rename or Add Variables

For EACH variable that starts with `NEXT_PUBLIC_`, you have 2 options:

**Option A: Rename Existing (Recommended)**
- Edit the variable
- Change `NEXT_PUBLIC_` to `VITE_`
- Keep the same value
- Save

**Option B: Add New with Correct Name**
- Keep the old `NEXT_PUBLIC_` one (don't delete yet)
- Add a NEW variable with `VITE_` prefix
- Use the same value
- Delete the old one after confirming it works

---

## 📋 SPECIFIC RENAMES NEEDED:

### Supabase Variables:
❌ `NEXT_PUBLIC_SUPABASE_URL` → ✅ `VITE_SUPABASE_URL`
❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → ✅ `VITE_SUPABASE_ANON_KEY`

### Stripe Variables:
❌ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → ✅ `VITE_STRIPE_PUBLISHABLE_KEY`

### Other Variables (if they exist):
❌ `NEXT_PUBLIC_STORAGE_BUCKET_NAME` → ✅ `VITE_STORAGE_BUCKET_NAME`
❌ `NEXT_PUBLIC_STRIPE_HOSTS` → ✅ `VITE_STRIPE_HOSTS`
❌ `NEXT_PUBLIC_ADMIN_DEFAULT_USER` → ✅ `VITE_ADMIN_DEFAULT_USER`
❌ `NEXT_PUBLIC_ADMIN_DEFAULT_PASSWORD` → ✅ `VITE_ADMIN_DEFAULT_PASSWORD`
❌ `NEXT_PUBLIC_ADMIN_DEFAULT_EMAIL` → ✅ `VITE_ADMIN_DEFAULT_EMAIL`

---

## ✅ COMPLETE CHECKLIST:

In Cloudflare Environment Variables, make sure you have:

- [ ] `VITE_SUPABASE_URL` (NOT `NEXT_PUBLIC_SUPABASE_URL`)
- [ ] `VITE_SUPABASE_ANON_KEY` (NOT `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (NOT `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- [ ] `VITE_STORAGE_BUCKET_NAME` (set to `images`)
- [ ] `VITE_STRIPE_HOSTS` (optional, but recommended)
- [ ] `VITE_ADMIN_DEFAULT_USER` (optional)
- [ ] `VITE_ADMIN_DEFAULT_PASSWORD` (optional)
- [ ] `VITE_ADMIN_DEFAULT_EMAIL` (optional)

---

## 🎯 QUICK FIX:

1. **Check Cloudflare** → Environment Variables
2. **For each `NEXT_PUBLIC_` variable:**
   - Either rename it to `VITE_`
   - Or add a new `VITE_` version with the same value
3. **Trigger rebuild** in Deployments tab
4. **Wait 2-5 minutes**

---

## 💡 WHY?

- **Next.js** uses `NEXT_PUBLIC_` prefix
- **Vite** (your project) uses `VITE_` prefix
- Your code looks for `VITE_` variables
- `NEXT_PUBLIC_` variables won't be found!

---

## ✅ AFTER FIXING:

Once all variables use `VITE_` prefix:
- ✅ Checkout will work
- ✅ Supabase connection will work
- ✅ Admin panel will work
- ✅ Everything will function correctly!

**Just rename the prefix from `NEXT_PUBLIC_` to `VITE_`!** 🚀

