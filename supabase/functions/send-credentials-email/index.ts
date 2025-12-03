import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CredentialsEmailPayload {
  customerEmail: string;
  customerName: string;
  username: string;
  password: string;
  serviceUrl: string;
  orderNumber: string;
  productName: string;
  totalAmount: number;
  youtubeTutorialUrl?: string;
}

function generateCredentialsEmail(payload: CredentialsEmailPayload): string {
  const youtubeLink = payload.youtubeTutorialUrl || 'https://www.youtube.com/watch?v=YOUR_TUTORIAL_VIDEO_ID';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .credentials-box {
      background: #f9fafb;
      border: 2px solid #f97316;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .credential-row:last-child {
      border-bottom: none;
    }
    .credential-label {
      font-weight: bold;
      color: #666;
    }
    .credential-value {
      font-family: monospace;
      font-size: 16px;
      color: #f97316;
      font-weight: bold;
    }
    .service-url-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
    }
    .service-url-box a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: bold;
      font-size: 18px;
    }
    .service-url-box a:hover {
      text-decoration: underline;
    }
    .tutorial-section {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
    .tutorial-section a {
      color: #d97706;
      text-decoration: none;
      font-weight: bold;
    }
    .tutorial-section a:hover {
      text-decoration: underline;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #f97316;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .button:hover {
      background: #dc2626;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Stream Stick Pro</h1>
      <p>Your Service Access Credentials</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        <p>Hi <strong>${payload.customerName}</strong>,</p>
        <p>Thank you for your purchase! Your service is now ready to use.</p>
      </div>

      <div class="credentials-box">
        <h2 style="margin-top: 0; color: #f97316;">Your Login Credentials</h2>
        <div class="credential-row">
          <span class="credential-label">Username:</span>
          <span class="credential-value">${payload.username}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Password:</span>
          <span class="credential-value">${payload.password}</span>
        </div>
      </div>

      <div class="service-url-box">
        <p style="margin: 0 0 10px 0;"><strong>Service Portal URL:</strong></p>
        <p style="margin: 0;"><a href="${payload.serviceUrl}" target="_blank">${payload.serviceUrl}</a></p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Use the credentials above to log in to your service portal.</p>
      </div>

      <div class="tutorial-section">
        <p style="margin: 0 0 10px 0;"><strong>📺 Setup Tutorial Video:</strong></p>
        <p style="margin: 0;">
          <a href="${youtubeLink}" target="_blank">Watch YouTube Setup Tutorial →</a>
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Follow along with our step-by-step video guide to get started.</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p><strong>Order Details:</strong></p>
        <p style="margin: 5px 0;">Order Number: <strong>${payload.orderNumber}</strong></p>
        <p style="margin: 5px 0;">Product: <strong>${payload.productName}</strong></p>
        <p style="margin: 5px 0;">Total Paid: <strong>$${payload.totalAmount.toFixed(2)}</strong></p>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${payload.serviceUrl}" class="button">Access Service Portal</a>
        <a href="${youtubeLink}" class="button" style="background: #3b82f6;">Watch Tutorial</a>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions, please contact our support team.</p>
      <p>© ${new Date().getFullYear()} Stream Stick Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: CredentialsEmailPayload = await req.json();
    console.log(`Sending credentials email to: ${payload.customerEmail}`);

    const emailHtml = generateCredentialsEmail(payload);
    const emailSubject = `Your Stream Stick Pro Service Credentials - Order ${payload.orderNumber}`;

    console.log('Sending credentials email to:', payload.customerEmail);

    // Initialize Resend with API key from environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured. Please add RESEND_API_KEY to Supabase secrets.");
    }

    const resend = new Resend(resendApiKey);

    // Send credentials email to customer
    const { data, error } = await resend.emails.send({
      from: "Stream Stick Pro <onboarding@resend.dev>", // Change to your verified domain
      to: payload.customerEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send credentials email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Credentials email sent successfully:", data);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Credentials email sent successfully",
        orderNumber: payload.orderNumber,
        customerEmail: payload.customerEmail,
        emailId: data?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-credentials-email:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});







