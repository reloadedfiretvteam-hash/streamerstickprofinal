import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Simple HMAC-SHA256 implementation for Stripe signature verification
async function computeHmacSha256(key: string, message: string): Promise<string> {
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
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify Stripe webhook signature
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse the signature header
    const parts = signature.split(',');
    let timestamp = '';
    let v1Signatures: string[] = [];
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        v1Signatures.push(value);
      }
    }
    
    if (!timestamp || v1Signatures.length === 0) {
      console.error('Invalid signature format');
      return false;
    }
    
    // Check timestamp tolerance (5 minutes)
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampNum) > 300) {
      console.error('Webhook timestamp too old');
      return false;
    }
    
    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = await computeHmacSha256(secret, signedPayload);
    
    // Check if any v1 signature matches
    return v1Signatures.some(sig => sig === expectedSignature);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    const body = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    // Verify webhook signature if secret is configured
    if (stripeWebhookSecret && signature) {
      const isValid = await verifyStripeSignature(body, signature, stripeWebhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else if (stripeWebhookSecret && !signature) {
      // Webhook secret is configured but no signature provided - reject the request
      console.error("Webhook signature missing, verification is required");
      return new Response(
        JSON.stringify({ error: "Signature required" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const event = JSON.parse(body);

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Extract order details from session
      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerName = session.customer_details?.name || "Customer";
      const amountTotal = session.amount_total / 100; // Convert from cents
      const paymentStatus = session.payment_status;
      const sessionId = session.id;

      // Parse cart items from metadata
      let cartItems: CartItem[] = [];
      if (session.metadata?.cart_items) {
        try {
          cartItems = JSON.parse(session.metadata.cart_items);
        } catch (e) {
          console.error("Failed to parse cart items:", e);
        }
      }

      // Generate order number using crypto for better entropy
      const randomBytes = new Uint8Array(4);
      crypto.getRandomValues(randomBytes);
      const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${randomHex.slice(0, 6)}`;

      // Create order in database
      const orderPayload = {
        order_number: orderNumber,
        customer_email: customerEmail,
        customer_name: customerName,
        payment_method: "stripe",
        payment_status: paymentStatus === "paid" ? "paid" : "pending",
        order_status: "processing",
        subtotal: amountTotal,
        tax: 0,
        total: amountTotal,
        items: cartItems.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
        notes: `Stripe Session: ${sessionId}`,
      };

      const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Prefer": "return=representation",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.text();
        console.error("Failed to create order:", error);
        throw new Error("Failed to create order");
      }

      const orders = await orderResponse.json();
      const order = Array.isArray(orders) ? orders[0] : orders;

      console.log(`Order created: ${orderNumber}`);

      // Log email for confirmation (would be sent via email service)
      const emailLogPayload = {
        recipient: customerEmail,
        template_key: "stripe_order_confirmation",
        subject: `Order Confirmation - ${orderNumber}`,
        body: `
Thank you for your order!

Order Number: ${orderNumber}
Total: $${amountTotal.toFixed(2)}

Items:
${cartItems.map((item) => `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

Your order is being processed and you will receive updates via email.

Thank you for choosing StreamStickPro!
        `,
        status: "pending",
      };

      await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
        },
        body: JSON.stringify(emailLogPayload),
      });

      console.log("Email logged for order:", orderNumber);
    }

    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
    }

    // Handle payment_intent.payment_failed event
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.error(`PaymentIntent failed: ${paymentIntent.id}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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
