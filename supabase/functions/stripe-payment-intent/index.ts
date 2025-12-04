import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import Stripe from "https://esm.sh/stripe@14?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 200, headers: corsHeaders });

  try {
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

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: product, error: prodError } = await supabase
      .from("real_products")
      .select("price,sale_price,name,cloaked_name,category,payment_link_url")
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

    // Check if product has a payment_link_url - if so, redirect to Payment Link instead of PaymentIntent
    if (product.payment_link_url && product.payment_link_url.trim() !== '') {
      console.log(`Product ${realProductId} has payment_link_url, returning redirect`);
      return new Response(JSON.stringify({ 
        usePaymentLink: true,
        paymentLinkUrl: product.payment_link_url,
        productName: product.name,
        price: price
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Validate cloaked name doesn't contain forbidden terms
    const forbiddenTerms = ['iptv', 'firestick', 'fire stick', 'jailbreak', 'kodi', 'piracy'];
    const lowerCloaked = cloakedName.toLowerCase();
    for (const term of forbiddenTerms) {
      if (lowerCloaked.includes(term)) {
        console.error(`Cloaked name contains forbidden term: ${term}`);
        throw new Error(`Invalid cloaked name - contains restricted content`);
      }
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      receipt_email: customerEmail,
      description: cloakedName,
      metadata: { 
        customerName, 
        realProductId,
        product_name: product.name,
        product_name_cloaked: cloakedName
      },
      automatic_payment_methods: { enabled: true },
    });
    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Payment intent creation error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});