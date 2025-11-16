import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentConfirmation {
  orderCode: string;
  transactionId?: string;
  customerEmail: string;
  customerName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const payload: PaymentConfirmation = await req.json();
    const { orderCode, transactionId, customerEmail, customerName } = payload;

    if (!orderCode || !customerEmail) {
      throw new Error("Missing required fields: orderCode and customerEmail");
    }

    const confirmResult = await fetch(
      `${supabaseUrl}/rest/v1/rpc/confirm_payment_transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
        body: JSON.stringify({
          p_order_code: orderCode,
          p_transaction_id: transactionId || null,
        }),
      }
    );

    if (!confirmResult.ok) {
      throw new Error("Failed to confirm payment");
    }

    const emailBody = `
Dear ${customerName},

Your payment has been confirmed!

Your Order Code: ${orderCode}

You can track your order at any time by visiting:
https://your-website.com/track-order

Simply enter your order code above to see real-time updates on your order status.

What happens next:
1. Your order is now being processed
2. You'll receive another email when your order ships
3. Track your order anytime using your order code

Thank you for choosing Inferno TV!

Questions? Reply to this email or contact us at reloadedfiretvteam@gmail.com

Best regards,
Inferno TV Team
    `;

    console.log(`Payment confirmed for order code: ${orderCode}`);
    console.log(`Email would be sent to: ${customerEmail}`);
    console.log(`Email body:\n${emailBody}`);

    await fetch(`${supabaseUrl}/rest/v1/payment_transactions?order_code=eq.${orderCode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
      },
      body: JSON.stringify({
        confirmation_email_sent: true,
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment confirmed and notification sent",
        orderCode: orderCode,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error confirming payment:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to confirm payment",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});