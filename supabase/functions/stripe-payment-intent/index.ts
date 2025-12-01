import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import Stripe from "https://esm.sh/stripe@14?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 200, headers: corsHeaders });

  try {
    // Accept payload: realProductId or productId (for backward compatibility), customerEmail, customerName
    const payload = await req.json();
    const realProductId = payload.realProductId || payload.productId;
    const { customerEmail, customerName } = payload;
    
    if (!realProductId) {
      throw new Error("Product ID is required (realProductId or productId)");
    }
    
    if (!customerEmail) {
      throw new Error("Customer email is required");
    }
    
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseKey)
      throw new Error("Missing env vars");

    // Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the price from real_products (NOT shadow/stripe table)
    const { data: product, error: prodError } = await supabase
      .from("real_products")
      .select("price,sale_price,name")
      .eq("id", realProductId)
      .single();
      
    if (prodError) {
      console.error("Product fetch error:", prodError);
      throw new Error(`Product not found: ${prodError.message}`);
    }
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    const price = product.sale_price ?? product.price;
    if (!price || price <= 0) {
      throw new Error("Product price missing or invalid");
    }

    // Create Stripe PaymentIntent for correct price
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      receipt_email: customerEmail,
      description: product.name,
      metadata: { customerName, realProductId },
      automatic_payment_methods: { enabled: true },
    });
    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Payment intent creation error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: corsHeaders,
    });
  }
});
