import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FreeTrialPayload {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  productId: string; // Should be the free trial product ID
}

// Generate random credentials
function generateUsername(): string {
  const prefix = 'trial';
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${randomNum}`;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString(36).toUpperCase();
  return `FREE-${timestamp}-${random}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: FreeTrialPayload = await req.json();
    
    // Validate required fields
    if (!payload.customerEmail || !payload.customerName || !payload.productId) {
      throw new Error("Missing required fields: customerEmail, customerName, or productId");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Initialize Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('real_products')
      .select('*')
      .eq('id', payload.productId)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productError?.message || 'Unknown error'}`);
    }

    // Verify it's actually free
    if (product.price !== 0) {
      throw new Error("This function is only for free trial products");
    }

    // Generate credentials
    const username = generateUsername();
    const password = generatePassword();
    const orderNumber = generateOrderNumber();
    const serviceUrl = product.service_url || 'http://ky-tv.cc';
    const setupVideoUrl = product.setup_video_url || 'https://www.youtube.com/watch?v=YOUR_SETUP_VIDEO_ID';

    // Calculate trial expiration (36 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 36);

    console.log('Creating free trial order:', {
      orderNumber,
      email: payload.customerEmail,
      product: product.name,
      expiresAt: expiresAt.toISOString()
    });

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: orderNumber,
        customer_email: payload.customerEmail,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone || null,
        total_usd: 0.00,
        payment_method: 'free-trial',
        payment_status: 'completed',
        order_status: 'completed',
        products: [{
          product_id: product.id,
          name: product.name,
          price: 0.00,
          quantity: 1
        }],
        iptv_credentials: {
          username,
          password,
          service_url: serviceUrl,
          expires_at: expiresAt.toISOString(),
          trial: true,
          duration_hours: 36
        },
        metadata: {
          type: 'free-trial',
          product_id: product.id,
          setup_video_url: setupVideoUrl
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('Order created successfully:', order.id);

    // Send credentials email
    const credentialsEmailPayload = {
      customerEmail: payload.customerEmail,
      customerName: payload.customerName,
      username,
      password,
      serviceUrl,
      orderNumber,
      productName: `${product.name} (36-Hour FREE Trial)`,
      totalAmount: 0.00,
      youtubeTutorialUrl: setupVideoUrl
    };

    console.log('Sending credentials email...');

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-credentials-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(credentialsEmailPayload),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Failed to send credentials email:', emailError);
      // Don't throw - order was created successfully, email can be resent
    } else {
      console.log('Credentials email sent successfully');
    }

    // Return success with credentials (also sent via email)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Free trial activated! Check your email for login credentials.",
        orderNumber,
        credentials: {
          username,
          password,
          serviceUrl,
          expiresAt: expiresAt.toISOString()
        },
        order
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in free-trial-signup:", errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

