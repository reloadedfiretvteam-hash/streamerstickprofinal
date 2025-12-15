import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Resend Email Function
 * Sends emails using Resend API
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - RESEND_API_KEY: Your Resend API key (get from resend.com)
 * - FROM_EMAIL: Default sender email (e.g., orders@yourdomain.com)
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
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

    // Get default FROM email
    const defaultFromEmail = Deno.env.get("FROM_EMAIL") || "noreply@streamstickpro.com";

    // Parse request payload
    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.subject || !payload.html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: to, subject, html" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Prepare email data for Resend
    const emailData = {
      from: payload.from || defaultFromEmail,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text || undefined,
    };

    console.log(`📧 Sending email via Resend to: ${emailData.to.join(", ")}`);
    console.log(`📋 Subject: ${emailData.subject}`);

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("❌ Resend API error:", resendData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: resendData.message || "Failed to send email",
          details: resendData 
        }),
        { 
          status: resendResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`✅ Email sent successfully! Resend ID: ${resendData.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: resendData.id,
        message: "Email sent successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in send-email-resend function:", errorMessage);
    
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

