import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface CheckoutIntentRequest {
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderDescription: string;
  items: CartItem[];
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

    const payload: CheckoutIntentRequest = await req.json();
    const { amount, customerEmail, customerName, customerPhone, shippingAddress, orderDescription, items } = payload;

    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new Error("Invalid email format");
    }

    if (!items || items.length === 0) {
      throw new Error("Cart items are required");
    }

    // Convert to cents for Stripe (Stripe requires amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create a Stripe PaymentIntent
    // Build payment intent parameters
    const paymentParams: Record<string, string> = {
      amount: amountInCents.toString(),
      currency: "usd",
      "automatic_payment_methods[enabled]": "true",
      "metadata[customer_email]": customerEmail,
      "metadata[order_description]": orderDescription.substring(0, 500), // Stripe metadata limit
      "metadata[item_count]": items.length.toString(),
      description: `Order: ${orderDescription.substring(0, 100)}`,
      receipt_email: customerEmail,
      statement_descriptor_suffix: "PRO DIGITAL",
    };
    
    // Only add customer_name to metadata if provided
    if (customerName && customerName.trim()) {
      paymentParams["metadata[customer_name]"] = customerName.trim();
    }

    // Add phone if provided
    if (customerPhone && customerPhone.trim()) {
      paymentParams["metadata[customer_phone]"] = customerPhone.trim();
    }

    // Add shipping address if provided
    if (shippingAddress && shippingAddress.trim()) {
      paymentParams["metadata[shipping_address]"] = shippingAddress.trim().substring(0, 500);
    }

    // Add first few items to metadata (Stripe has limits on metadata size)
    items.slice(0, 5).forEach((item, index) => {
      paymentParams[`metadata[item_${index}_name]`] = item.productName.substring(0, 100);
      paymentParams[`metadata[item_${index}_qty]`] = item.quantity.toString();
      paymentParams[`metadata[item_${index}_price]`] = item.price.toString();
    });

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
    console.log(`PaymentIntent created: ${paymentIntent.id} for cart checkout, amount: $${amount}`);

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
    console.error("Error creating checkout payment intent:", errorMessage);

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
