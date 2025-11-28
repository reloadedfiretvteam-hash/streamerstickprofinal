import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

// Stripe webhook signing helper using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const receivedSig = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !receivedSig) {
    return false;
  }

  // Check timestamp to prevent replay attacks (5 minute tolerance)
  const tolerance = 300; // 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > tolerance) {
    console.error("Webhook signature timestamp is too old");
    return false;
  }

  // Create the signed payload string
  const signedPayload = `${timestamp}.${payload}`;

  // Create HMAC-SHA256 signature using Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signedPayload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  if (expectedSig.length !== receivedSig.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    result |= expectedSig.charCodeAt(i) ^ receivedSig.charCodeAt(i);
  }

  return result === 0;
}

interface StripePaymentIntent {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: string;
  metadata: {
    product_id?: string;
    product_name?: string;
    customer_email?: string;
    customer_name?: string;
  };
  receipt_email?: string;
  created: number;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: StripePaymentIntent;
  };
  created: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeWebhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      throw new Error("Webhook secret not configured");
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get the raw request body
    const payload = await req.text();

    // Verify the webhook signature
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature header found");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isValid = await verifyStripeSignature(payload, signature, stripeWebhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the verified event
    const event: StripeEvent = JSON.parse(payload);

    console.log(`Received verified Stripe event: ${event.type}`);

    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      console.log(`Processing payment_intent.succeeded for: ${paymentIntent.id}`);

      const metadata = paymentIntent.metadata || {};
      const customerEmail = metadata.customer_email || paymentIntent.receipt_email || "";
      const customerName = metadata.customer_name || "";
      const productId = metadata.product_id || "";
      const productName = metadata.product_name || "";

      // Generate order number using payment intent ID suffix, timestamp, and random component for uniqueness
      const PAYMENT_ID_SUFFIX_LENGTH = 8;
      const randomComponent = crypto.getRandomValues(new Uint8Array(4))
        .reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
      const orderNumber = `ORD-${paymentIntent.id.slice(-PAYMENT_ID_SUFFIX_LENGTH).toUpperCase()}-${randomComponent.toUpperCase()}`;

      // Create order in Supabase
      const orderData = {
        order_number: orderNumber,
        stripe_payment_intent_id: paymentIntent.id,
        customer_name: customerName,
        customer_email: customerEmail,
        payment_method: "stripe",
        payment_status: "paid",
        order_status: "confirmed",
        subtotal: paymentIntent.amount / 100, // Convert cents to dollars
        tax: 0,
        total: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        items: productId ? [{
          product_id: productId,
          product_name: productName,
          quantity: 1,
          unit_price: paymentIntent.amount / 100,
          total_price: paymentIntent.amount / 100,
        }] : [],
        notes: `Stripe Payment Intent: ${paymentIntent.id}`,
        created_at: new Date(paymentIntent.created * 1000).toISOString(),
      };

      console.log(`Creating order: ${orderNumber}`);

      const orderResponse = await fetch(
        `${supabaseUrl}/rest/v1/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
            "Prefer": "return=representation",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Failed to create order:", errorText);
        // Don't throw - we still want to acknowledge the webhook
      } else {
        const createdOrder = await orderResponse.json();
        console.log(`Order created successfully: ${JSON.stringify(createdOrder)}`);
      }

      // Log the successful payment for tracking
      const paymentLogResponse = await fetch(
        `${supabaseUrl}/rest/v1/payment_transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
          body: JSON.stringify({
            transaction_id: paymentIntent.id,
            order_number: orderNumber,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            payment_method: "stripe",
            status: "completed",
            customer_email: customerEmail,
            metadata: metadata,
          }),
        }
      );

      if (!paymentLogResponse.ok) {
        console.warn("Failed to log payment transaction, but order was created");
      }
    }

    // Acknowledge receipt of the event
    return new Response(
      JSON.stringify({ received: true, event_id: event.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
