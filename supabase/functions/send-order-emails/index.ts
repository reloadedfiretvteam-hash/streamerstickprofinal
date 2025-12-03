import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailPayload {
  orderCode: string;
  customerEmail: string;
  customerName: string;
  totalUsd: number;
  paymentMethod: string;
  products: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress: string;
  adminEmail: string;
  totalBtc?: string;
  btcPrice?: number;
  bitcoinAddress?: string;
  cashappTag?: string;
}

function generateCustomerStripeEmail(payload: OrderEmailPayload): string {
  const productsList = payload.products.map(p => 
    `<li>${p.name} - $${p.price.toFixed(2)} x ${p.quantity}</li>`
  ).join('');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-center; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .order-box { background: #f9fafb; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .order-code { font-size: 24px; font-weight: bold; color: #f97316; font-family: monospace; text-align: center; padding: 10px; }
    .products-list { margin: 15px 0; }
    .products-list ul { margin: 10px 0; padding-left: 20px; }
    .total { font-size: 20px; font-weight: bold; color: #f97316; text-align: center; margin-top: 15px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Stream Stick Pro</h1>
      <h2>Order Confirmation</h2>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hi <strong>${payload.customerName}</strong>,</p>
        <p>Thank you for your order! Your payment has been successfully processed.</p>
      </div>
      <div class="order-box">
        <p style="text-align: center; margin: 0 0 10px 0;"><strong>Order Number</strong></p>
        <div class="order-code">${payload.orderCode}</div>
        <div class="products-list">
          <p><strong>Items Ordered:</strong></p>
          <ul>${productsList}</ul>
        </div>
        <div class="total">Total: $${payload.totalUsd.toFixed(2)}</div>
        <p style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">
          Payment Method: Stripe (Credit/Debit Card)
        </p>
      </div>
      <p style="margin-top: 30px;">
        <strong>What's Next?</strong><br>
        You will receive a second email shortly with your service access credentials, including your username, password, and setup instructions.
      </p>
      <p style="margin-top: 20px;">
        If you have any questions, please don't hesitate to contact our support team.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Stream Stick Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function generateCustomerBitcoinEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }.code-box { background: white; border: 3px solid #f97316; padding: 20px; text-center; border-radius: 10px; margin: 20px 0; }.code { font-size: 32px; font-weight: bold; color: #f97316; font-family: monospace; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Bitcoin Payment Instructions</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order!</p><div class="code-box"><p>YOUR ORDER CODE</p><div class="code">${payload.orderCode}</div></div><p>Total: $${payload.totalUsd.toFixed(2)} USD = ${payload.totalBtc} BTC</p><p>Track your order: https://streamstickpro.com/track-order?code=${payload.orderCode}</p></div></div></body></html>`;
}

function generateCustomerCashAppEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }.container { max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }.content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }.code-box { background: white; border: 3px solid #10b981; padding: 20px; text-center; border-radius: 10px; margin: 20px 0; }.code { font-size: 32px; font-weight: bold; color: #10b981; font-family: monospace; }</style></head><body><div class="container"><div class="header"><h1>🔥 Stream Stick Pro</h1><h2>Cash App Payment Instructions</h2></div><div class="content"><p>Hi <strong>${payload.customerName}</strong>,</p><p>Thank you for your order!</p><div class="code-box"><p>YOUR ORDER CODE</p><div class="code">${payload.orderCode}</div><p style="font-size: 12px;">Include this in Cash App note!</p></div><p>Send <strong>$${payload.totalUsd.toFixed(2)}</strong> to <strong>${payload.cashappTag}</strong></p><p><strong>IMPORTANT:</strong> Add ${payload.orderCode} to the payment note!</p><p>Track your order: https://streamstickpro.com/track-order?code=${payload.orderCode}</p></div></div></body></html>`;
}

function generateAdminNotificationEmail(payload: OrderEmailPayload): string {
  return `<!DOCTYPE html><html><body><h2>New Order: ${payload.orderCode}</h2><p>Payment Method: ${payload.paymentMethod}</p><p>Customer: ${payload.customerName} (${payload.customerEmail})</p><p>Total: $${payload.totalUsd.toFixed(2)}</p><p>Shipping: ${payload.shippingAddress}</p></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const payload: OrderEmailPayload = await req.json();
    console.log(`Processing order email for: ${payload.orderCode}`);
    
    // Generate appropriate email based on payment method
    let customerEmailContent: string;
    let emailSubject: string;
    
    if (payload.paymentMethod === 'stripe' || payload.paymentMethod === 'Stripe') {
      customerEmailContent = generateCustomerStripeEmail(payload);
      emailSubject = `Order Confirmation - ${payload.orderCode} - Stream Stick Pro`;
    } else if (payload.paymentMethod === 'Bitcoin') {
      customerEmailContent = generateCustomerBitcoinEmail(payload);
      emailSubject = `Bitcoin Payment Instructions - ${payload.orderCode}`;
    } else {
      customerEmailContent = generateCustomerCashAppEmail(payload);
      emailSubject = `Cash App Payment Instructions - ${payload.orderCode}`;
    }
    
    const adminEmailContent = generateAdminNotificationEmail(payload);
    
    console.log('Sending order emails for:', payload.orderCode);

    // Initialize Resend with API key from environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured. Please add RESEND_API_KEY to Supabase secrets.");
    }

    const resend = new Resend(resendApiKey);

    // Send email to customer
    const { data: customerData, error: customerError } = await resend.emails.send({
      from: "Stream Stick Pro <onboarding@resend.dev>", // Change to your verified domain
      to: payload.customerEmail,
      subject: emailSubject,
      html: customerEmailContent,
    });

    if (customerError) {
      console.error("Failed to send customer email:", customerError);
      throw new Error(`Failed to send customer email: ${customerError.message}`);
    }

    console.log("Customer email sent successfully:", customerData?.id);

    // Send notification to admin
    const { data: adminData, error: adminError } = await resend.emails.send({
      from: "Stream Stick Pro <onboarding@resend.dev>", // Change to your verified domain
      to: payload.adminEmail,
      subject: `New Order: ${payload.orderCode}`,
      html: adminEmailContent,
    });

    if (adminError) {
      console.error("Failed to send admin email:", adminError);
      // Don't throw - customer email was sent successfully
    } else {
      console.log("Admin email sent successfully:", adminData?.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderCode: payload.orderCode,
        message: "Order emails sent successfully",
        customerEmail: payload.customerEmail,
        customerEmailId: customerData?.id,
        adminEmailId: adminData?.id,
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-order-emails:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});