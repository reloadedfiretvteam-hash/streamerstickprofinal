# ✅ COMPLETE CHECKOUT SETUP GUIDE

## 🎯 What This Does

This rebuilds your checkout with **ALL** Stripe payment methods:
- ✅ Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
- ✅ Apple Pay (automatic on iOS/Safari)
- ✅ Google Pay (automatic on Android/Chrome)
- ✅ Cash App Pay (via Stripe)
- ✅ Any other payment methods enabled in your Stripe Dashboard

Plus your existing:
- ✅ Bitcoin payments
- ✅ Cash App payments

## 📋 STEP 1: Run SQL in Supabase

**Copy and paste this entire SQL block into Supabase SQL Editor:**

```sql
-- ============================================================
-- STRIPE CHECKOUT SETUP SQL
-- Run this to ensure all tables exist for the complete checkout system
-- ============================================================

-- 1. Ensure orders_full table exists
CREATE TABLE IF NOT EXISTS orders_full (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_state text,
  customer_zip text,
  total_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'processing',
  stripe_payment_intent_id text,
  order_code text UNIQUE NOT NULL,
  items jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders_full ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view orders" ON orders_full;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders_full;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders_full;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders_full;

CREATE POLICY "Anyone can view orders" ON orders_full FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create orders" ON orders_full FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders_full FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage orders" ON orders_full FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_full_order_code ON orders_full(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_full_customer_email ON orders_full(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_full_stripe_payment_intent_id ON orders_full(stripe_payment_intent_id);

DROP TRIGGER IF EXISTS update_orders_full_timestamp ON orders_full;
CREATE TRIGGER update_orders_full_timestamp 
  BEFORE UPDATE ON orders_full 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Ensure payment_transactions table exists
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id text,
  stripe_event_id text,
  amount numeric(10,2),
  currency text DEFAULT 'usd',
  payment_method text,
  payment_status text,
  customer_email text,
  product_id text,
  product_name text,
  is_live_mode boolean,
  order_code text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Authenticated users can manage payment transactions" ON payment_transactions;

CREATE POLICY "Public can read payment transactions" ON payment_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage payment transactions" ON payment_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_code ON payment_transactions(order_code);

-- 3. Ensure real_products table has main_image column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'main_image') THEN
      ALTER TABLE real_products ADD COLUMN main_image text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'real_products' AND column_name = 'stripe_payment_link') THEN
      ALTER TABLE real_products ADD COLUMN stripe_payment_link text;
    END IF;
  END IF;
END $$;
```

**Where to paste:**
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Click "New Query"
4. Paste the SQL above
5. Click "Run" (or press F5)

## 📋 STEP 2: Deploy Edge Function

The edge function has been updated to work with Cloudflare and handle cart-based payments. Deploy it:

```bash
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstick\streamerstickprofinal\newstreamerpro\updated github\gitnew web repository"

# Deploy the updated function
supabase functions deploy stripe-payment-intent
```

**OR** use Supabase Dashboard:
1. Go to Edge Functions
2. Find `stripe-payment-intent`
3. Replace the code with the updated version (already in your repo)
4. Deploy

## 📋 STEP 3: Verify Environment Variables

**In Supabase Edge Functions Secrets:**
- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

**In Cloudflare Pages (or your deployment platform):**
- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_live_` or `pk_test_`)

## 📋 STEP 4: Enable Payment Methods in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Settings** → **Payment methods**
3. Enable these methods:
   - ✅ Cards (already enabled)
   - ✅ Apple Pay
   - ✅ Google Pay
   - ✅ Cash App Pay (if available in your region)
   - ✅ Any other methods you want

**Note:** The Stripe Payment Element **automatically** shows all enabled payment methods based on:
- Customer's device (iPhone shows Apple Pay automatically)
- Customer's location
- Payment amount
- Your Stripe settings

## 🧪 TESTING

### Test Card (Stripe Test Mode)
Use this card number: **4242 4242 4242 4242**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Test Apple Pay / Google Pay
- These appear automatically on supported devices
- In test mode, you'll see test cards
- In live mode, customers use their real wallet

### Test Flow:
1. Add products to cart on `/shop`
2. Go to `/checkout`
3. Fill in customer info
4. Select "Card Payment" method
5. Complete payment

## 🐛 FIXED: Cloudflare Header Issues

The edge function now includes proper CORS headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};
```

This ensures Cloudflare accepts the requests.

## 📁 FILES CREATED/UPDATED

1. ✅ `src/pages/CompleteCheckoutPage.tsx` - New complete checkout page
2. ✅ `supabase/functions/stripe-payment-intent/index.ts` - Updated for Cloudflare + cart payments
3. ✅ `src/AppRouter.tsx` - Added route for `/checkout`
4. ✅ `STRIPE_CHECKOUT_SETUP.sql` - SQL setup file
5. ✅ `COMPLETE_CHECKOUT_SETUP.md` - This guide

## ✅ CHECKLIST

- [ ] SQL run in Supabase
- [ ] Edge function deployed
- [ ] Environment variables set in Cloudflare
- [ ] Stripe payment methods enabled
- [ ] Test with test card (4242 4242 4242 4242)
- [ ] Test on mobile device (for Apple Pay/Google Pay)

## 🚀 DEPLOYMENT

After testing locally, push to GitHub:

```bash
git add .
git commit -m "Complete Stripe checkout with all payment methods + Cloudflare fixes"
git push origin clean-main
```

Cloudflare Pages will automatically deploy.

## 🎉 DONE!

Your checkout now supports:
- ✅ All Stripe payment methods (Cards, Apple Pay, Google Pay, Cash App Pay, etc.)
- ✅ Bitcoin payments
- ✅ Cash App payments
- ✅ Cart-based checkout
- ✅ Product-based checkout
- ✅ Cloudflare compatibility
- ✅ Real-time order tracking

All payment methods appear automatically based on customer's device and your Stripe settings!




