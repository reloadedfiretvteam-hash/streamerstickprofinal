import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
};

// Simple HMAC-SHA256 implementation for Stripe signature verification
async function computeHmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataToSign = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string
): Promise<boolean> {
  const parts = signatureHeader.split(",");
  let timestamp = "";
  let signature = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") signature = value;
  }

  if (!timestamp || !signature) {
    return false;
  }

  // Check timestamp is within 5 minutes
  const timestampNum = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNum) > 300) {
    console.error("Webhook timestamp too old");
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = await computeHmacSha256(webhookSecret, signedPayload);

  return signature === expectedSignature;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const signatureHeader = req.headers.get("stripe-signature");
    if (!signatureHeader) {
      throw new Error("Missing Stripe signature header");
    }

    const body = await req.text();

    // Verify the webhook signature
    const isValid = await verifyStripeSignature(body, signatureHeader, webhookSecret);
    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }

    const event = JSON.parse(body);

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      const customerEmail = session.customer_email || session.metadata?.customer_email;
      const customerName = session.metadata?.customer_name || "Customer";
      const amountTotal = session.amount_total / 100; // Convert from cents
      const paymentIntentId = session.payment_intent;
      const sessionId = session.id;

      // Generate order number
      const orderNumber = `STR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create order in database
      const orderData = {
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        payment_method: "stripe",
        payment_status: "paid",
        order_status: "processing",
        total: amountTotal,
        subtotal: amountTotal,
        tax: 0,
        notes: `Stripe Payment Intent: ${paymentIntentId}, Session: ${sessionId}`,
        items: [], // Will be populated from line items if needed
      };

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
        throw new Error("Failed to create order in database");
      }

      const createdOrder = await orderResponse.json();
      console.log(`Order created: ${orderNumber} for ${customerEmail}`);

      // Log email for order confirmation
      const emailLogResponse = await fetch(
        `${supabaseUrl}/rest/v1/email_logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
          body: JSON.stringify({
            recipient: customerEmail,
            template_key: "stripe_order_confirmation",
            subject: `Order Confirmation - ${orderNumber}`,
            body: `Thank you for your order!\n\nOrder Number: ${orderNumber}\nAmount: $${amountTotal.toFixed(2)}\n\nYour order is being processed.`,
            status: "pending",
          }),
        }
      );

      if (!emailLogResponse.ok) {
        console.error("Failed to log confirmation email");
      }
    }

    // Handle payment_intent.succeeded for additional tracking
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log(`Payment succeeded: ${paymentIntent.id}`);
    }

    // Handle payment_intent.payment_failed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.error(`Payment failed: ${paymentIntent.id}`, paymentIntent.last_payment_error?.message);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Webhook error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
