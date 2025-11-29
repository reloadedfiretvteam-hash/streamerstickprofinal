import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, x-nowpayments-sig',
};

interface PayloadObject {
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const payload = await req.json();
    const receivedSignature = req.headers.get('x-nowpayments-sig');
    if (!receivedSignature) {
      return new Response(JSON.stringify({ error: 'No HMAC signature' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: gatewayData } = await supabase.from('payment_gateways').select('config').eq('gateway_name', 'nowpayments').maybeSingle();
    if (!gatewayData || !gatewayData.config?.ipn_secret) {
      return new Response(JSON.stringify({ error: 'IPN secret not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const ipnSecret = gatewayData.config.ipn_secret;
    const sortObject = (obj: PayloadObject): PayloadObject => Object.keys(obj).sort().reduce((result: PayloadObject, key) => { result[key] = (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) ? sortObject(obj[key] as PayloadObject) : obj[key]; return result; }, {} as PayloadObject);
    const sortedPayloadString = JSON.stringify(sortObject(payload));
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ipnSecret);
    const messageData = encoder.encode(sortedPayloadString);
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (expectedSignature !== receivedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const paymentId = payload.payment_id;
    const orderId = payload.order_id || payload.purchase_id;
    const paymentStatus = payload.payment_status;
    let orderStatus = 'pending';
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') orderStatus = 'completed';
    else if (paymentStatus === 'failed' || paymentStatus === 'refunded') orderStatus = 'failed';
    else if (paymentStatus === 'expired') orderStatus = 'expired';
    const updateData: Record<string, unknown> = { payment_status: orderStatus, updated_at: new Date().toISOString() };
    if (orderStatus === 'completed') updateData.paid_at = new Date().toISOString();
    const { data: orderData } = await supabase.from('bitcoin_orders').update(updateData).eq('order_code', orderId).select().maybeSingle();
    if (orderData && payload.payment_id) {
      await supabase.from('bitcoin_transactions').insert({ bitcoin_order_id: orderData.id, transaction_hash: payload.payment_id?.toString(), amount_btc: payload.actually_paid || payload.pay_amount, confirmations: 0, status: orderStatus });
    }
    return new Response(JSON.stringify({ success: true, status: orderStatus, order_id: orderId, payment_id: paymentId }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});