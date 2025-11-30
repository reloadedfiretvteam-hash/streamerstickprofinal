import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface PaymentIntentRequest {
  productId: string;
  customerEmail: string;
  customerName: string;
}

// Fallback product amounts (in dollars) for known product codes
// Used when stripe_products table is unavailable or product not found
const FALLBACK_PRODUCTS: Record<string, { amount: number; cloaked_name: string }> = {
  "starter": { amount: 99.99, cloaked_name: "Digital Entertainment Service - Basic" },
  "pro": { amount: 199.99, cloaked_name: "Digital Entertainment Service - Pro" },
  "elite": { amount: 299.99, cloaked_name: "Digital Entertainment Service - Elite" },
  "premium": { amount: 399.99, cloaked_name: "Digital Entertainment Service - Premium" },
};

/**
 * Get CORS headers based on the request origin and ALLOWED_ORIGINS env var
 * @param requestOrigin - The Origin header from the request
 * @returns CORS headers object
 */
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS") || "";
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  // Default fallback origins (for development)
  const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://streamstickpro.com",
    "https://www.streamstickpro.com",
  ];

  // Combine configured and default origins
  const allAllowedOrigins = [...new Set([...allowedOrigins, ...defaultOrigins])];

  // Check if request origin is allowed
  let allowedOrigin = "";
  if (requestOrigin && allAllowedOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else if (requestOrigin && requestOrigin.endsWith(".pages.dev")) {
    // Allow Cloudflare Pages preview deployments
    allowedOrigin = requestOrigin;
  } else if (allowedOrigins.length === 0) {
    // If no ALLOWED_ORIGINS configured, default to * for backwards compatibility
    allowedOrigin = "*";
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight with 204 No Content
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST method for payment intent creation
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
    // Get Stripe secret key from environment or attempt fallback to site_settings
    let stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("VITE_STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Payment service configuration error. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no Stripe key in env, try to fetch from site_settings
    if (!stripeSecretKey) {
      try {
        const settingsResponse = await fetch(
          `${supabaseUrl}/rest/v1/site_settings?setting_key=eq.stripe_secret_key&select=setting_value`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
          }
        );
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          if (settings && settings.length > 0 && settings[0].setting_value) {
            stripeSecretKey = settings[0].setting_value;
          }
        }
      } catch (e) {
        console.error("Failed to fetch Stripe key from site_settings:", e);
      }
    }

    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Payment processing is not configured. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let payload: PaymentIntentRequest;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { productId, customerEmail, customerName } = payload;

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "Product ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize product ID to prevent injection attacks
    // Allow alphanumeric, hyphens, underscores, and dots (common in product IDs like prod_abc.123)
    const sanitizedProductId = productId.replace(/[^a-zA-Z0-9-_.]/g, "");

    // Ensure product ID is not empty after sanitization
    if (!sanitizedProductId) {
      return new Response(
        JSON.stringify({ error: "Invalid product ID format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to fetch the product from stripe_products table
    let amount: number;
    let currency = "usd";
    let cloakedName: string;
    let realProductName: string;

    try {
      const productResponse = await fetch(
        `${supabaseUrl}/rest/v1/stripe_products?id=eq.${encodeURIComponent(sanitizedProductId)}&is_active=eq.true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
        }
      );

      if (productResponse.ok) {
        const products = await productResponse.json();

        if (products && products.length > 0) {
          const product = products[0];

          // Use sale_price if available, otherwise use regular price
          amount = parseFloat(product.sale_price) || parseFloat(product.price);
          currency = product.currency || "usd";
          realProductName = product.name;

          // Use cloaked_name if available, otherwise generate a compliant description
          cloakedName = product.cloaked_name || 
            product.short_description || 
            "Digital Entertainment Service";
        } else {
          // Product not found in database - check fallback
          const fallback = FALLBACK_PRODUCTS[sanitizedProductId.toLowerCase()];
          if (fallback) {
            amount = fallback.amount;
            cloakedName = fallback.cloaked_name;
            realProductName = sanitizedProductId;
          } else {
            return new Response(
              JSON.stringify({ error: "Product not found or inactive" }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      } else {
        // Database query failed - check fallback
        const fallback = FALLBACK_PRODUCTS[sanitizedProductId.toLowerCase()];
        if (fallback) {
          amount = fallback.amount;
          cloakedName = fallback.cloaked_name;
          realProductName = sanitizedProductId;
        } else {
          console.error("Failed to fetch product from database");
          return new Response(
            JSON.stringify({ error: "Unable to retrieve product information" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    } catch (e) {
      // Database error - check fallback
      console.error("Database error:", e);
      const fallback = FALLBACK_PRODUCTS[sanitizedProductId.toLowerCase()];
      if (fallback) {
        amount = fallback.amount;
        cloakedName = fallback.cloaked_name;
        realProductName = sanitizedProductId;
      } else {
        return new Response(
          JSON.stringify({ error: "Unable to retrieve product information" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Convert to cents for Stripe (Stripe requires amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Build payment intent parameters with CLOAKED name for Stripe
    // Stripe will see the cloaked name, but metadata contains the real product info
    const paymentParams: Record<string, string> = {
      amount: amountInCents.toString(),
      currency: currency.toLowerCase(),
      // Enable automatic_payment_methods for Apple Pay, Google Pay, Cash App Pay, etc.
      "automatic_payment_methods[enabled]": "true",
      // Use CLOAKED name for Stripe description (what appears on statements)
      description: cloakedName,
      // Receipt email
      receipt_email: customerEmail,
      // Statement descriptor (max 22 chars, only appears if not overridden by Stripe account settings)
      statement_descriptor_suffix: "PRO DIGITAL",
      // Metadata contains CLOAKED product info (for compliance)
      "metadata[product_id]": sanitizedProductId,
      "metadata[product_name_cloaked]": cloakedName,
      "metadata[customer_email]": customerEmail,
    };

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
      return new Response(
        JSON.stringify({
          error: errorData.error?.message || "Failed to create payment intent",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const paymentIntent = await stripeResponse.json();

    // Log the payment intent creation (cloaked info only in logs)
    console.log(
      `PaymentIntent created: ${paymentIntent.id} for product: ${realProductName}, cloaked as: ${cloakedName}, amount: $${amount}`
    );

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating payment intent:", errorMessage);

    return new Response(
      JSON.stringify({
        error: "Payment processing failed. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
