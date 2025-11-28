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

interface PaymentIntentRequest {
  // Single product checkout (backwards compatible)
  productId?: string;
  // Cart checkout (multiple items)
  items?: CartItem[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
}

interface StripeProduct {
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

    const payload: PaymentIntentRequest = await req.json();
    const { productId, items, customerEmail, customerName, customerPhone } = payload;

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Determine if this is a single product or cart checkout
    const cartItems: CartItem[] = items && items.length > 0
      ? items
      : productId
        ? [{ productId, quantity: 1 }]
        : [];

    if (cartItems.length === 0) {
      throw new Error("At least one product is required");
    }

    // Fetch all product IDs from cart and validate/encode them
    const productIds = cartItems.map(item => {
      // Validate product ID format (alphanumeric, hyphens, and underscores only)
      const sanitizedId = String(item.productId).replace(/[^a-zA-Z0-9_-]/g, '');
      return sanitizedId;
    }).filter(id => id.length > 0);

    if (productIds.length === 0) {
      throw new Error("No valid product IDs in cart");
    }

    // Fetch products from stripe_products table (security: prices come from server, not client)
    // Using properly encoded query parameters
    const encodedIds = productIds.map(id => encodeURIComponent(`"${id}"`)).join(",");
    const productResponse = await fetch(
      `${supabaseUrl}/rest/v1/stripe_products?id=in.(${encodedIds})&is_active=eq.true`,
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
      throw new Error("Failed to fetch products");
    }

    const products: StripeProduct[] = await productResponse.json();

    if (!products || products.length === 0) {
      throw new Error("No valid products found");
    }

    // Create a map for quick lookup
    const productMap = new Map<string, StripeProduct>();
    products.forEach(p => productMap.set(p.id, p));

    // Calculate total and build line items description
    let totalAmount = 0;
    const lineItems: string[] = [];
    const itemsMetadata: Array<{ id: string; name: string; quantity: number; price: number }> = [];

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      // Use sale_price if available, otherwise use regular price
      const unitPrice = product.sale_price || product.price;
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      lineItems.push(`${product.name} x${item.quantity}`);
      itemsMetadata.push({
        id: product.id,
        name: product.name,
        quantity: item.quantity,
        price: unitPrice,
      });
    }

    // Convert to cents for Stripe (Stripe requires amounts in smallest currency unit)
    const amountInCents = Math.round(totalAmount * 100);

    // Build description
    const description = lineItems.length === 1
      ? `Payment for ${lineItems[0]}`
      : `Payment for ${lineItems.length} items: ${lineItems.join(", ")}`;

    // Truncate description if too long (Stripe limit is 1000 chars, we use a safe limit)
    const MAX_DESCRIPTION_LENGTH = 500;
    const ELLIPSIS = "...";
    const truncatedDescription = description.length > MAX_DESCRIPTION_LENGTH
      ? description.substring(0, MAX_DESCRIPTION_LENGTH - ELLIPSIS.length) + ELLIPSIS
      : description;

    // Create Stripe PaymentIntent
    const formData = new URLSearchParams({
      amount: amountInCents.toString(),
      currency: "usd",
      "automatic_payment_methods[enabled]": "true",
      "metadata[customer_email]": customerEmail,
      "metadata[customer_name]": customerName,
      "metadata[item_count]": cartItems.length.toString(),
      "metadata[items_json]": JSON.stringify(itemsMetadata).substring(0, 500),
      description: truncatedDescription,
      receipt_email: customerEmail,
      statement_descriptor_suffix: "PRO DIGITAL",
    });

    // Add single product metadata for backwards compatibility
    if (cartItems.length === 1) {
      const singleProduct = productMap.get(cartItems[0].productId);
      if (singleProduct) {
        formData.append("metadata[product_id]", singleProduct.id);
        formData.append("metadata[product_name]", singleProduct.name);
      }
    }

    if (customerPhone) {
      formData.append("metadata[customer_phone]", customerPhone);
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create payment intent");
    }

    const paymentIntent = await stripeResponse.json();

    // Log the payment intent creation
    console.log(`PaymentIntent created: ${paymentIntent.id} for ${cartItems.length} item(s), amount: $${totalAmount.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        itemCount: cartItems.length,
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
