# 💳 Payment Integration Guide

This document explains how to configure and use the Stripe payment system for Stream Stick Pro.

## Overview

The website uses **Stripe** for credit/debit card payments, along with **Bitcoin** and **Cash App** as alternative payment methods.

---

## 🔑 Environment Variables

### Frontend (Cloudflare/Vercel)

Add these to your deployment platform's environment variables:

```env
# Required: Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here

# Required: Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Stripe Payment Subdomain
VITE_STRIPE_HOSTS=pay.streamstickpro.com
```

### Supabase Edge Functions

Add these secrets to your Supabase project (Settings → Edge Functions → Secrets):

```env
# Required
STRIPE_SECRET_KEY=sk_live_your_secret_key_here

# Required for webhook verification
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🚀 Deploying Edge Functions

Deploy the Stripe edge functions to Supabase:

```bash
# Deploy payment intent creation
supabase functions deploy stripe-payment-intent

# Deploy webhook handler
supabase functions deploy stripe-webhook
```

---

## 🔐 Stripe Dashboard Setup

### 1. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

### 2. Configure Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Signing secret** (starts with `whsec_`)

---

## 🧪 Testing

### Test Mode vs Live Mode

- **Test keys** start with `pk_test_` and `sk_test_`
- **Live keys** start with `pk_live_` and `sk_live_`

### Test Card Numbers

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication |
| `4000 0000 0000 9995` | Declined payment |

Use any future expiration date, any 3-digit CVC, and any ZIP code.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── StripePaymentForm.tsx    # Payment Element component
│   ├── StripeCheckout.tsx       # Full checkout with Elements
│   └── ...
├── pages/
│   ├── StripeSecureCheckoutPage.tsx  # Cloaked product checkout
│   ├── NewCheckoutPage.tsx           # Main checkout page
│   └── ...
└── ...

supabase/
└── functions/
    ├── stripe-payment-intent/   # Creates PaymentIntents
    └── stripe-webhook/          # Handles Stripe webhooks
```

---

## 🔄 Payment Flow

1. **Customer selects products** and enters contact info
2. **Frontend calls** `stripe-payment-intent` edge function
3. **Edge function** creates PaymentIntent with Stripe API
4. **Frontend receives** `clientSecret` and renders Payment Element
5. **Customer enters** card details in secure Stripe form
6. **Payment confirmed** via `stripe.confirmPayment()`
7. **Order saved** to `orders` table
8. **Webhook receives** confirmation and updates `payment_transactions`

---

## 🛡️ Security Notes

- Card data never touches your servers (Stripe handles it)
- PCI DSS compliant
- 3D Secure (SCA) supported automatically
- Webhook signatures verified to prevent fraud

---

## 🐛 Troubleshooting

### Payment Form Not Loading

1. Check browser console for errors
2. Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
3. Ensure Stripe.js script is loaded in `index.html`
4. Check if key starts with correct prefix (`pk_test_` or `pk_live_`)

### PaymentIntent Creation Fails

1. Verify `STRIPE_SECRET_KEY` is set in Supabase secrets
2. Check edge function logs in Supabase dashboard
3. Ensure product exists in `stripe_products` table

### Webhook Not Working

1. Verify `STRIPE_WEBHOOK_SECRET` is set
2. Check webhook URL is correct
3. Review webhook logs in Stripe Dashboard
4. Ensure edge function is deployed

### Missing Publishable Key Error

The key is loaded from:
1. First, `site_settings` table (key: `stripe_publishable_key`)
2. Fallback to `VITE_STRIPE_PUBLISHABLE_KEY` env var

Add the key to site_settings:
```sql
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('stripe_publishable_key', 'pk_live_your_key_here')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

---

## 📊 Test Mode Indicator

When using test keys (starting with `pk_test_`), you may want to display a banner:

```tsx
const isTestMode = publishableKey?.startsWith('pk_test_');

{isTestMode && (
  <div className="bg-yellow-500 text-black p-2 text-center text-sm font-bold">
    ⚠️ TEST MODE - No real charges will be made
  </div>
)}
```

---

## 📝 Database Tables

### stripe_products

Stores products with cloaked names for compliance:

```sql
CREATE TABLE stripe_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### payment_transactions

Records all payment events (populated by webhook):

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT,
  stripe_event_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'usd',
  payment_method TEXT,
  payment_status TEXT,
  customer_email TEXT,
  product_id TEXT,
  product_name TEXT,
  is_live_mode BOOLEAN,
  order_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 Post-Deployment Checklist

- [ ] Set `STRIPE_SECRET_KEY` in Supabase Edge Functions
- [ ] Set `STRIPE_WEBHOOK_SECRET` in Supabase Edge Functions
- [ ] Deploy `stripe-payment-intent` function
- [ ] Deploy `stripe-webhook` function
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` in Cloudflare
- [ ] Add publishable key to `site_settings` table (optional)
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test with test card: `4242 4242 4242 4242`
- [ ] Switch to live keys when ready for production

---

## 📞 Support

For payment-related issues:
- Check [Stripe Documentation](https://stripe.com/docs)
- Review [Stripe Status Page](https://status.stripe.com)
- Contact: reloadedfiretvteam@gmail.com
