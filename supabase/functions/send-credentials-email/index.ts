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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payload: CredentialsEmailPayload = await req.json();
    const defaultFromEmail = Deno.env.get("FROM_EMAIL") || "noreply@streamstickpro.com";

    const html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:20px"><div style="background:linear-gradient(135deg,#3b82f6 0%,#1e40af 100%);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0"><h1> Stream Stick Pro</h1><h2>Your Login Credentials</h2></div><div style="background:#f9fafb;padding:30px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px"><p>Hi <strong>'+payload.customerName+'</strong>,</p><p>Your account is ready! Here are your login credentials:</p><div style="background:white;border:3px solid #3b82f6;padding:20px;border-radius:10px;margin:20px 0"><h3 style="color:#1e40af"> Account Login</h3><p><strong>Username:</strong> <span style="font-family:monospace;color:#3b82f6;font-size:18px">'+payload.username+'</span></p><p><strong>Password:</strong> <span style="font-family:monospace;color:#3b82f6;font-size:18px">'+payload.password+'</span></p>'+(payload.serviceUrl ? '<p><strong>Service URL:</strong> '+payload.serviceUrl+'</p>' : '')+'</div><p><strong> Order:</strong> '+payload.orderCode+' | '+payload.productName+' | $'+payload.totalAmount.toFixed(2)+'</p>'+(payload.setupVideoUrl ? '<div style="background:#fee2e2;border:2px solid #ef4444;padding:20px;border-radius:10px;margin:20px 0;text-align:center"><h3 style="color:#991b1b"> Watch Setup Tutorial</h3><p>Watch our step-by-step guide:</p><a href="'+payload.setupVideoUrl+'" style="display:inline-block;padding:15px 30px;background:#ef4444;color:white;text-decoration:none;border-radius:8px;font-weight:bold"> Watch on YouTube</a></div>' : '')+'<p>Questions? Reply to this email.</p></div></div></body></html>';

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": 'Bearer '+resendApiKey },
      body: JSON.stringify({ from: defaultFromEmail, to: [payload.customerEmail], subject: ' Your Login Credentials - Order '+payload.orderCode, html: html }),
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: data.message }), { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "reloadedfiretvteam@gmail.com";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": 'Bearer '+resendApiKey },
      body: JSON.stringify({ from: defaultFromEmail, to: [adminEmail], subject: ' Credentials Sent - '+payload.orderCode, html: '<h2>Credentials Sent</h2><p>Order: '+payload.orderCode+'</p><p>Customer: '+payload.customerName+' ('+payload.customerEmail+')</p><p>Username: '+payload.username+'</p><p>Password: '+payload.password+'</p>' }),
    }).catch(e => console.error("Admin email failed:", e));

    return new Response(JSON.stringify({ success: true, emailId: data.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
