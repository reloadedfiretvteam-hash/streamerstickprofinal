import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentIntentRequest {
  productId: string;
  customerEmail: string;
  customerName: string;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const payload: PaymentIntentRequest = await req.json();
    const { productId, customerEmail, customerName } = payload;

    if (!productId) {
      throw new Error("Product ID is required");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Fetch the product from stripe_products table
    const productResponse = await fetch(
      `${supabaseUrl}/rest/v1/stripe_products?id=eq.${productId}&is_active=eq.true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
      }
    );

    if (!productResponse.ok) {
      throw new Error("Failed to fetch product");
    }

    const products = await productResponse.json();

    if (!products || products.length === 0) {
      throw new Error("Product not found or inactive");
    }

    const product = products[0];
    
    // Use sale_price if available, otherwise use regular price
    const amount = product.sale_price || product.price;
    
    // Convert to cents for Stripe (Stripe requires amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create a Stripe PaymentIntent
    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: "usd",
        "automatic_payment_methods[enabled]": "true",
        "metadata[product_id]": productId,
        "metadata[product_name]": product.name,
        "metadata[customer_email]": customerEmail,
        "metadata[customer_name]": customerName,
        description: `Payment for ${product.name}`,
        receipt_email: customerEmail,
        statement_descriptor_suffix: "PRO DIGITAL",
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create payment intent");
    }

    const paymentIntent = await stripeResponse.json();

    // Log the payment intent creation (optional - for debugging)
    console.log(`PaymentIntent created: ${paymentIntent.id} for product: ${product.name}, amount: $${amount}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
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
    console.error("Error creating payment intent:", errorMessage);

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
