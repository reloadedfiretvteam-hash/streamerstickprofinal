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
    // For now, we'll process the event directly
    // In production, you should verify the signature using Stripe's library

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

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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
