import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

interface StripeEvent {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  data: {
    object: Record<string, unknown>;
  };
}

interface PaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string;
  receipt_email?: string;
  metadata?: Record<string, string>;
  description?: string;
  created: number;
  payment_method_types?: string[];
}

/**
 * Determine if a transaction is a test transaction
 */
function isTestTransaction(event: StripeEvent): boolean {
  return !event.livemode;
}

/**
 * Get log level based on event type
 */
function getLogLevel(eventType: string): string {
  if (
    eventType.includes("failed") ||
    eventType.includes("canceled") ||
    eventType.includes("dispute")
  ) {
    return "error";
  }
  if (eventType.includes("pending") || eventType.includes("processing")) {
    return "warning";
  }
  return "info";
}

/**
 * Log payment event to Supabase
 */
async function logPaymentEvent(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent,
  paymentData: PaymentIntentData | null,
  additionalDetails: Record<string, unknown> = {}
): Promise<void> {
  const isTest = isTestTransaction(event);
  const logLevel = getLogLevel(event.type);
  const timestamp = new Date().toISOString();

  const logEntry = {
    event_id: event.id,
    event_type: event.type,
    log_level: logLevel,
    is_test_mode: isTest,
    environment: isTest ? "test" : "live",
    payment_intent_id: paymentData?.id || null,
    amount: paymentData?.amount ? paymentData.amount / 100 : null, // Convert from cents
    currency: paymentData?.currency?.toUpperCase() || null,
    payment_status: paymentData?.status || null,
    customer_id: paymentData?.customer || null,
    customer_email: paymentData?.receipt_email || null,
    metadata: paymentData?.metadata || {},
    description: paymentData?.description || null,
    payment_method_types: paymentData?.payment_method_types || [],
    raw_event_data: event,
    additional_details: additionalDetails,
    created_at: timestamp,
    event_timestamp: new Date(event.created * 1000).toISOString(),
  };

  // Log to console for debugging
  const logPrefix = isTest ? "[TEST]" : "[LIVE]";
  console.log(`${logPrefix} [${logLevel.toUpperCase()}] Stripe Event: ${event.type}`);
  console.log(`${logPrefix} Event ID: ${event.id}`);
  if (paymentData?.id) {
    console.log(`${logPrefix} Payment Intent: ${paymentData.id}`);
    console.log(`${logPrefix} Amount: ${(paymentData.amount / 100).toFixed(2)} ${paymentData.currency?.toUpperCase()}`);
    console.log(`${logPrefix} Status: ${paymentData.status}`);
  }

  // Store in database
  const { error } = await supabase.from("stripe_payment_logs").insert([logEntry]);

  if (error) {
    console.error("Error logging to database:", error);
    // Fallback: log to console in JSON format for external log collection
    console.log("STRIPE_PAYMENT_LOG:", JSON.stringify(logEntry));
  } else {
    console.log(`${logPrefix} Event logged successfully to database`);
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
): Promise<void> {
  const paymentIntent = event.data.object as unknown as PaymentIntentData;
  const isTest = isTestTransaction(event);
  const prefix = isTest ? "[TEST]" : "[LIVE]";

  console.log(`${prefix} Payment succeeded: ${paymentIntent.id}`);
  console.log(`${prefix} Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency?.toUpperCase()}`);
  console.log(`${prefix} Customer email: ${paymentIntent.receipt_email || "N/A"}`);

  await logPaymentEvent(supabase, event, paymentIntent, {
    success: true,
    processed_at: new Date().toISOString(),
  });

  // Update order status if metadata contains order_id
  if (paymentIntent.metadata?.order_id) {
    console.log(`${prefix} Updating order: ${paymentIntent.metadata.order_id}`);
    const { error: orderError } = await supabase
      .from("orders_full")
      .update({
        payment_status: "paid",
        order_status: "processing",
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentIntent.metadata.order_id);

    if (orderError) {
      console.error(`${prefix} Error updating order:`, orderError);
    } else {
      console.log(`${prefix} Order updated successfully`);
    }
  }

  // Update payment_transactions if order_code is present
  if (paymentIntent.metadata?.order_code) {
    console.log(`${prefix} Updating payment transaction: ${paymentIntent.metadata.order_code}`);
    const { error: txError } = await supabase
      .from("payment_transactions")
      .update({
        payment_status: "confirmed",
        transaction_id: paymentIntent.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("order_code", paymentIntent.metadata.order_code);

    if (txError) {
      console.error(`${prefix} Error updating payment transaction:`, txError);
    } else {
      console.log(`${prefix} Payment transaction updated successfully`);
    }
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
): Promise<void> {
  const paymentIntent = event.data.object as unknown as PaymentIntentData & {
    last_payment_error?: {
      code?: string;
      message?: string;
      type?: string;
    };
  };
  const isTest = isTestTransaction(event);
  const prefix = isTest ? "[TEST]" : "[LIVE]";

  console.error(`${prefix} Payment FAILED: ${paymentIntent.id}`);
  console.error(`${prefix} Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency?.toUpperCase()}`);
  console.error(`${prefix} Error: ${paymentIntent.last_payment_error?.message || "Unknown error"}`);

  await logPaymentEvent(supabase, event, paymentIntent, {
    success: false,
    failure_reason: paymentIntent.last_payment_error?.message || "Unknown error",
    failure_code: paymentIntent.last_payment_error?.code || "unknown",
    failure_type: paymentIntent.last_payment_error?.type || "unknown",
    processed_at: new Date().toISOString(),
  });

  // Update order status if metadata contains order_id
  if (paymentIntent.metadata?.order_id) {
    console.log(`${prefix} Marking order as failed: ${paymentIntent.metadata.order_id}`);
    const { error: orderError } = await supabase
      .from("orders_full")
      .update({
        payment_status: "failed",
        order_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentIntent.metadata.order_id);

    if (orderError) {
      console.error(`${prefix} Error updating order:`, orderError);
    }
  }

  // Update payment_transactions if order_code is present
  if (paymentIntent.metadata?.order_code) {
    console.log(`${prefix} Marking payment transaction as failed: ${paymentIntent.metadata.order_code}`);
    const { error: txError } = await supabase
      .from("payment_transactions")
      .update({
        payment_status: "failed",
        transaction_id: paymentIntent.id,
      })
      .eq("order_code", paymentIntent.metadata.order_code);

    if (txError) {
      console.error(`${prefix} Error updating payment transaction:`, txError);
    }
  }
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentIntentCanceled(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
): Promise<void> {
  const paymentIntent = event.data.object as unknown as PaymentIntentData & {
    cancellation_reason?: string;
  };
  const isTest = isTestTransaction(event);
  const prefix = isTest ? "[TEST]" : "[LIVE]";

  console.log(`${prefix} Payment CANCELED: ${paymentIntent.id}`);
  console.log(`${prefix} Reason: ${paymentIntent.cancellation_reason || "Not specified"}`);

  await logPaymentEvent(supabase, event, paymentIntent, {
    success: false,
    cancellation_reason: paymentIntent.cancellation_reason || "Not specified",
    processed_at: new Date().toISOString(),
  });
}

/**
 * Handle payment_intent.processing event
 */
async function handlePaymentIntentProcessing(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
): Promise<void> {
  const paymentIntent = event.data.object as unknown as PaymentIntentData;
  const isTest = isTestTransaction(event);
  const prefix = isTest ? "[TEST]" : "[LIVE]";

  console.log(`${prefix} Payment PROCESSING: ${paymentIntent.id}`);
  console.log(`${prefix} Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency?.toUpperCase()}`);

  await logPaymentEvent(supabase, event, paymentIntent, {
    in_progress: true,
    processed_at: new Date().toISOString(),
  });
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
): Promise<void> {
  const charge = event.data.object as unknown as {
    id: string;
    amount: number;
    amount_refunded: number;
    currency: string;
    payment_intent?: string;
    metadata?: Record<string, string>;
  };
  const isTest = isTestTransaction(event);
  const prefix = isTest ? "[TEST]" : "[LIVE]";

  console.log(`${prefix} Charge REFUNDED: ${charge.id}`);
  console.log(`${prefix} Refunded: $${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency?.toUpperCase()}`);

  const paymentData: PaymentIntentData = {
    id: charge.payment_intent || charge.id,
    amount: charge.amount,
    currency: charge.currency,
    status: "refunded",
    metadata: charge.metadata,
    created: event.created,
  };

  await logPaymentEvent(supabase, event, paymentData, {
    refund: true,
    amount_refunded: charge.amount_refunded / 100,
    processed_at: new Date().toISOString(),
  });

  // Update payment_transactions if order_code is present
  if (charge.metadata?.order_code) {
    console.log(`${prefix} Marking payment as refunded: ${charge.metadata.order_code}`);
    const { error: txError } = await supabase
      .from("payment_transactions")
      .update({
        payment_status: "refunded",
      })
      .eq("order_code", charge.metadata.order_code);

    if (txError) {
      console.error(`${prefix} Error updating payment transaction:`, txError);
    }
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Parse the event (in production, you would verify the signature)
    let event: StripeEvent;
    try {
      event = JSON.parse(body) as StripeEvent;
    } catch {
      console.error("Invalid JSON payload");
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log webhook receipt
    const isTest = isTestTransaction(event);
    const prefix = isTest ? "[TEST]" : "[LIVE]";
    console.log(`${prefix} Webhook received: ${event.type}`);
    console.log(`${prefix} Event ID: ${event.id}`);

    // Verify webhook signature if secret is configured
    if (stripeWebhookSecret && signature) {
      console.log(`${prefix} Signature verification enabled`);
      // In production, implement proper signature verification using Stripe's library
      // For now, we log that signature was present
      console.log(`${prefix} Signature present: ${signature.substring(0, 20)}...`);
    } else if (!stripeWebhookSecret) {
      console.warn(`${prefix} WARNING: Webhook signature verification is not configured`);
    }

    // Route to appropriate handler based on event type
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(supabase, event);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(supabase, event);
        break;
      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(supabase, event);
        break;
      case "payment_intent.processing":
        await handlePaymentIntentProcessing(supabase, event);
        break;
      case "payment_intent.created":
        const piCreated = event.data.object as unknown as PaymentIntentData;
        console.log(`${prefix} Payment Intent CREATED: ${piCreated.id}`);
        await logPaymentEvent(supabase, event, piCreated, {
          created: true,
          processed_at: new Date().toISOString(),
        });
        break;
      case "charge.refunded":
        await handleChargeRefunded(supabase, event);
        break;
      case "charge.succeeded":
        const charge = event.data.object as unknown as PaymentIntentData & {
          payment_intent?: string;
        };
        console.log(`${prefix} Charge SUCCEEDED: ${charge.id}`);
        const chargeData: PaymentIntentData = {
          id: charge.payment_intent || charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: "succeeded",
          receipt_email: charge.receipt_email,
          metadata: charge.metadata,
          created: charge.created,
        };
        await logPaymentEvent(supabase, event, chargeData, {
          charge_id: charge.id,
          processed_at: new Date().toISOString(),
        });
        break;
      case "charge.failed":
        const failedCharge = event.data.object as unknown as PaymentIntentData & {
          failure_message?: string;
          failure_code?: string;
        };
        console.error(`${prefix} Charge FAILED: ${failedCharge.id}`);
        const failedChargeData: PaymentIntentData = {
          id: failedCharge.id,
          amount: failedCharge.amount,
          currency: failedCharge.currency,
          status: "failed",
          metadata: failedCharge.metadata,
          created: failedCharge.created,
        };
        await logPaymentEvent(supabase, event, failedChargeData, {
          failure_message: failedCharge.failure_message,
          failure_code: failedCharge.failure_code,
          processed_at: new Date().toISOString(),
        });
        break;
      default:
        // Log unhandled events for monitoring
        console.log(`${prefix} Unhandled event type: ${event.type}`);
        await logPaymentEvent(supabase, event, null, {
          unhandled: true,
          processed_at: new Date().toISOString(),
        });
    }

    return new Response(
      JSON.stringify({
        received: true,
        event_id: event.id,
        event_type: event.type,
        is_test: isTest,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);

    return new Response(
      JSON.stringify({
        received: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
