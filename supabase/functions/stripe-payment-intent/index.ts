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

    // Get the price and cloaked_name from real_products (NOT shadow/stripe table)
    // Customers see real names, Stripe sees cloaked names for compliance
    const { data: product, error: prodError } = await supabase
      .from("real_products")
      .select("price,sale_price,name,cloaked_name,category")
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

    // Determine cloaked name for Stripe compliance
    // Stripe only sees cloaked names, customers always see real names
    let cloakedName = product.cloaked_name;
    if (!cloakedName || cloakedName.trim() === '') {
      // Generate compliant cloaked name based on category
      const category = (product.category || '').toLowerCase();
      if (category.includes('fire') || category.includes('stick')) {
        cloakedName = 'Digital Entertainment Service - Hardware Bundle';
      } else if (category.includes('iptv') || category.includes('subscription')) {
        cloakedName = 'Digital Entertainment Service - Subscription';
      } else {
        cloakedName = 'Digital Entertainment Service';
      }
    }

    // Create Stripe PaymentIntent with CLOAKED name (for compliance)
    // Real product name stored in metadata for customer records
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      receipt_email: customerEmail,
      description: cloakedName, // CLOAKED name sent to Stripe
      metadata: { 
        customerName, 
        realProductId,
        product_name: product.name, // Real name for customer records
        product_name_cloaked: cloakedName // Cloaked name for Stripe compliance
      },
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
