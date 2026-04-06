import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { sendOrderConfirmation, sendOwnerOrderNotification } from '../email';
import { ensureProvisioningJob, orderNeedsProvisioning, processProvisioningJobByOrderId } from '../lib/provisioning';
import type { Env } from '../index';

type Storage = ReturnType<typeof getStorage>;

export function createWebhookRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  // Test endpoint to verify webhook is reachable
  app.post('/test', async (c) => {
    return c.json({ 
      message: 'Webhook endpoint is reachable',
      timestamp: new Date().toISOString(),
      url: c.req.url,
      method: c.req.method,
      note: 'If Stripe webhooks are not working, verify Stripe Dashboard → Webhooks → URL is: https://secure.streamstickpro.com/api/stripe/webhook'
    });
  });

  // Handle webhook with optional UUID suffix (from stripe-replit-sync managed webhooks)
  const handleWebhook = async (c: any) => {
    try {
      const signature = c.req.header('stripe-signature');
      const eventId = c.req.header('stripe-webhook-event-id') || 'unknown';

      console.log(`[WEBHOOK] Received request, event-id header: ${eventId}`);
      console.log(`[WEBHOOK] RESEND_API_KEY configured: ${!!c.env.RESEND_API_KEY}`);
      console.log(`[WEBHOOK] RESEND_FROM_EMAIL: ${c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com'}`);

      if (!signature) {
        console.error('[WEBHOOK] Missing stripe-signature header');
        return c.json({ error: 'Missing signature' }, 400);
      }

      const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
        return c.json({ error: 'Webhook not configured' }, 500);
      }

      let event: Stripe.Event;
      try {
        const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
        const rawBody = await c.req.text();
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        console.log(`[WEBHOOK] Verified event: ${event.type} (${event.id})`);
      } catch (error: any) {
        console.error(`[WEBHOOK] Signature verification failed: ${error.message}`);
        return c.json({ error: 'Invalid signature' }, 400);
      }

      const storage = getStorage(c.env);
      let processingResult = { success: true, error: null as string | null };

      try {
        switch (event.type) {
          case 'checkout.session.completed':
            console.log(`[WEBHOOK] Processing checkout.session.completed`);
            await handleCheckoutComplete(event.data.object, storage, c.env);
            console.log(`[WEBHOOK] checkout.session.completed processed successfully`);
            break;
          case 'payment_intent.succeeded':
            console.log(`[WEBHOOK] Processing payment_intent.succeeded`);
            await handlePaymentSucceeded(event.data.object, storage, c.env);
            console.log(`[WEBHOOK] payment_intent.succeeded processed successfully`);
            break;
          case 'payment_intent.payment_failed':
            console.log(`[WEBHOOK] Processing payment_intent.payment_failed`);
            await handlePaymentFailed(event.data.object, storage);
            console.log(`[WEBHOOK] payment_intent.payment_failed processed successfully`);
            break;
          case 'charge.succeeded':
          case 'charge.updated':
          case 'charge.captured':
            // These are informational events - we handle payments via checkout.session.completed
            console.log(`[WEBHOOK] Acknowledged ${event.type} (no action needed)`);
            break;
          case 'payment_intent.created':
          case 'payment_intent.processing':
            // These are intermediate states - no action needed
            console.log(`[WEBHOOK] Acknowledged ${event.type} (intermediate state)`);
            break;
          default:
            console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
            break;
        }
      } catch (error: any) {
        console.error(`[WEBHOOK] Error processing ${event.type}: ${error.message}`);
        console.error(`[WEBHOOK] Stack trace: ${error.stack}`);
        processingResult = { success: false, error: error.message };
      }

      if (!processingResult.success) {
        return c.json({ error: processingResult.error || 'Webhook processing failed' }, 500);
      }

      return c.json({ received: true }, 200);
    } catch (error: any) {
      console.error(`[WEBHOOK] Unexpected error in webhook handler: ${error.message}`);
      console.error(`[WEBHOOK] Stack trace: ${error.stack}`);
      return c.json({ error: 'Unexpected error' }, 500);
    }
  };

  // Register both routes - with and without UUID
  app.post('/webhook', handleWebhook);
  app.post('/webhook/:uuid', handleWebhook);

  return app;
}

async function handleCheckoutComplete(session: any, storage: Storage, env: Env) {
  console.log(`[CHECKOUT] Session completed: ${session.id}`);
  console.log(`[CHECKOUT] Payment intent: ${session.payment_intent}`);
  console.log(`[CHECKOUT] Customer email: ${session.customer_details?.email}`);
  
  const order = await storage.getOrderByCheckoutSession(session.id);
  if (!order) {
    console.error(`[CHECKOUT] ERROR: No order found for session: ${session.id}`);
    return;
  }

  console.log(`[CHECKOUT] Found order: ${order.id} for ${order.customerEmail}`);
  console.log(`[CHECKOUT] Product: ${order.realProductName} ($${(order.amount / 100).toFixed(2)})`);

  const updateData: any = {
    status: 'paid',
    stripePaymentIntentId: session.payment_intent,
    stripeCustomerId: session.customer,
  };

  if (typeof session.amount_total === 'number' && Number.isFinite(session.amount_total) && session.amount_total >= 0) {
    updateData.amount = Math.round(session.amount_total);
  }

  if (session.shipping_details) {
    const shipping = session.shipping_details;
    updateData.shippingName = shipping.name || null;
    updateData.shippingPhone = session.customer_details?.phone || null;
    
    if (shipping.address) {
      const line1 = shipping.address.line1 || '';
      const line2 = shipping.address.line2 || '';
      updateData.shippingStreet = line2 ? `${line1}, ${line2}` : line1;
      updateData.shippingCity = shipping.address.city || null;
      updateData.shippingState = shipping.address.state || null;
      updateData.shippingZip = shipping.address.postal_code || null;
      updateData.shippingCountry = shipping.address.country || null;
    }
    
    console.log(`Shipping address captured for order ${order.id}`);
  }

  // Ensure we have customer email - use session email as fallback before updating
  const customerEmail = order.customerEmail || session.customer_details?.email;
  if (!customerEmail) {
    console.error(`[EMAIL] ERROR: No customer email found for order ${order.id}`);
    console.error(`[EMAIL] Order email: ${order.customerEmail}`);
    console.error(`[EMAIL] Session email: ${session.customer_details?.email}`);
    // Still update the order as paid even if email is missing
    await storage.updateOrder(order.id, updateData);
    return;
  }

  // Add email to update data if it was missing
  if (!order.customerEmail && customerEmail) {
    updateData.customerEmail = customerEmail;
    console.log(`[EMAIL] Adding email from session to order update: ${customerEmail}`);
  }

  await storage.updateOrder(order.id, updateData);
  console.log(`[CHECKOUT] Order ${order.id} marked as paid`);

  // Fetch the updated order with the correct email
  const updatedOrder = await storage.getOrder(order.id);
  if (!updatedOrder) {
    console.error(`[CHECKOUT] ERROR: Could not retrieve updated order ${order.id}`);
    return;
  }

  // Double-check email exists (should always be there now)
  if (!updatedOrder.customerEmail) {
    console.error(`[EMAIL] ERROR: Order ${order.id} still missing email after update`);
    return;
  }

  console.log(`[EMAIL] Starting webhook email delivery for order ${order.id}`);
  console.log(`[EMAIL] Sending to: ${updatedOrder.customerEmail}`);
  console.log(`[EMAIL] RESEND_API_KEY configured: ${!!env.RESEND_API_KEY}`);
  console.log(`[EMAIL] RESEND_FROM_EMAIL: ${env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com'}`);

  // Always notify owner from webhook so fulfillment visibility does not depend on browser redirects.
  try {
    console.log(`[EMAIL] Attempting to send owner notification...`);
    await sendOwnerOrderNotification(updatedOrder, env);
    console.log(`[EMAIL] ✅ Owner notification sent successfully`);
  } catch (error: any) {
    console.error(`[EMAIL] ❌ ERROR sending owner notification: ${error.message}`);
    console.error(`[EMAIL] Error details:`, error);
    console.error(`[EMAIL] Error stack: ${error.stack}`);
  }

  if (!updatedOrder.credentialsSent) {
    try {
      await sendOrderConfirmation(updatedOrder, env);
      console.log(`[EMAIL] ✅ Order confirmation sent from webhook`);
    } catch (error: any) {
      console.error(`[EMAIL] ❌ Failed webhook order confirmation: ${error.message}`);
    }
  }

  if (orderNeedsProvisioning(updatedOrder)) {
    try {
      await ensureProvisioningJob(storage, updatedOrder, {
        source: 'checkout.session.completed',
        sessionId: session.id,
      });
      await processProvisioningJobByOrderId(env, updatedOrder.id);
      console.log(`[PROVISIONING] Queued and attempted provisioning for ${updatedOrder.id}`);
    } catch (error: any) {
      console.error(`[PROVISIONING] Failed to queue/process provisioning for ${updatedOrder.id}: ${error.message}`);
    }
  }
  
  console.log(`[CHECKOUT] Completed processing order ${order.id}`);
}

async function handlePaymentSucceeded(paymentIntent: any, storage: Storage, env: Env) {
  console.log(`[PAYMENT] Payment succeeded: ${paymentIntent.id}`);
  
  const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
  if (!order) {
    console.error(`[PAYMENT] ERROR: No order found for payment intent: ${paymentIntent.id}`);
    return;
  }

  console.log(`[PAYMENT] Found order: ${order.id} for ${order.customerEmail}`);
  
  const updateData: any = {
    status: 'paid',
    stripePaymentIntentId: paymentIntent.id,
  };

  // Update order if not already paid
  if (order.status !== 'paid') {
    await storage.updateOrder(order.id, updateData);
    console.log(`[PAYMENT] Order ${order.id} marked as paid via payment_intent.succeeded`);
  }

  // Keep payment_intent.succeeded as a state-sync signal only.
  // Email delivery is handled by checkout.session.completed and /api/checkout/send-emails
  // to avoid duplicate sends from parallel webhook events.
  console.log(`[PAYMENT] Completed processing order ${order.id} (state sync only)`);
}

async function handlePaymentFailed(paymentIntent: any, storage: Storage) {
  console.log(`Payment failed: ${paymentIntent.id}`);
  
  const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
  if (!order) {
    return;
  }

  await storage.updateOrder(order.id, {
    status: 'failed',
  });
  console.log(`Order ${order.id} marked as failed`);
}
