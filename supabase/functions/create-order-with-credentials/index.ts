import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const orderData: OrderData = await req.json();
    
    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderCode = `ORDER-${order.id.slice(0, 8).toUpperCase()}`;
    
    // Generate username
    const { data: username, error: usernameError } = await supabase
      .rpc('generate_username', { customer_name: orderData.customer_name });
    
    if (usernameError) {
      console.error("Error generating username:", usernameError);
    }

    // Generate password
    const { data: password, error: passwordError } = await supabase
      .rpc('generate_password');
    
    if (passwordError) {
      console.error("Error generating password:", passwordError);
    }

    // Get product details for setup video and service URL
    const productId = orderData.items[0]?.product_id;
    let setupVideoUrl = "";
    let serviceUrl = "";
    let productType = "iptv";

    if (productId) {
      const { data: product } = await supabase
        .from('real_products')
        .select('name,setup_video_url,service_url,category')
        .eq('id', productId)
        .single();

      if (product) {
        setupVideoUrl = product.setup_video_url || "";
        serviceUrl = product.service_url || "";
        productType = product.category?.toLowerCase().includes("fire") ? "firestick" : "iptv";
      }

      // Fallback: try to get default setup video
      if (!setupVideoUrl) {
        const { data: defaultVideo } = await supabase
          .from('product_setup_videos')
          .select('video_url')
          .eq('product_type', productType)
          .eq('is_default', true)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (defaultVideo) {
          setupVideoUrl = defaultVideo.video_url;
        }
      }
    }

    // Create customer account if credentials were generated
    if (username && password) {
      const accountData = {
        order_id: order.id,
        order_code: orderCode,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        username: username,
        password: password,
        service_url: serviceUrl,
        setup_video_url: setupVideoUrl,
        product_type: productType,
        product_name: orderData.items[0]?.product_name || "Service",
        account_status: "active",
      };

      const { error: accountError } = await supabase
        .from('customer_accounts')
        .insert([accountData]);

      if (accountError) {
        console.error("Error creating customer account:", accountError);
      }
    }

    // Send order emails with credentials
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "reloadedfiretvteam@gmail.com";
    
    const emailPayload = {
      orderCode: orderCode,
      customerEmail: orderData.customer_email,
      customerName: orderData.customer_name,
      totalUsd: parseFloat(orderData.total),
      paymentMethod: orderData.payment_method,
      products: orderData.items.map(item => ({
        name: item.product_name,
        price: parseFloat(item.price),
        quantity: item.quantity
      })),
      shippingAddress: orderData.shipping_address,
      adminEmail: adminEmail,
      username: username || "",
      password: password || "",
      setupVideoUrl: setupVideoUrl,
      serviceUrl: serviceUrl,
    };

    // Call send-order-emails function
    const emailResponse = await fetch(
      `${supabaseUrl}/functions/v1/send-order-emails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify(emailPayload),
      }
    );

    if (!emailResponse.ok) {
      console.error("Error sending emails:", await emailResponse.text());
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        orderCode: orderCode,
        username: username,
        password: password,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating order:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

