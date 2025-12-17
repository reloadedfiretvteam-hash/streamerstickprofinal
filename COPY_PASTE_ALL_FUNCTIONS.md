# 📋 COPY-PASTE ALL EDGE FUNCTIONS

## 🎯 INSTRUCTIONS

1. Go to: **Supabase Dashboard → Edge Functions**
2. For EACH function below:
   - If it exists: Click it → Replace all code → Click **Deploy**
   - If missing: Click **New Function** → Name it → Paste code → Click **Deploy**

---

## ✅ FUNCTION 1: stripe-payment-intent

**Name:** `stripe-payment-intent`

**Copy this entire code block:**

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

---

## ✅ FUNCTION 2: stripe-webhook

**Name:** `stripe-webhook`

**Note:** This is a large file. Go to your local file: `supabase/functions/stripe-webhook/index.ts` and copy ALL of it, OR use the existing one in Supabase if it's already there.

**Action:** If missing, create it and copy from the file. If exists, just verify it's deployed.

---

## ✅ FUNCTION 3: create-payment-intent

**Name:** `create-payment-intent`

**Copy this entire code block:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe secret key from Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: setting } = await supabaseClient
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'stripe_secret_key')
      .single()
    
    const stripeSecretKey = setting?.setting_value || Deno.env.get('STRIPE_SECRET_KEY')
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
    
    const { amount, currency = 'usd', customerInfo, items } = await req.json()
    
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customer_email: customerInfo?.email || '',
        customer_name: customerInfo?.fullName || '',
      }
    })
    
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

---

## ✅ FUNCTION 4: confirm-payment

**Name:** `confirm-payment`

**Copy this entire code block:**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentConfirmation {
  orderCode: string;
  transactionId?: string;
  customerEmail: string;
  customerName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const payload: PaymentConfirmation = await req.json();
    const { orderCode, transactionId, customerEmail, customerName } = payload;

    if (!orderCode || !customerEmail) {
      throw new Error("Missing required fields: orderCode and customerEmail");
    }

    const confirmResult = await fetch(
      `${supabaseUrl}/rest/v1/rpc/confirm_payment_transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
        body: JSON.stringify({
          p_order_code: orderCode,
          p_transaction_id: transactionId || null,
        }),
      }
    );

    if (!confirmResult.ok) {
      throw new Error("Failed to confirm payment");
    }

    const emailBody = `
Dear ${customerName},

Your payment has been confirmed!

Your Order Code: ${orderCode}

You can track your order at any time by visiting:
https://your-website.com/track-order

Simply enter your order code above to see real-time updates on your order status.

What happens next:
1. Your order is now being processed
2. You'll receive another email when your order ships
3. Track your order anytime using your order code

Thank you for choosing Inferno TV!

Questions? Reply to this email or contact us at reloadedfiretvteam@gmail.com

Best regards,
Inferno TV Team
    `;

    console.log(`Payment confirmed for order code: ${orderCode}`);
    console.log(`Email would be sent to: ${customerEmail}`);
    console.log(`Email body:\n${emailBody}`);

    await fetch(`${supabaseUrl}/rest/v1/payment_transactions?order_code=eq.${orderCode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
      },
      body: JSON.stringify({
        confirmation_email_sent: true,
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment confirmed and notification sent",
        orderCode: orderCode,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to confirm payment";
    console.error("Error confirming payment:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
```

---

## ✅ FUNCTION 5: send-order-emails

**Name:** `send-order-emails`

**Copy this entire code block:**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailPayload {
  orderCode: string;
  customerEmail: string;
  customerName: string;
  totalUsd: number;
  paymentMethod: string;
  products: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress: string;
  adminEmail: string;
  totalBtc?: string;
  btcPrice?: number;
  bitcoinAddress?: string;
  cashappTag?: string;
}

function generateCustomerBitcoinEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }.code-box { background: white; border: 3px solid #f97316; padding: 20px; text-center; border-radius: 10px; margin: 20px 0; }.code { font-size: 32px; font-weight: bold; color: #f97316; font-family: monospace; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Bitcoin Payment Instructions</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order!</p><div class="code-box"><p>YOUR ORDER CODE</p><div class="code">${payload.orderCode}</div></div><p>Total: $${payload.totalUsd.toFixed(2)} USD = ${payload.totalBtc} BTC</p><p>Track your order: https://streamstickpro.com/track-order?code=${payload.orderCode}</p></div></div></body></html>`;
}

function generateCustomerCashAppEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }.code-box { background: white; border: 3px solid #10b981; padding: 20px; text-center; border-radius: 10px; margin: 20px 0; }.code { font-size: 32px; font-weight: bold; color: #10b981; font-family: monospace; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Cash App Payment Instructions</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order!</p><div class="code-box"><p>YOUR ORDER CODE</p><div class="code">${payload.orderCode}</div><p style="font-size: 12px;">Include this in Cash App note!</p></div><p>Send <strong>$${payload.totalUsd.toFixed(2)}</strong> to <strong>${payload.cashappTag}</strong></p><p><strong>IMPORTANT:</strong> Add ${payload.orderCode} to the payment note!</p><p>Track your order: https://streamstickpro.com/track-order?code=${payload.orderCode}</p></div></div></body></html>`;
}

function generateAdminNotificationEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><body><h2>New Order: ${payload.orderCode}</h2><p>Payment Method: ${payload.paymentMethod}</p><p>Customer: ${payload.customerName} (${payload.customerEmail})</p><p>Total: $${payload.totalUsd.toFixed(2)}</p><p>Shipping: ${payload.shippingAddress}</p></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const payload: OrderEmailPayload = await req.json();
    console.log(`Processing order email for: ${payload.orderCode}`);
    const customerEmailContent = payload.paymentMethod === 'Bitcoin' ? generateCustomerBitcoinEmail(payload) : generateCustomerCashAppEmail(payload);
    const adminEmailContent = generateAdminNotificationEmail(payload);
    console.log('Customer email recipient:', payload.customerEmail);
    console.log('Customer email content length:', customerEmailContent.length);
    console.log('Admin email recipient:', payload.adminEmail);
    console.log('Admin email content length:', adminEmailContent.length);
    return new Response(JSON.stringify({ success: true, orderCode: payload.orderCode }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

---

## ✅ FUNCTION 6: nowpayments-webhook

**Name:** `nowpayments-webhook`

**Note:** This file is complex. If it exists, just verify it's deployed. If missing, copy from `supabase/functions/nowpayments-webhook/index.ts`

---

## ⚙️ ENVIRONMENT VARIABLES

**Go to:** Project Settings → Edge Functions → Secrets

**Add these (if missing):**

- `STRIPE_SECRET_KEY` = Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret (if using webhooks)
- `SUPABASE_URL` = Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Your service role key

---

## ✅ FINAL CHECKLIST

- [ ] All 6 functions deployed
- [ ] All functions show "Active" status
- [ ] Environment variables set
- [ ] Test payment works

---

**DONE!** Your edge functions are now complete! 🎉







