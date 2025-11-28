import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      status: string;
      metadata: Record<string, string>;
      receipt_email?: string;
    };
  };
}

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

/**
 * Computes HMAC-SHA256 for Stripe webhook signature verification
 */
async function computeHmac(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies Stripe webhook signature
 * Returns true if valid, false otherwise
 */
async function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  // Parse the signature header
  const elements = signature.split(",");
  const signatureParts: Record<string, string> = {};

  for (const element of elements) {
    const parts = element.split("=");
    // Validate that we have exactly a key=value pair
    if (parts.length >= 2) {
      const key = parts[0];
      // Join remaining parts in case value contains '='
      const value = parts.slice(1).join("=");
      if (key && value) {
        signatureParts[key] = value;
      }
    }
  }

  const timestamp = signatureParts["t"];
  const expectedSignature = signatureParts["v1"];

  if (!timestamp || !expectedSignature) {
    console.error("Missing timestamp or signature in header");
    return false;
  }

  // Check timestamp tolerance (5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  const eventTime = parseInt(timestamp, 10);
  const tolerance = 300; // 5 minutes

  if (Math.abs(currentTime - eventTime) > tolerance) {
    console.error("Webhook timestamp outside tolerance window");
    return false;
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = await computeHmac(webhookSecret, signedPayload);

  // Constant-time comparison
  if (computedSignature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < computedSignature.length; i++) {
    result |= computedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      throw new Error("Webhook secret not configured");
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get the raw body and signature
    const rawBody = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    if (!signature) {
      console.error("No Stripe signature found in request");
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Cryptographically verify the webhook signature
    const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid Stripe webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the event after verification
    const event: StripeEvent = JSON.parse(rawBody);

    console.log(`Received Stripe webhook: ${event.type}, event ID: ${event.id}`);

    // Handle the payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      // Parse cart items from metadata
      let cartItems: CartItem[] = [];
      try {
        if (paymentIntent.metadata?.cart_items) {
          cartItems = JSON.parse(paymentIntent.metadata.cart_items);
        }
      } catch (parseError) {
        console.error("Failed to parse cart_items from metadata:", parseError);
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Prepare order items for database
      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.qty,
        unit_price: item.price,
        total_price: item.price * item.qty,
      }));

      // Create order in database
      const orderPayload = {
        order_number: orderNumber,
        customer_name: paymentIntent.metadata?.customer_name || "",
        customer_email: paymentIntent.metadata?.customer_email || paymentIntent.receipt_email || "",
        payment_method: "stripe",
        payment_status: "completed",
        order_status: "processing",
        stripe_payment_intent_id: paymentIntent.id,
        subtotal: paymentIntent.amount / 100,
        tax: 0,
        total: paymentIntent.amount / 100,
        items: orderItems,
        notes: `Stripe payment completed. PaymentIntent: ${paymentIntent.id}`,
      };

      const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          Prefer: "return=representation",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Failed to create order:", errorText);
        // Don't throw - we want to acknowledge the webhook even if order creation fails
        // The payment was successful, so we should not trigger Stripe retries
      } else {
        const orders = await orderResponse.json();
        const order = Array.isArray(orders) ? orders[0] : orders;
        console.log(`Order created successfully: ${orderNumber}, ID: ${order?.id}`);
      }

      // Log email for sending (actual email sending would be done by a separate process)
      // Validate email format before logging
      const recipientEmail = paymentIntent.metadata?.customer_email || paymentIntent.receipt_email || "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (recipientEmail && emailRegex.test(recipientEmail)) {
        try {
          const emailResponse = await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
            },
            body: JSON.stringify({
              recipient: recipientEmail,
              template_key: "stripe_order_confirmation",
              subject: `Order Confirmation - ${orderNumber}`,
              body: `Thank you for your order! Your order number is ${orderNumber}. Amount: $${(paymentIntent.amount / 100).toFixed(2)}`,
              status: "pending",
            }),
          });

          if (!emailResponse.ok) {
            console.error("Failed to log email:", await emailResponse.text());
          }
        } catch (emailError) {
          console.error("Error logging email:", emailError);
          // Continue processing - don't fail the webhook for email logging issues
        }
      } else {
        console.warn(`Invalid or missing email address for order ${orderNumber}: ${recipientEmail}`);
      }

      console.log(`Payment succeeded for PaymentIntent: ${paymentIntent.id}, Order: ${orderNumber}`);
    }

    // Acknowledge receipt of the webhook
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Webhook error:", errorMessage);

    // Return 200 to acknowledge receipt and prevent retries for parsing errors
    // Only return error status for signature verification failures
    return new Response(
      JSON.stringify({
        error: errorMessage,
        received: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
