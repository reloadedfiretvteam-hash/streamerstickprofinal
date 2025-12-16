import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailPayload {
  orderCode: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  totalUsd: number;
  paymentMethod: string;
  products: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress: string;
  country?: string;
  message?: string;
  adminEmail: string;
  totalBtc?: string;
  btcPrice?: number;
  bitcoinAddress?: string;
  cashappTag?: string;
  username?: string;
  password?: string;
  setupVideoUrl?: string;
  serviceUrl?: string;
  isTrial?: boolean;
}

function generateCustomerBitcoinEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }.code-box { background: white; border: 3px solid #f97316; padding: 20px; text-center; border-radius: 10px; margin: 20px 0; }.code { font-size: 32px; font-weight: bold; color: #f97316; font-family: monospace; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Bitcoin Payment Instructions</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order!</p><div class="code-box"><p>YOUR ORDER CODE</p><div class="code">${payload.orderCode}</div></div><p>Total: $${payload.totalUsd.toFixed(2)} USD = ${payload.totalBtc} BTC</p><p>Track your order: https://streamstickpro.com/track-order?code=${payload.orderCode}</p></div></div></body></html>`;
}

function generateCustomerCashAppEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }.code-box { background: white; border: 3px solid #10b981; padding: 20px; text-center; border-radius: 10px; margin: 20px 0; }.code { font-size: 32px; font-weight: bold; color: #10b981; font-family: monospace; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Cash App Payment Instructions</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order!</p><div class="code-box"><p>YOUR ORDER CODE</p><div class="code">${payload.orderCode}</div><p style="font-size: 12px;">Include this in Cash App note!</p></div><p>Send <strong>$${payload.totalUsd.toFixed(2)}</strong> to <strong>${payload.cashappTag}</strong></p><p><strong>IMPORTANT:</strong> Add ${payload.orderCode} to the payment note!</p><p>Track your order: https://streamstickpro.com/track-order?code=${payload.orderCode}</p></div></div></body></html>`;
}

function generateCustomerOrderEmail(payload: OrderEmailPayload): string {
  const productsHtml = payload.products.map(p => 
    `<li>${p.name} - $${p.price.toFixed(2)} x ${p.quantity}</li>`
  ).join('');
  
  const credentialsHtml = payload.username && payload.password ? `
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">🔐 Your Login Credentials</h3>
      <p><strong>Username:</strong> ${payload.username}</p>
      <p><strong>Password:</strong> ${payload.password}</p>
      ${payload.serviceUrl ? `<p><strong>Service URL:</strong> <a href="${payload.serviceUrl}">${payload.serviceUrl}</a></p>` : ''}
      ${payload.setupVideoUrl ? `<p><strong>Setup Video:</strong> <a href="${payload.setupVideoUrl}">Watch Setup Guide</a></p>` : ''}
    </div>
  ` : '';

  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Order Confirmation</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order! Your payment has been confirmed.</p><div style="background: white; border: 2px solid #f97316; padding: 20px; border-radius: 10px; margin: 20px 0;"><h3 style="margin-top: 0;">Order Details</h3><p><strong>Order Code:</strong> ${payload.orderCode}</p><p><strong>Products:</strong></p><ul>${productsHtml}</ul><p><strong>Total:</strong> $${payload.totalUsd.toFixed(2)}</p><p><strong>Payment Method:</strong> ${payload.paymentMethod}</p>${payload.shippingAddress ? `<p><strong>Shipping:</strong> ${payload.shippingAddress}</p>` : ''}</div>${credentialsHtml}<p>If you have any questions, please reply to this email or contact support.</p><p>Thank you for your business!</p></div></div></body></html>`;
}

function generateAdminNotificationEmail(payload: OrderEmailPayload): string {
  const productsHtml = payload.products.map(p => 
    `<li>${p.name} - $${p.price.toFixed(2)} x ${p.quantity}</li>`
  ).join('');

  const credentialsHtml = payload.username && payload.password ? `
    <p><strong>Login Credentials Created:</strong></p>
    <ul>
      <li>Username: ${payload.username}</li>
      <li>Password: ${payload.password}</li>
    </ul>
  ` : '';

  const trialBadge = payload.isTrial ? '<p style="background:#10b981;color:white;padding:10px;text-align:center;font-weight:bold">🎁 FREE TRIAL REQUEST</p>' : '';

  return `<!DOCTYPE html><html><body>${trialBadge}<h2>🔥 New ${payload.isTrial ? 'Trial Request' : 'Order'}: ${payload.orderCode}</h2><p><strong>Customer:</strong> ${payload.customerName} (${payload.customerEmail})</p>${payload.customerPhone ? `<p><strong>Phone:</strong> ${payload.customerPhone}</p>` : ''}<p><strong>Payment Method:</strong> ${payload.paymentMethod}</p><p><strong>Total:</strong> $${payload.totalUsd.toFixed(2)}</p><p><strong>Products:</strong></p><ul>${productsHtml}</ul>${payload.shippingAddress ? `<p><strong>Shipping:</strong> ${payload.shippingAddress}</p>` : ''}${payload.country ? `<p><strong>Country:</strong> ${payload.country}</p>` : ''}${payload.message ? `<p><strong>Customer Message:</strong></p><p style="background:#f3f4f6;padding:10px;border-left:4px solid #3b82f6">${payload.message}</p>` : ''}${credentialsHtml}<hr><p><em>This ${payload.isTrial ? 'trial request' : 'order'} notification was sent from Stream Stick Pro</em></p></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY not configured in Supabase environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service not configured. Please set RESEND_API_KEY in Supabase." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const payload: OrderEmailPayload = await req.json();
    console.log(`📧 Processing order email for: ${payload.orderCode}`);

    // Get default FROM email
    const defaultFromEmail = Deno.env.get("FROM_EMAIL") || "noreply@streamstickpro.com";
    const adminEmail = payload.adminEmail || Deno.env.get("ADMIN_EMAIL") || "reloadedfiretvteam@gmail.com";

    // Generate email content based on payment method
    let customerEmailContent: string;
    let customerSubject: string;

    if (payload.paymentMethod === 'Bitcoin') {
      customerEmailContent = generateCustomerBitcoinEmail(payload);
      customerSubject = `Bitcoin Payment Instructions - Order ${payload.orderCode}`;
    } else if (payload.paymentMethod === 'Cash App' || payload.paymentMethod === 'cashapp') {
      customerEmailContent = generateCustomerCashAppEmail(payload);
      customerSubject = `Cash App Payment Instructions - Order ${payload.orderCode}`;
    } else {
      customerEmailContent = generateCustomerOrderEmail(payload);
      customerSubject = `Order Confirmation - ${payload.orderCode}`;
    }

    const adminEmailContent = generateAdminNotificationEmail(payload);

    // Send customer email via Resend
    console.log(`📨 Sending customer email to: ${payload.customerEmail}`);
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: defaultFromEmail,
        to: [payload.customerEmail],
        subject: customerSubject,
        html: customerEmailContent,
      }),
    });

    const customerEmailData = await customerEmailResponse.json();
    
    if (!customerEmailResponse.ok) {
      console.error("❌ Failed to send customer email:", customerEmailData);
      throw new Error(`Failed to send customer email: ${customerEmailData.message || 'Unknown error'}`);
    }

    console.log(`✅ Customer email sent! Resend ID: ${customerEmailData.id}`);

    // Send admin notification email via Resend
    console.log(`📨 Sending admin notification to: ${adminEmail}`);
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: defaultFromEmail,
        to: [adminEmail],
        subject: `New Order: ${payload.orderCode} - ${payload.customerName}`,
        html: adminEmailContent,
      }),
    });

    const adminEmailData = await adminEmailResponse.json();
    
    if (!adminEmailResponse.ok) {
      console.error("❌ Failed to send admin email:", adminEmailData);
      // Don't throw error here - customer email was sent successfully
      console.warn("⚠️ Admin email failed but customer email was sent");
    } else {
      console.log(`✅ Admin email sent! Resend ID: ${adminEmailData.id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderCode: payload.orderCode,
        customerEmailId: customerEmailData.id,
        adminEmailId: adminEmailData.id || null,
        message: "Emails sent successfully"
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error in send-order-emails function:", errorMessage);
    
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
