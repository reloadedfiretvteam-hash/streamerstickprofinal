import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CredentialsEmailPayload {
  customerEmail: string;
  customerName: string;
  orderCode: string;
  username: string;
  password: string;
  productName: string;
  totalAmount: number;
  setupVideoUrl: string;
  serviceUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: CredentialsEmailPayload = await req.json();
    const {
      customerEmail,
      customerName,
      orderCode,
      username,
      password,
      productName,
      totalAmount,
      setupVideoUrl,
      serviceUrl,
    } = payload;

    // Send credentials email to customer
    const credentialsEmail = {
      to: customerEmail,
      subject: `Your Login Credentials - Order ${orderCode}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .credentials-box { background: white; border: 2px solid #3b82f6; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .credential-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .credential-label { font-weight: bold; color: #1f2937; }
    .credential-value { font-family: monospace; color: #3b82f6; font-size: 16px; }
    .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Stream Stick Pro</h1>
      <h2>Your Login Credentials</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your account has been created! Here are your login credentials:</p>
      
      <div class="credentials-box">
        <h3>Your Account Credentials</h3>
        <div class="credential-row">
          <span class="credential-label">Username:</span>
          <span class="credential-value">${username}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Password:</span>
          <span class="credential-value">${password}</span>
        </div>
      </div>

      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Order Code: ${orderCode}</li>
        <li>Product: ${productName}</li>
        <li>Total: $${totalAmount.toFixed(2)}</li>
      </ul>

      ${serviceUrl ? `
      <p><strong>Access Your Service:</strong></p>
      <p><a href="${serviceUrl}" class="button" style="background: #10b981;">Access Service Portal</a></p>
      <p>Or visit: <a href="${serviceUrl}">${serviceUrl}</a></p>
      ` : ""}

      ${setupVideoUrl ? `
      <p><strong>Setup Instructions:</strong></p>
      <p>Watch our setup video to get started:</p>
      <a href="${setupVideoUrl}" class="button">Watch Setup Video</a>
      <p>Or visit: <a href="${setupVideoUrl}">${setupVideoUrl}</a></p>
      ` : ""}

      <p>Need help? Reply to this email or contact support.</p>
    </div>
  </div>
</body>
</html>
      `,
    };

    // Call send-order-emails function (or implement actual email sending)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      await fetch(
        `${supabaseUrl}/functions/v1/send-order-emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
          body: JSON.stringify({
            orderCode,
            customerEmail,
            customerName,
            totalUsd: totalAmount,
            paymentMethod: "Stripe",
            products: [{ name: productName, price: totalAmount, quantity: 1 }],
            username,
            password,
            setupVideoUrl,
            serviceUrl,
            emailType: "credentials",
          }),
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Credentials email queued" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

