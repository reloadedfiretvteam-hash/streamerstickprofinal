import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
}

interface ProductRecord {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
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

    const payload: CheckoutRequest = await req.json();
    const { items, customerEmail, customerName } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Cart items are required");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Extract product IDs from cart items
    const productIds = items.map((item) => item.productId);

    // SECURITY: Fetch product prices from the database (source of truth)
    // The frontend only sends product IDs - we look up the actual prices server-side
    const productIdsQuery = productIds.map((id) => `"${id}"`).join(",");
    const productResponse = await fetch(
      `${supabaseUrl}/rest/v1/real_products?id=in.(${productIdsQuery})&status=in.(published,publish,active)`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      }
    );

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error("Failed to fetch products:", errorText);
      throw new Error("Failed to fetch product information");
    }

    const products: ProductRecord[] = await productResponse.json();

    if (!products || products.length === 0) {
      throw new Error("No valid products found in cart");
    }

    // SECURITY: Calculate total amount on the server using database prices
    let totalAmountCents = 0;
    const lineItems: { productId: string; name: string; quantity: number; unitPrice: number; total: number }[] = [];
    const invalidProducts: string[] = [];

    for (const cartItem of items) {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) {
        invalidProducts.push(cartItem.productId);
        continue;
      }

      // Use sale_price if available, otherwise use regular price
      const unitPrice = product.sale_price ?? product.price;
      const quantity = Math.max(1, Math.floor(cartItem.quantity)); // Ensure positive integer
      const itemTotal = unitPrice * quantity;
      
      totalAmountCents += Math.round(itemTotal * 100); // Convert to cents

      lineItems.push({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice,
        total: itemTotal,
      });
    }

    // SECURITY: Reject checkout if any products are invalid
    // This prevents price manipulation by mixing invalid products with valid ones
    if (invalidProducts.length > 0) {
      console.error(`Invalid product IDs in cart: ${invalidProducts.join(", ")}`);
      throw new Error(`One or more products in your cart are no longer available. Please refresh and try again.`);
    }

    if (totalAmountCents <= 0) {
      throw new Error("Cart total must be greater than zero");
    }

    // Create line items description for Stripe
    const description = lineItems
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");

    // Create a Stripe PaymentIntent with the server-calculated total
    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: totalAmountCents.toString(),
        currency: "usd",
        "automatic_payment_methods[enabled]": "true",
        "metadata[cart_items]": JSON.stringify(lineItems.map((item) => ({
          id: item.productId,
          name: item.name,
          qty: item.quantity,
          price: item.unitPrice,
        }))),
        "metadata[customer_email]": customerEmail,
        "metadata[customer_name]": customerName || "",
        description: description.substring(0, 1000), // Stripe limits description length
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

    // Log the payment intent creation
    console.log(
      `PaymentIntent created: ${paymentIntent.id}, amount: $${(totalAmountCents / 100).toFixed(2)}, items: ${lineItems.length}`
    );

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmountCents / 100, // Return amount in dollars for display
        items: lineItems, // Return validated line items
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
    console.error("Error in checkout:", errorMessage);

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
