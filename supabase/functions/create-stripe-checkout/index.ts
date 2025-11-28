import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customerEmail: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
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
    const { items, customerEmail, customerName, successUrl, cancelUrl } = payload;

    if (!items || items.length === 0) {
      throw new Error("Cart items are required");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://streamstickpro.com";
    const finalSuccessUrl = successUrl || `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${origin}/order/cancel`;

    // Prepare line items for Stripe
    const lineItems: {
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
          images?: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }[] = [];

    // Process each cart item
    for (const item of items) {
      // First, look up the real_product to get its details
      const realProductResponse = await fetch(
        `${supabaseUrl}/rest/v1/real_products?id=eq.${item.productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
        }
      );

      let productName: string;
      let productDescription: string;
      let productPrice: number;
      let productImage: string | undefined;

      if (realProductResponse.ok) {
        const realProducts = await realProductResponse.json();
        
        if (realProducts && realProducts.length > 0) {
          const realProduct = realProducts[0];
          
          // Now look up the corresponding stripe_product using real_product_id
          const stripeProductResponse = await fetch(
            `${supabaseUrl}/rest/v1/stripe_products?real_product_id=eq.${item.productId}&is_active=eq.true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
              },
            }
          );

          if (stripeProductResponse.ok) {
            const stripeProducts = await stripeProductResponse.json();
            
            if (stripeProducts && stripeProducts.length > 0) {
              // Use the Stripe-compliant shadow product
              const stripeProduct = stripeProducts[0];
              productName = stripeProduct.name;
              productDescription = stripeProduct.short_description || stripeProduct.description;
              productPrice = stripeProduct.sale_price || stripeProduct.price;
              productImage = stripeProduct.image_url;
            } else {
              // Fallback to real product with generic description
              productName = `Professional Digital Service - ${realProduct.name}`;
              productDescription = "Premium digital service subscription";
              productPrice = realProduct.sale_price || realProduct.price;
              productImage = realProduct.main_image;
            }
          } else {
            // Fallback to real product
            productName = `Professional Digital Service - ${realProduct.name}`;
            productDescription = "Premium digital service subscription";
            productPrice = realProduct.sale_price || realProduct.price;
            productImage = realProduct.main_image;
          }
        } else {
          // Try looking up directly in stripe_products
          const stripeDirectResponse = await fetch(
            `${supabaseUrl}/rest/v1/stripe_products?id=eq.${item.productId}&is_active=eq.true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
              },
            }
          );

          if (stripeDirectResponse.ok) {
            const stripeProducts = await stripeDirectResponse.json();
            if (stripeProducts && stripeProducts.length > 0) {
              const stripeProduct = stripeProducts[0];
              productName = stripeProduct.name;
              productDescription = stripeProduct.short_description || stripeProduct.description;
              productPrice = stripeProduct.sale_price || stripeProduct.price;
              productImage = stripeProduct.image_url;
            } else {
              throw new Error(`Product not found: ${item.productId}`);
            }
          } else {
            throw new Error(`Product not found: ${item.productId}`);
          }
        }
      } else {
        throw new Error(`Failed to fetch product: ${item.productId}`);
      }

      // Convert price to cents for Stripe
      const amountInCents = Math.round(productPrice * 100);

      const lineItem: {
        price_data: {
          currency: string;
          product_data: {
            name: string;
            description?: string;
            images?: string[];
          };
          unit_amount: number;
        };
        quantity: number;
      } = {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
          },
          unit_amount: amountInCents,
        },
        quantity: item.quantity,
      };

      if (productDescription) {
        lineItem.price_data.product_data.description = productDescription;
      }

      if (productImage && productImage.startsWith("http")) {
        lineItem.price_data.product_data.images = [productImage];
      }

      lineItems.push(lineItem);
    }

    // Create Stripe Checkout Session
    const stripeParams = new URLSearchParams();
    stripeParams.append("mode", "payment");
    stripeParams.append("success_url", finalSuccessUrl);
    stripeParams.append("cancel_url", finalCancelUrl);
    stripeParams.append("customer_email", customerEmail);
    stripeParams.append("billing_address_collection", "required");
    stripeParams.append("payment_method_types[0]", "card");

    // Add line items
    lineItems.forEach((item, index) => {
      stripeParams.append(`line_items[${index}][price_data][currency]`, item.price_data.currency);
      stripeParams.append(`line_items[${index}][price_data][unit_amount]`, item.price_data.unit_amount.toString());
      stripeParams.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);
      if (item.price_data.product_data.description) {
        stripeParams.append(`line_items[${index}][price_data][product_data][description]`, item.price_data.product_data.description);
      }
      if (item.price_data.product_data.images && item.price_data.product_data.images.length > 0) {
        stripeParams.append(`line_items[${index}][price_data][product_data][images][0]`, item.price_data.product_data.images[0]);
      }
      stripeParams.append(`line_items[${index}][quantity]`, item.quantity.toString());
    });

    // Add metadata
    if (customerName) {
      stripeParams.append("metadata[customer_name]", customerName);
    }
    stripeParams.append("metadata[customer_email]", customerEmail);
    stripeParams.append("metadata[item_count]", items.length.toString());

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripeParams.toString(),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create checkout session");
    }

    const session = await stripeResponse.json();

    console.log(`Checkout session created: ${session.id} for ${customerEmail}`);

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
