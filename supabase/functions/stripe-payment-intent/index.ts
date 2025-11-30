import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

interface PaymentIntentRequest {
  productId?: string;
  productIds?: string[];
  amount?: number; // Amount in cents
  currency?: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
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
    const { productId, productIds, amount, currency = 'usd', customerEmail, customerName, metadata = {} } = payload;

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new Error("Invalid email format");
    }

    let amountInCents: number;
    let productName = 'Order';
    let productMetadata: Record<string, string> = { ...metadata };

    // If amount is directly provided (for cart checkout), use it
    if (amount && amount > 0) {
      amountInCents = Math.round(amount);
    }
    // Otherwise, fetch product(s) to calculate amount
    else {
      let productIdToFetch = productId;
      let productIdsToFetch = productIds || [];

      // If single productId provided, convert to array
      if (productIdToFetch && productIdsToFetch.length === 0) {
        productIdsToFetch = [productIdToFetch];
      }

      if (productIdsToFetch.length === 0) {
        throw new Error("Product ID(s) or amount is required");
      }

      // Fetch products from real_products table (or stripe_products as fallback)
      const productIdsParam = productIdsToFetch.map(id => {
        const sanitized = id.replace(/[^a-zA-Z0-9-_.]/g, '');
        return `id.eq.${sanitized}`;
      }).join(',or=');

      // Try real_products first
      let productResponse = await fetch(
        `${supabaseUrl}/rest/v1/real_products?select=*&or=(${productIdsParam})`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
        }
      );

      if (!productResponse.ok || !(await productResponse.json()).length) {
        // Fallback to stripe_products
        productResponse = await fetch(
          `${supabaseUrl}/rest/v1/stripe_products?select=*&or=(${productIdsParam})`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
          }
        );
      }

      if (!productResponse.ok) {
        throw new Error("Failed to fetch products");
      }

      const products = await productResponse.json();

      if (!products || products.length === 0) {
        throw new Error("Product(s) not found or inactive");
      }

      // Calculate total from products
      let totalAmount = 0;
      const productNames: string[] = [];

      for (const product of products) {
        const price = product.sale_price || product.price;
        totalAmount += parseFloat(price || 0);
        productNames.push(product.name || 'Product');
      }

      productName = productNames.length === 1 ? productNames[0] : `${productNames.length} items`;
      amountInCents = Math.round(totalAmount * 100);
      productMetadata = {
        ...productMetadata,
        product_ids: productIdsToFetch.join(','),
        product_names: productNames.join(', ')
      };
    }

    // Create a Stripe PaymentIntent with ALL payment methods enabled
    // Build payment intent parameters
    const paymentParams: Record<string, string> = {
      amount: amountInCents.toString(),
      currency: currency,
      "automatic_payment_methods[enabled]": "true",
      // Enable all payment methods including Google Pay, Apple Pay, Cash App Pay, etc.
      "payment_method_types[]": "card",
      "metadata[customer_email]": customerEmail,
      description: `Payment for ${productName}`,
      receipt_email: customerEmail,
      statement_descriptor_suffix: "STREAMSTICK",
    };
    
    // Add all metadata
    Object.entries(productMetadata).forEach(([key, value]) => {
      paymentParams[`metadata[${key}]`] = String(value);
    });

    // Only add customer_name to metadata if provided
    if (customerName && customerName.trim()) {
      paymentParams["metadata[customer_name]"] = customerName.trim();
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(paymentParams),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create payment intent");
    }

    const paymentIntent = await stripeResponse.json();

    // Log the payment intent creation (optional - for debugging)
    const displayAmount = (amountInCents / 100).toFixed(2);
    console.log(`PaymentIntent created: ${paymentIntent.id} for ${productName}, amount: $${displayAmount}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: (amountInCents / 100).toFixed(2),
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
