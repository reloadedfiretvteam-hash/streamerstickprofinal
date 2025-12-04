import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature, X-Client-Info, Apikey",
};

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

async function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<{ valid: boolean; timestamp?: number; error?: string }> {
  try {
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

    const timestampNum = parseInt(timestamp, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tolerance = 300;

    if (Math.abs(currentTimestamp - timestampNum) > tolerance) {
      return { 
        valid: false, 
        timestamp: timestampNum,
        error: `Timestamp outside tolerance window: ${timestampNum} vs ${currentTimestamp}` 
      };
    }

    const signedPayload = `${timestamp}.${payload}`;

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

    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

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

    const isLiveEvent = event.livemode === true;
    const paymentIntent = event.data?.object;
    const isLivePayment = paymentIntent?.livemode === true;

    if (isLiveEvent !== isLivePayment) {
      logFailure("Mode Mismatch", "Event and PaymentIntent livemode mismatch", {
        eventLivemode: isLiveEvent,
        paymentIntentLivemode: isLivePayment,
        eventId: event.id,
        paymentIntentId: paymentIntent?.id,
      });
    }

    console.log(`[STRIPE-WEBHOOK] Received ${event.type} event (${isLiveEvent ? "LIVE" : "TEST"}): ${event.id}`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        logPaymentEvent("payment_intent.succeeded", paymentIntent, isLivePayment);

        // Idempotency: Check if we already processed this payment intent
        const checkResponse = await fetch(
          `${supabaseUrl}/rest/v1/payment_transactions?stripe_payment_intent_id=eq.${paymentIntent.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
          }
        );

        if (checkResponse.ok) {
          const existing = await checkResponse.json();
          if (existing && existing.length > 0) {
            console.log(`[STRIPE-IDEMPOTENCY] Payment ${paymentIntent.id} already processed, skipping`);
            break;
          }
        }

        const transactionRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          payment_method: "stripe",
          payment_status: "confirmed",
          customer_email: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email,
          product_id: paymentIntent.metadata?.product_id,
          product_name: paymentIntent.metadata?.product_name,
          is_live_mode: isLivePayment,
          created_at: new Date().toISOString(),
          stripe_event_id: event.id,
          order_code: `STRIPE-${paymentIntent.id.slice(-8).toUpperCase()}`,
        };

        const insertResponse = await fetch(
          `${supabaseUrl}/rest/v1/payment_transactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
              "Prefer": "return=minimal",
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
        break;
      }

      case "payment_intent.payment_failed": {
        logPaymentEvent("payment_intent.payment_failed", paymentIntent, isLivePayment, {
          failureMessage: "Payment failed - check Stripe dashboard for details",
        });

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
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type} (${isLiveEvent ? "LIVE" : "TEST"})`);
      }
    }

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
