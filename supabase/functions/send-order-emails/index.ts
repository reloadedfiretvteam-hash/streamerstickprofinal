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
    let customerEmail = payload.paymentMethod === 'Bitcoin' ? generateCustomerBitcoinEmail(payload) : generateCustomerCashAppEmail(payload);
    const adminEmail = generateAdminNotificationEmail(payload);
    console.log('Customer email:', payload.customerEmail);
    console.log('Admin email:', payload.adminEmail);
    return new Response(JSON.stringify({ success: true, orderCode: payload.orderCode }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});