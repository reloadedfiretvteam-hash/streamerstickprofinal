import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface PaymentIntentRequest {
  productId?: string;
  productIds?: string[];
  amount?: number; // Amount in cents
  currency?: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

// Fallback product amounts (in dollars) for known product codes
const FALLBACK_PRODUCTS: Record<string, { amount: number; cloaked_name: string }> = {
  "starter": { amount: 99.99, cloaked_name: "Digital Entertainment Service - Basic" },
  "pro": { amount: 199.99, cloaked_name: "Digital Entertainment Service - Pro" },
  "elite": { amount: 299.99, cloaked_name: "Digital Entertainment Service - Elite" },
  "premium": { amount: 399.99, cloaked_name: "Digital Entertainment Service - Premium" },
};

/**
 * Get CORS headers - supports Cloudflare Pages and all origins
 */
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS") || "";
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://streamstickpro.com",
    "https://www.streamstickpro.com",
  ];

  const allAllowedOrigins = [...new Set([...allowedOrigins, ...defaultOrigins])];

  let allowedOrigin = "";
  if (requestOrigin && allAllowedOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else if (requestOrigin && requestOrigin.endsWith(".pages.dev")) {
    const pagesDomain = requestOrigin.replace(/^https?:\/\//, "");
    const parts = pagesDomain.split(".");
    if (parts.length >= 3 && parts[parts.length - 1] === "dev" && parts[parts.length - 2] === "pages") {
      allowedOrigin = requestOrigin;
    }
  } else if (allowedOrigins.length === 0) {
    allowedOrigin = "*";
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Accept, Origin",
    "Access-Control-Max-Age": "86400",
  };
}

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

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
    let stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("VITE_STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Payment service configuration error. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to fetch Stripe key from site_settings if not in env
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
      return new Response(
        JSON.stringify({ error: "Payment processing is not configured. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const { productId, productIds, amount, currency = 'usd', customerEmail, customerName, metadata = {} } = payload;

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    let amountInCents: number;
    let productName = 'Order';
    let productMetadata: Record<string, string> = { ...metadata };

    // If amount is directly provided (for cart checkout), use it
    // BUT we still need to fetch products to get cloaked names for Stripe
    if (amount && amount > 0) {
      amountInCents = Math.round(amount);
      
      // Even if amount is provided, try to fetch products for cloaked names
      if (productIds && productIds.length > 0) {
        const sanitizedIds = productIds.map(id => id.replace(/[^a-zA-Z0-9-_.]/g, ''));
        const productIdsParam = sanitizedIds.map(id => `id.eq.${id}`).join(',or=');
        
        try {
          let productResponse = await fetch(
            `${supabaseUrl}/rest/v1/real_products?select=id,name,cloaked_name,category&or=(${productIdsParam})`,
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
            const products = await productResponse.json() || [];
            if (products.length > 0) {
              const cloakedNames: string[] = [];
              const realNames: string[] = [];
              
              for (const product of products) {
                const realName = product.name || 'Product';
                realNames.push(realName);
                
                let cloakedName = product.cloaked_name;
                if (!cloakedName || cloakedName.trim() === '') {
                  const category = (product.category || '').toLowerCase();
                  if (category.includes('fire') || category.includes('stick')) {
                    cloakedName = 'Digital Entertainment Service - Hardware Bundle';
                  } else if (category.includes('iptv') || category.includes('subscription')) {
                    cloakedName = 'Digital Entertainment Service - Subscription';
                  } else {
                    cloakedName = 'Digital Entertainment Service';
                  }
                }
                cloakedNames.push(cloakedName);
              }
              
              // Update product name and metadata with cloaked names
              productName = cloakedNames.length === 1 ? cloakedNames[0] : `${cloakedNames.length} Digital Entertainment Services`;
              productMetadata = {
                ...productMetadata,
                product_ids: sanitizedIds.join(','),
                product_names: realNames.join(', '), // REAL names for customer
                product_names_cloaked: cloakedNames.join(', ') // CLOAKED names for Stripe
              };
            }
          }
        } catch (e) {
          console.error("Error fetching products for cloaked names:", e);
          // Continue with default cloaked name if fetch fails
          productName = 'Digital Entertainment Service';
        }
      }
    }
    // Otherwise, fetch product(s) to calculate amount
    else {
      let productIdToFetch = productId;
      let productIdsToFetch = productIds || [];

      if (productIdToFetch && productIdsToFetch.length === 0) {
        productIdsToFetch = [productIdToFetch];
      }

      if (productIdsToFetch.length === 0) {
        return new Response(
          JSON.stringify({ error: "Product ID(s) or amount is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Sanitize product IDs
      const sanitizedIds = productIdsToFetch.map(id => id.replace(/[^a-zA-Z0-9-_.]/g, ''));
      const productIdsParam = sanitizedIds.map(id => `id.eq.${id}`).join(',or=');

      // Try real_products first, then stripe_products, then fallback
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

      let products: any[] = [];
      if (productResponse.ok) {
        products = await productResponse.json() || [];
      }

      if (products.length === 0) {
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

        if (productResponse.ok) {
          products = await productResponse.json() || [];
        }
      }

      if (products.length === 0) {
        // Try fallback products
        const fallback = sanitizedIds.length === 1 ? FALLBACK_PRODUCTS[sanitizedIds[0].toLowerCase()] : null;
        if (fallback) {
          amountInCents = Math.round(fallback.amount * 100);
          productName = fallback.cloaked_name;
          productMetadata = {
            ...productMetadata,
            product_ids: sanitizedIds.join(','),
            product_name: fallback.cloaked_name
          };
        } else {
          return new Response(
            JSON.stringify({ error: "Product(s) not found or inactive" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // Calculate total from products
        let totalAmount = 0;
        const cloakedNames: string[] = []; // For Stripe (compliance)
        const realNames: string[] = []; // For customer emails/orders

        for (const product of products) {
          const salePrice = parseFloat(product.sale_price);
          const regularPrice = parseFloat(product.price);
          const price = !isNaN(salePrice) && product.sale_price !== null ? salePrice : regularPrice;
          totalAmount += price;
          
          // Get real product name (what customer sees)
          const realName = product.name || product.short_description || 'Product';
          realNames.push(realName);
          
          // Get cloaked name (what Stripe sees - for compliance)
          // If no cloaked_name exists, generate a compliant one based on category
          let cloakedName = product.cloaked_name;
          if (!cloakedName || cloakedName.trim() === '') {
            // Generate compliant name based on category
            const category = (product.category || '').toLowerCase();
            if (category.includes('fire') || category.includes('stick')) {
              cloakedName = 'Digital Entertainment Service - Hardware Bundle';
            } else if (category.includes('iptv') || category.includes('subscription')) {
              cloakedName = 'Digital Entertainment Service - Subscription';
            } else {
              cloakedName = 'Digital Entertainment Service';
            }
          }
          cloakedNames.push(cloakedName);
        }

        // Use CLOAKED names for Stripe description (compliance requirement)
        productName = cloakedNames.length === 1 ? cloakedNames[0] : `${cloakedNames.length} Digital Entertainment Services`;
        amountInCents = Math.round(totalAmount * 100);
        
        // Store BOTH real names (for customer) and cloaked names (for Stripe) in metadata
        productMetadata = {
          ...productMetadata,
          product_ids: sanitizedIds.join(','),
          product_names: realNames.join(', '), // REAL names for customer emails
          product_names_cloaked: cloakedNames.join(', ') // CLOAKED names for Stripe (compliance)
        };
      }
    }

    // Create Stripe PaymentIntent with ALL payment methods enabled
    const paymentParams: Record<string, string> = {
      amount: amountInCents.toString(),
      currency: currency.toLowerCase(),
      "automatic_payment_methods[enabled]": "true",
      "payment_method_types[]": "card",
      "metadata[customer_email]": customerEmail,
      description: productName,
      receipt_email: customerEmail,
      statement_descriptor_suffix: "STREAMSTICK",
    };
    
    Object.entries(productMetadata).forEach(([key, value]) => {
      paymentParams[`metadata[${key}]`] = String(value);
    });

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
    const displayAmount = (amountInCents / 100).toFixed(2);
    console.log(`PaymentIntent created: ${paymentIntent.id} for ${productName}, amount: $${displayAmount}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: displayAmount,
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
