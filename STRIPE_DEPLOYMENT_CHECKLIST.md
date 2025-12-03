# 🚀 STRIPE PAYMENT SYSTEM - DEPLOYMENT CHECKLIST

## ✅ Code Changes Summary

### Files Updated:
1. ✅ `supabase/functions/stripe-payment-intent/index.ts` - Fixed to use `real_products` table
2. ✅ `src/pages/StripeSecureCheckoutPage.tsx` - Fixed to use `real_products` and save orders
3. ✅ All code changes are saved in your repository

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Deploy Edge Function to Supabase

**Option A: Using Supabase CLI (Recommended)**
```bash
# Navigate to your project directory
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Deploy the function
supabase functions deploy stripe-payment-intent
```

**Option B: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the left sidebar
4. Find **stripe-payment-intent** in the list
5. Click **Deploy** or **Update**
6. Copy the code from `supabase/functions/stripe-payment-intent/index.ts`
7. Paste it into the editor
8. Click **Deploy**

---

### STEP 2: Set Environment Variables in Supabase

Go to: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

Add/Verify these secrets:

```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to find these:**
- **STRIPE_SECRET_KEY**: Stripe Dashboard → Developers → API Keys → Secret key
- **SUPABASE_URL**: Supabase Dashboard → Project Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Project Settings → API → service_role key (⚠️ Keep secret!)

---

### STEP 3: Verify Webhook is Configured (Optional but Recommended)

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copy the **Webhook Signing Secret**
5. Add to Supabase Edge Function Secrets:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### STEP 4: Verify Database Tables Exist

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Check if orders table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'orders'
);

-- Check if real_products table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'real_products'
);

-- Check if payment_transactions table exists (for webhook)
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'payment_transactions'
);
```

If any return `false`, you may need to create those tables.

---

### STEP 5: Test the Function

**Test URL:**
```
https://your-project.supabase.co/functions/v1/stripe-payment-intent
```

**Test with curl (replace values):**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/stripe-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "realProductId": "your-product-id",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'
```

**Expected Response:**
```json
{
  "clientSecret": "pi_xxxxx_secret_yyyyy"
}
```

---

## 🔍 VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Edge function deployed successfully
- [ ] Environment variables set in Supabase
- [ ] Function returns `clientSecret` when tested
- [ ] Frontend can call the function (check browser console)
- [ ] Orders table exists and has correct structure
- [ ] `real_products` table has products with `status = 'published'`
- [ ] Stripe.js loads in browser (check Network tab for `js.stripe.com`)
- [ ] Payment form appears when `clientSecret` is received

---

## 🐛 TROUBLESHOOTING

### Error: "Missing env vars"
→ Check that all 3 environment variables are set in Supabase Edge Function Secrets

### Error: "Product not found"
→ Verify:
- Product exists in `real_products` table
- Product `status = 'published'`
- Product has valid `price` or `sale_price`

### Error: "Stripe.js failed to load"
→ Check:
- `index.html` has `<script src="https://js.stripe.com/v3/"></script>`
- No browser extensions blocking Stripe
- Network tab shows successful load

### Payment succeeds but order not saved
→ Check:
- Browser console for errors
- Supabase logs for database errors
- `orders` table permissions (should allow inserts)

---

## 📝 QUICK DEPLOY COMMANDS

```bash
# 1. Navigate to project
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# 2. Deploy function
supabase functions deploy stripe-payment-intent

# 3. Verify deployment
supabase functions list
```

---

## ✅ FINAL CHECK

Before going live:
1. ✅ Test with Stripe test card: `4242 4242 4242 4242`
2. ✅ Verify order appears in `orders` table
3. ✅ Check payment appears in Stripe Dashboard
4. ✅ Test error handling (invalid card, etc.)

---

**Last Updated:** $(date)
**Status:** Ready for Deployment ✅







