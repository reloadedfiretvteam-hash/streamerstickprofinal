import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events with:
 * - HMAC-SHA256 signature verification
 * - Test vs live mode detection
 * - Debug logging during failures
 */

interface StripePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: string;
  livemode: boolean;
  metadata: Record<string, string>;
  receipt_email: string | null;
  created: number;
}

interface StripeEvent {
  id: string;
  object: "event";
  type: string;
  livemode: boolean;
  created: number;
  data: {
    object: StripePaymentIntent;
  };
}

/**
 * Verify Stripe webhook signature using HMAC-SHA256
 * Stripe uses a specific signature format: t=timestamp,v1=signature
 */
async function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<{ valid: boolean; timestamp?: number; error?: string }> {
  try {
    // Parse the signature header (format: t=timestamp,v1=signature,v0=signature)
    const signatureParts = signature.split(",").reduce((acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const timestamp = signatureParts["t"];
    const expectedSignature = signatureParts["v1"];

    if (!timestamp || !expectedSignature) {
      return { valid: false, error: "Missing timestamp or signature in header" };
    }

    // Check timestamp tolerance (5 minutes)
    const timestampNum = parseInt(timestamp, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tolerance = 300; // 5 minutes

    if (Math.abs(currentTimestamp - timestampNum) > tolerance) {
      return { 
        valid: false, 
        timestamp: timestampNum,
        error: `Timestamp outside tolerance window: ${timestampNum} vs ${currentTimestamp}` 
      };
    }

    // Create the signed payload string
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex string
    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Timing-safe comparison
    const isValid = computedSignature === expectedSignature;

    return { 
      valid: isValid, 
      timestamp: timestampNum,
      error: isValid ? undefined : "Signature mismatch"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during signature verification";
    return { valid: false, error: errorMessage };
  }
}

/**
 * Log payment event for debugging and audit purposes
 */
function logPaymentEvent(
  eventType: string,
  paymentIntent: StripePaymentIntent,
  isLive: boolean,
  additionalInfo?: Record<string, unknown>
) {
  const logData = {
    timestamp: new Date().toISOString(),
    eventType,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    mode: isLive ? "LIVE" : "TEST",
    metadata: paymentIntent.metadata,
    receiptEmail: paymentIntent.receipt_email,
    ...additionalInfo,
  };

  const prefix = isLive ? "[STRIPE-LIVE]" : "[STRIPE-TEST]";
  console.log(`${prefix} ${eventType}:`, JSON.stringify(logData, null, 2));
}

/**
 * Log failure events with detailed debugging information
 */
function logFailure(
  context: string,
  error: string,
  details?: Record<string, unknown>
) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error,
    ...details,
  };

  console.error(`[STRIPE-ERROR] ${context}:`, JSON.stringify(logData, null, 2));
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    logFailure("HTTP Method", "Invalid method", { method: req.method });
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookSecret) {
      logFailure("Configuration", "STRIPE_WEBHOOK_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      logFailure("Configuration", "Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the Stripe signature header
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      logFailure("Authentication", "Missing Stripe-Signature header");
      return new Response(
        JSON.stringify({ error: "Missing Stripe-Signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Read the raw request body
    const rawBody = await req.text();
    
    if (!rawBody) {
      logFailure("Payload", "Empty request body");
      return new Response(
        JSON.stringify({ error: "Empty request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the webhook signature
    const verificationResult = await verifyStripeSignature(rawBody, signature, webhookSecret);
    
    if (!verificationResult.valid) {
      logFailure("Signature Verification", verificationResult.error || "Invalid signature", {
        timestamp: verificationResult.timestamp,
      });
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the event
    let event: StripeEvent;
    try {
      event = JSON.parse(rawBody);
    } catch (parseError) {
      logFailure("JSON Parsing", "Failed to parse webhook payload", {
        error: parseError instanceof Error ? parseError.message : "Unknown parse error",
      });
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine if this is a live or test event
    // Both the event and the payment intent have livemode flags
    const isLiveEvent = event.livemode === true;
    const paymentIntent = event.data?.object;
    const isLivePayment = paymentIntent?.livemode === true;

    // Log mode consistency check
    if (isLiveEvent !== isLivePayment) {
      logFailure("Mode Mismatch", "Event and PaymentIntent livemode mismatch", {
        eventLivemode: isLiveEvent,
        paymentIntentLivemode: isLivePayment,
        eventId: event.id,
        paymentIntentId: paymentIntent?.id,
      });
    }

    // Log the event receipt
    console.log(`[STRIPE-WEBHOOK] Received ${event.type} event (${isLiveEvent ? "LIVE" : "TEST"}): ${event.id}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        logPaymentEvent("payment_intent.succeeded", paymentIntent, isLivePayment);

        const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.customer_email || "";
        const customerName = paymentIntent.metadata?.customer_name || "Customer";
        const productIds = paymentIntent.metadata?.product_ids?.split(",") || [];
        const productId = paymentIntent.metadata?.product_id || productIds[0] || "";
        const productNameCloaked = paymentIntent.metadata?.product_name_cloaked || paymentIntent.metadata?.product_name || "Digital Entertainment Service";
        const orderCode = `STRIPE-${paymentIntent.id.slice(-8).toUpperCase()}`;
        const amount = paymentIntent.amount / 100;

        // Record the successful payment in the database
        const transactionRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          amount: amount,
          currency: paymentIntent.currency,
          payment_method: "stripe",
          payment_status: "confirmed",
          customer_email: customerEmail,
          product_id: productId,
          product_name: productNameCloaked, // Store cloaked name for Stripe compliance
          is_live_mode: isLivePayment,
          created_at: new Date().toISOString(),
          stripe_event_id: event.id,
          order_code: orderCode,
        };

        // Insert payment record
        let orderId: string | null = null;
        const insertResponse = await fetch(
          `${supabaseUrl}/rest/v1/payment_transactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
              "Prefer": "return=representation",
            },
            body: JSON.stringify(transactionRecord),
          }
        );

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text();
          logFailure("Database Insert", "Failed to record payment transaction", {
            status: insertResponse.status,
            error: errorText,
            paymentIntentId: paymentIntent.id,
          });
        } else {
          console.log(`[STRIPE-${isLivePayment ? "LIVE" : "TEST"}] Payment recorded: ${paymentIntent.id}`);
        }

        // Create order in orders_full table
        try {
          const orderData = {
            customer_name: customerName,
            customer_email: customerEmail,
            total_amount: amount,
            payment_method: "stripe",
            payment_status: "paid",
            order_status: "processing",
            stripe_payment_intent_id: paymentIntent.id,
            order_code: orderCode,
            items: paymentIntent.metadata?.cartItems ? JSON.parse(paymentIntent.metadata.cartItems) : [{
              product_id: productId,
              product_name: productNameCloaked,
              quantity: 1,
              price: amount
            }],
          };

          const orderResponse = await fetch(
            `${supabaseUrl}/rest/v1/orders_full`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
                "Prefer": "return=representation",
              },
              body: JSON.stringify(orderData),
            }
          );

          if (orderResponse.ok) {
            const orderResult = await orderResponse.json();
            orderId = orderResult[0]?.id || null;
          }
        } catch (orderError) {
          console.error("Error creating order:", orderError);
        }

        // Fetch product to get REAL name and setup video
        let realProductName = productNameCloaked;
        let setupVideoUrl = "";
        let serviceUrl = "";
        let productType = "iptv";

        try {
          // Try to fetch from real_products first (for real product name)
          const productResponse = await fetch(
            `${supabaseUrl}/rest/v1/real_products?select=name,setup_video_url,service_url,category&id=eq.${encodeURIComponent(productId)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
              },
            }
          );

          if (productResponse.ok) {
            const products = await productResponse.json();
            if (products && products.length > 0) {
              const product = products[0];
              realProductName = product.name || realProductName;
              setupVideoUrl = product.setup_video_url || "";
              serviceUrl = product.service_url || "";
              productType = product.category?.toLowerCase().includes("fire") ? "firestick" : "iptv";
            }
          }

          // If no setup video from product, try product_setup_videos table
          if (!setupVideoUrl) {
            // First try product-specific video
            const videoResponse = await fetch(
              `${supabaseUrl}/rest/v1/product_setup_videos?select=video_url&product_id=eq.${encodeURIComponent(productId)}&is_active=eq.true&order=sort_order.asc&limit=1`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                },
              }
            );

            if (videoResponse.ok) {
              const videos = await videoResponse.json();
              if (videos && videos.length > 0) {
                setupVideoUrl = videos[0].video_url;
              }
            }

            // If still no video, try default video for product type
            if (!setupVideoUrl) {
              const defaultVideoResponse = await fetch(
                `${supabaseUrl}/rest/v1/product_setup_videos?select=video_url&product_type=eq.${productType}&is_default=eq.true&is_active=eq.true&limit=1`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${supabaseKey}`,
                    "apikey": supabaseKey,
                  },
                }
              );
              if (defaultVideoResponse.ok) {
                const defaultVideos = await defaultVideoResponse.json();
                if (defaultVideos && defaultVideos.length > 0) {
                  setupVideoUrl = defaultVideos[0].video_url;
                }
              }
            }

            // If STILL no video, try "all" default video
            if (!setupVideoUrl) {
              const allVideoResponse = await fetch(
                `${supabaseUrl}/rest/v1/product_setup_videos?select=video_url&product_type=eq.all&is_default=eq.true&is_active=eq.true&limit=1`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${supabaseKey}`,
                    "apikey": supabaseKey,
                  },
                }
              );
              if (allVideoResponse.ok) {
                const allVideos = await allVideoResponse.json();
                if (allVideos && allVideos.length > 0) {
                  setupVideoUrl = allVideos[0].video_url;
                }
              }
            }
          }

          // If service URL not found, use default from environment or site_settings
          if (!serviceUrl) {
            const defaultServiceUrl = Deno.env.get("DEFAULT_SERVICE_URL");
            if (defaultServiceUrl) {
              serviceUrl = defaultServiceUrl;
            } else {
              // Try to get from site_settings
              try {
                const settingsResponse = await fetch(
                  `${supabaseUrl}/rest/v1/site_settings?setting_key=eq.default_service_url&select=setting_value`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${supabaseKey}`,
                      "apikey": supabaseKey,
                    },
                  }
                );
                if (settingsResponse.ok) {
                  const settings = await settingsResponse.json();
                  if (settings && settings.length > 0 && settings[0].setting_value) {
                    serviceUrl = settings[0].setting_value;
                  }
                }
              } catch (e) {
                console.error("Error fetching default service URL:", e);
              }
            }
          }
        } catch (productError) {
          console.error("Error fetching product details:", productError);
        }

        // Generate username and password
        const usernameResponse = await fetch(
          `${supabaseUrl}/rest/v1/rpc/generate_username`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
            body: JSON.stringify({ customer_name: customerName }),
          }
        );

        let username = "";
        if (usernameResponse.ok) {
          const usernameData = await usernameResponse.json();
          username = usernameData || "";
        }

        // Generate password
        const passwordResponse = await fetch(
          `${supabaseUrl}/rest/v1/rpc/generate_password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
          }
        );

        let password = "";
        if (passwordResponse.ok) {
          const passwordData = await passwordResponse.json();
          password = passwordData || "";
        }

        // Create customer account
        let accountId: string | null = null;
        if (username && password) {
          try {
            const accountData = {
              order_id: orderId,
              order_code: orderCode,
              customer_email: customerEmail,
              customer_name: customerName,
              username: username,
              password: password,
              service_url: serviceUrl,
              setup_video_url: setupVideoUrl,
              product_type: productType,
              product_name: realProductName, // Store REAL product name
              account_status: "active",
            };

            const accountResponse = await fetch(
              `${supabaseUrl}/rest/v1/customer_accounts`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                  "Prefer": "return=representation",
                },
                body: JSON.stringify(accountData),
              }
            );

            if (accountResponse.ok) {
              const accountResult = await accountResponse.json();
              accountId = accountResult[0]?.id || null;
              
              // Update order with account ID
              if (orderId && accountId) {
                await fetch(
                  `${supabaseUrl}/rest/v1/orders_full?id=eq.${orderId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${supabaseKey}`,
                      "apikey": supabaseKey,
                    },
                    body: JSON.stringify({ customer_account_id: accountId }),
                  }
                );
              }
            }
          } catch (accountError) {
            console.error("Error creating customer account:", accountError);
          }
        }

        // Send emails (customer + admin)
        try {
          const adminEmail = Deno.env.get("ADMIN_EMAIL") || "reloadedfirestvteam@gmail.com";
          
          // FIRST EMAIL: Thank you for purchase (sent immediately)
          const confirmationEmailData = {
            to: customerEmail,
            subject: `Thank You For Your Purchase - Order ${orderCode}`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Stream Stick Pro</h1>
      <h2>Thank You For Your Purchase!</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Thank you for your order! Your payment has been confirmed.</p>
      
      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Order Code: <strong>${orderCode}</strong></li>
        <li>Product: ${realProductName}</li>
        <li>Total: $${amount.toFixed(2)}</li>
      </ul>

      <div class="info-box">
        <p><strong>📧 What's Next?</strong></p>
        <p>Your login information and setup instructions will be sent to this email address momentarily. Please check your inbox in the next 5 minutes.</p>
      </div>

      <p>We appreciate your business and look forward to serving you!</p>
      <p>If you have any questions, please reply to this email or contact support.</p>
    </div>
  </div>
</body>
</html>
            `,
          };

          // Send admin notification
          const adminEmailData = {
            to: adminEmail,
            subject: `New Order: ${orderCode} - ${customerName}`,
            html: `
<!DOCTYPE html>
<html>
<body>
  <h2>New Order Received</h2>
  <p><strong>Order Code:</strong> ${orderCode}</p>
  <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
  <p><strong>Product:</strong> ${realProductName}</p>
  <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
  <p><strong>Payment Method:</strong> Stripe</p>
  <p><strong>Account Created:</strong></p>
  <ul>
    <li>Username: ${username}</li>
    <li>Password: ${password}</li>
  </ul>
  ${setupVideoUrl ? `<p><strong>Setup Video:</strong> <a href="${setupVideoUrl}">${setupVideoUrl}</a></p>` : ""}
</body>
</html>
            `,
          };

          // Send confirmation email immediately (first email)
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
                totalUsd: amount,
                paymentMethod: "Stripe",
                products: [{ name: realProductName, price: amount, quantity: 1 }],
                emailType: "confirmation",
                emailHtml: confirmationEmailData.html,
                emailSubject: confirmationEmailData.subject,
                adminEmail,
              }),
            }
          );

          // Schedule credentials email for 5 minutes later (second email)
          // Store credentials email data to send later
          const credentialsEmailData = {
            customerEmail,
            customerName,
            orderCode,
            username,
            password,
            productName: realProductName,
            totalAmount: amount,
            setupVideoUrl: setupVideoUrl || "",
            serviceUrl: serviceUrl || "",
          };

          // Save to database for delayed sending
          try {
            await fetch(
              `${supabaseUrl}/rest/v1/pending_emails`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                },
                body: JSON.stringify({
                  customer_email: customerEmail,
                  order_code: orderCode,
                  email_type: "credentials",
                  email_data: credentialsEmailData,
                  send_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
                  status: "pending",
                }),
              }
            );
            console.log(`Credentials email scheduled for ${orderCode} - will send in 5 minutes`);
          } catch (scheduleError) {
            console.error("Error scheduling credentials email:", scheduleError);
            // Fallback: send immediately if scheduling fails
            await fetch(
              `${supabaseUrl}/functions/v1/send-credentials-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                },
                body: JSON.stringify(credentialsEmailData),
              }
            ).catch(() => {
              console.error("Failed to send credentials email");
            });
          }

          // Update order to mark emails sent
          if (orderId) {
            await fetch(
              `${supabaseUrl}/rest/v1/orders_full?id=eq.${orderId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                  "apikey": supabaseKey,
                },
                body: JSON.stringify({ email_sent: true, credentials_sent: true }),
              }
            );
          }
        } catch (emailError) {
          console.error("Error sending emails:", emailError);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        logPaymentEvent("payment_intent.payment_failed", paymentIntent, isLivePayment, {
          failureMessage: "Payment failed - check Stripe dashboard for details",
        });

        // Record the failed payment attempt
        const failedRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          payment_method: "stripe",
          payment_status: "failed",
          customer_email: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email,
          product_id: paymentIntent.metadata?.product_id,
          product_name: paymentIntent.metadata?.product_name,
          is_live_mode: isLivePayment,
          created_at: new Date().toISOString(),
          stripe_event_id: event.id,
          order_code: `STRIPE-${paymentIntent.id.slice(-8).toUpperCase()}`,
        };

        await fetch(
          `${supabaseUrl}/rest/v1/payment_transactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
              "Prefer": "return=minimal",
            },
            body: JSON.stringify(failedRecord),
          }
        );
        break;
      }

      case "payment_intent.canceled": {
        logPaymentEvent("payment_intent.canceled", paymentIntent, isLivePayment);
        break;
      }

      case "payment_intent.processing": {
        logPaymentEvent("payment_intent.processing", paymentIntent, isLivePayment);
        break;
      }

      case "payment_intent.created": {
        logPaymentEvent("payment_intent.created", paymentIntent, isLivePayment);
        break;
      }

      default: {
        // Log unhandled event types for debugging
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type} (${isLiveEvent ? "LIVE" : "TEST"})`);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        received: true,
        eventId: event.id,
        eventType: event.type,
        mode: isLiveEvent ? "live" : "test",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    logFailure("Unhandled Exception", errorMessage, {
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
