import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
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

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const payload: CheckoutRequest = await req.json();
    const { items, successUrl, cancelUrl, customerEmail } = payload;

    if (!items || items.length === 0) {
      throw new Error("Cart items are required");
    }

    if (!successUrl || !cancelUrl) {
      throw new Error("Success and cancel URLs are required");
    }

    // Build line items for Stripe Checkout
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.image && { images: [item.image] }),
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Build the request body for Stripe
    const bodyParams = new URLSearchParams();
    bodyParams.append("mode", "payment");
    bodyParams.append("success_url", `${successUrl}?session_id={CHECKOUT_SESSION_ID}`);
    bodyParams.append("cancel_url", cancelUrl);
    
    // Add line items
    lineItems.forEach((item, index) => {
      bodyParams.append(`line_items[${index}][price_data][currency]`, item.price_data.currency);
      bodyParams.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);
      if (item.price_data.product_data.images && Array.isArray(item.price_data.product_data.images) && item.price_data.product_data.images.length > 0) {
        bodyParams.append(`line_items[${index}][price_data][product_data][images][0]`, item.price_data.product_data.images[0]);
      }
      bodyParams.append(`line_items[${index}][price_data][unit_amount]`, item.price_data.unit_amount.toString());
      bodyParams.append(`line_items[${index}][quantity]`, item.quantity.toString());
    });

    // Add customer email if provided
    if (customerEmail) {
      bodyParams.append("customer_email", customerEmail);
    }

    // Add metadata for order tracking
    bodyParams.append("metadata[cart_items]", JSON.stringify(items.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }))));

    // Create Stripe Checkout Session
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create checkout session");
    }

    const session = await stripeResponse.json();

    // Log the session creation
    console.log(`Checkout session created: ${session.id}`);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating checkout session:", errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
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
