# 🚀 COMPLETE EDGE FUNCTIONS DEPLOYMENT GUIDE

## 📋 ALL EDGE FUNCTIONS YOU NEED

Your website uses these edge functions. Make sure ALL of them are deployed in Supabase:

1. ✅ **stripe-payment-intent** - Creates Stripe payment intents
2. ✅ **stripe-webhook** - Handles Stripe webhook events
3. ✅ **create-payment-intent** - Alternative payment intent creator
4. ✅ **confirm-payment** - Confirms payment transactions
5. ✅ **send-order-emails** - Sends order confirmation emails
6. ✅ **nowpayments-webhook** - Handles NowPayments webhooks

---

## 📝 HOW TO DEPLOY EACH FUNCTION

### STEP 1: Go to Edge Functions in Supabase

1. Open: https://supabase.com/dashboard
2. Select your project
3. Click **"Edge Functions"** in the left sidebar

---

## 🔧 FUNCTION #1: stripe-payment-intent

**Status:** ✅ UPDATED - This is the main one we just fixed!

**Where:** Edge Functions → Find `stripe-payment-intent` → Click it

**Copy this code:**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import Stripe from "https://esm.sh/stripe@14?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 200, headers: corsHeaders });

  try {
    // Accept payload: realProductId or productId (for backward compatibility), customerEmail, customerName
    const payload = await req.json();
    const realProductId = payload.realProductId || payload.productId;
    const { customerEmail, customerName } = payload;
    
    if (!realProductId) {
      throw new Error("Product ID is required (realProductId or productId)");
    }
    
    if (!customerEmail) {
      throw new Error("Customer email is required");
    }
    
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseKey)
      throw new Error("Missing env vars");

    // Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the price from real_products (NOT shadow/stripe table)
    const { data: product, error: prodError } = await supabase
      .from("real_products")
      .select("price,sale_price,name")
      .eq("id", realProductId)
      .single();
      
    if (prodError) {
      console.error("Product fetch error:", prodError);
      throw new Error(`Product not found: ${prodError.message}`);
    }
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    const price = product.sale_price ?? product.price;
    if (!price || price <= 0) {
      throw new Error("Product price missing or invalid");
    }

    // Create Stripe PaymentIntent for correct price
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      receipt_email: customerEmail,
      description: product.name,
      metadata: { customerName, realProductId },
      automatic_payment_methods: { enabled: true },
    });
    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Payment intent creation error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: corsHeaders,
    });
  }
});
```

**Action:** Paste → Replace all → Click **Deploy**

---

## 🔧 FUNCTION #2: stripe-webhook

**Status:** ✅ Already exists - Just verify it's deployed

**Where:** Edge Functions → Find `stripe-webhook` → Click it

**Action:** If it exists, just click **Deploy** to update it. If missing, create new function with name `stripe-webhook` and use the code from `supabase/functions/stripe-webhook/index.ts`

---

## 🔧 FUNCTION #3: create-payment-intent

**Status:** ✅ Already exists - Verify it's deployed

**Where:** Edge Functions → Find `create-payment-intent` → Click it

**Action:** If it exists, just click **Deploy**. If missing, create new function with name `create-payment-intent` and use the code from `supabase/functions/create-payment-intent/index.ts`

---

## 🔧 FUNCTION #4: confirm-payment

**Status:** ✅ Already exists - Verify it's deployed

**Where:** Edge Functions → Find `confirm-payment` → Click it

**Action:** If it exists, just click **Deploy**. If missing, create new function with name `confirm-payment` and use the code from `supabase/functions/confirm-payment/index.ts`

---

## 🔧 FUNCTION #5: send-order-emails

**Status:** ✅ Already exists - Verify it's deployed

**Where:** Edge Functions → Find `send-order-emails` → Click it

**Action:** If it exists, just click **Deploy**. If missing, create new function with name `send-order-emails` and use the code from `supabase/functions/send-order-emails/index.ts`

---

## 🔧 FUNCTION #6: nowpayments-webhook

**Status:** ✅ Already exists - Verify it's deployed

**Where:** Edge Functions → Find `nowpayments-webhook` → Click it

**Action:** If it exists, just click **Deploy**. If missing, create new function with name `nowpayments-webhook` and use the code from `supabase/functions/nowpayments-webhook/index.ts`

---

## ⚙️ ENVIRONMENT VARIABLES (SECRETS)

**Go to:** Project Settings → Edge Functions → Secrets

**Make sure these are set:**

```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_... (if using webhooks)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ CHECKLIST

After deploying, verify:

- [ ] All 6 functions are listed in Edge Functions
- [ ] All functions show "Deployed" status
- [ ] Environment variables are set
- [ ] Test a payment with Stripe test card: `4242 4242 4242 4242`

---

## 🆘 IF A FUNCTION IS MISSING

1. Click **"New Function"** or **"Create Function"**
2. Enter the function name (exactly as listed above)
3. Copy the code from the corresponding file in `supabase/functions/[function-name]/index.ts`
4. Paste into the editor
5. Click **Deploy**

---

**Last Updated:** Now
**Status:** Ready for Complete Deployment ✅







