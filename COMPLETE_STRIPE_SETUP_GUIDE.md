# Complete Stripe Integration Setup Guide

## ✅ AUDIT SUMMARY

Your Stripe integration has the following components already built and ready:

### Frontend Components (All Complete ✅)
1. `src/components/StripeCheckout.tsx` - Full Stripe checkout with Elements
2. `src/components/StripePaymentForm.tsx` - Payment form component
3. `src/pages/StripeCheckoutPage.tsx` - Stripe checkout page
4. `src/pages/StripeSecureCheckoutPage.tsx` - Secure checkout with product selection
5. `index.html` - Has Stripe.js SDK loaded

### Supabase Edge Functions (All Complete ✅)
1. `supabase/functions/stripe-payment-intent/index.ts` - Creates payment intents
2. `supabase/functions/stripe-webhook/index.ts` - Handles Stripe webhooks
3. `supabase/functions/create-payment-intent/index.ts` - Alternative payment intent creator

### Database Tables (SQL Ready ✅)
1. `stripe_products` - Products for Stripe checkout
2. `payment_transactions` - Stores all payment records
3. `payment_gateway_config` - Stores Stripe API keys
4. `site_settings` - Can store `stripe_publishable_key` and `stripe_secret_key`

---

## 🚀 STEP-BY-STEP SETUP GUIDE

### Step 1: Get Your Stripe API Keys
**DONE** when you complete this step.

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
4. If testing, use TEST keys. For live payments, use LIVE keys.

**DONE** ✅

---

### Step 2: Add Stripe Keys to Cloudflare Environment Variables
**DONE** when you complete this step.

1. Go to Cloudflare Dashboard > Pages > Your Project
2. Click **Settings** > **Environment Variables**
3. Add these variables for **Production**:

| Variable Name | Value |
|--------------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_your_key_here` |

4. Click **Save**
5. Trigger a new deployment by pushing a commit or clicking "Retry deployment"

**DONE** ✅

---

### Step 3: Add Stripe Keys to Supabase Edge Functions
**DONE** when you complete this step.

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** > **Secrets**
4. Add these secrets:

| Secret Name | Value |
|------------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_your_secret_key_here` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_your_webhook_secret` (from Step 6) |

5. Click **Save**

**DONE** ✅

---

### Step 4: Run SQL to Create Stripe Products Table
**DONE** when you complete this step.

1. Go to Supabase Dashboard > **SQL Editor**
2. Copy and paste this ENTIRE SQL block:

```sql
-- Create stripe_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  short_description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  image_url text,
  category text DEFAULT 'Digital Services',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_products' AND policyname = 'Anyone can view active stripe products'
  ) THEN
    CREATE POLICY "Anyone can view active stripe products"
      ON stripe_products FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_products' AND policyname = 'Authenticated users can manage stripe products'
  ) THEN
    CREATE POLICY "Authenticated users can manage stripe products"
      ON stripe_products FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Insert sample products (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM stripe_products LIMIT 1) THEN
    INSERT INTO stripe_products (name, description, short_description, price, category, is_active, sort_order)
    VALUES 
    ('1 Month Service', 'Premium 1-month digital content service subscription with full access.', '1-month premium access', 15.00, 'Subscriptions', true, 1),
    ('3 Month Service', 'Premium 3-month digital content service subscription with full access.', '3-month premium access', 25.00, 'Subscriptions', true, 2),
    ('6 Month Service', 'Premium 6-month digital content service subscription with full access.', '6-month premium access', 40.00, 'Subscriptions', true, 3),
    ('1 Year Service', 'Premium 12-month digital content service subscription with full access.', '12-month premium access', 70.00, 'Subscriptions', true, 4);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_stripe_products_category ON stripe_products(category);
```

3. Click **Run**
4. You should see "Success" message

**DONE** ✅

---

### Step 5: Add Stripe Webhook Columns to Payment Transactions
**DONE** when you complete this step.

1. In Supabase SQL Editor, copy and paste:

```sql
-- Add Stripe columns to payment_transactions
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_event_id text,
  ADD COLUMN IF NOT EXISTS is_live_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS customer_email text;

-- Update payment_method constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_transactions_payment_method_check'
  ) THEN
    ALTER TABLE payment_transactions 
    DROP CONSTRAINT payment_transactions_payment_method_check;
  END IF;
END $$;

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_payment_method_check
  CHECK (payment_method IN ('cashapp', 'bitcoin', 'card', 'paypal', 'zelle', 'venmo', 'stripe'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi 
  ON payment_transactions(stripe_payment_intent_id) 
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_live_mode 
  ON payment_transactions(is_live_mode);
```

2. Click **Run**

**DONE** ✅

---

### Step 6: Set Up Stripe Webhook
**DONE** when you complete this step.

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID (e.g., `fiwkgpsvcvzitnuevqxz`)

4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.created`

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add this as `STRIPE_WEBHOOK_SECRET` in Supabase Edge Function Secrets (Step 3)

**DONE** ✅

---

### Step 7: Deploy Supabase Edge Functions
**DONE** when you complete this step.

If you haven't deployed the edge functions yet:

1. Install Supabase CLI locally:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. Deploy the functions:
   ```bash
   supabase functions deploy stripe-payment-intent
   supabase functions deploy stripe-webhook
   ```

**DONE** ✅

---

### Step 8: Test Your Stripe Integration
**DONE** when you complete this step.

1. Go to your website: `https://pay.streamstickpro.com` or `/stripe-checkout`
2. Select a product
3. Enter customer info (name and email)
4. Click "Continue to Payment"
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date (e.g., 12/25)
   - Any CVC (e.g., 123)
   - Any ZIP (e.g., 12345)
6. Click "Pay"
7. You should see success message

**DONE** ✅

---

## 🔑 ENVIRONMENT VARIABLES SUMMARY

### Cloudflare Pages (Frontend)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_STRIPE_HOSTS=pay.streamstickpro.com
```

### Supabase Edge Functions (Backend Secrets)
```
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 📊 DATABASE TABLES NEEDED

| Table Name | Purpose | Status |
|-----------|---------|--------|
| `stripe_products` | Products for Stripe checkout | Run SQL in Step 4 |
| `payment_transactions` | Store payment records | Run SQL in Step 5 |
| `orders_full` | Order records | Should exist |
| `site_settings` | Optional - store API keys in DB | Optional |

---

## 🛠️ TROUBLESHOOTING

### "Stripe configuration missing" error
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set in Cloudflare environment variables
- Redeploy after adding environment variables

### "STRIPE_SECRET_KEY is not configured" error
- Add `STRIPE_SECRET_KEY` to Supabase Edge Function Secrets
- Redeploy edge functions

### Payment fails with webhook error
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe Dashboard
- Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

### Products not showing
- Run the SQL in Step 4 to create products
- Check RLS policies allow SELECT

---

## ✅ COMPLETE CHECKLIST

- [ ] Step 1: Get Stripe API keys
- [ ] Step 2: Add keys to Cloudflare
- [ ] Step 3: Add secrets to Supabase Edge Functions
- [ ] Step 4: Run SQL to create stripe_products table
- [ ] Step 5: Run SQL to update payment_transactions
- [ ] Step 6: Set up Stripe webhook
- [ ] Step 7: Deploy Edge Functions
- [ ] Step 8: Test the integration

When all boxes are checked, your Stripe integration is complete! 🎉
