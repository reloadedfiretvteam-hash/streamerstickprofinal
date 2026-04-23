import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import type { Env } from '../index';
import { finalizePaidOrderById, processCheckoutSessionCompletion } from '../lib/stripe-order-finalize';

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
      note: 'If Stripe webhooks are not working, verify Stripe Dashboard → Webhooks → URL is: https://streamstickpro.com/api/stripe/webhook',
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
            await processCheckoutSessionCompletion(event.data.object as Stripe.Checkout.Session, storage, c.env, 'webhook.checkout.session.completed');
            console.log(`[WEBHOOK] checkout.session.completed processed successfully`);
            break;
          case 'checkout.session.async_payment_succeeded':
            console.log(`[WEBHOOK] Processing checkout.session.async_payment_succeeded`);
            await processCheckoutSessionCompletion(event.data.object as Stripe.Checkout.Session, storage, c.env, 'webhook.checkout.session.async_payment_succeeded');
            console.log(`[WEBHOOK] checkout.session.async_payment_succeeded processed successfully`);
            break;
          case 'checkout.session.async_payment_failed':
            console.log(`[WEBHOOK] Processing checkout.session.async_payment_failed`);
            await handleCheckoutAsyncFailed(event.data.object, storage);
            console.log(`[WEBHOOK] checkout.session.async_payment_failed processed successfully`);
            break;
          case 'checkout.session.expired':
            console.log(`[WEBHOOK] Processing checkout.session.expired`);
            await handleCheckoutExpired(event.data.object, storage);
            console.log(`[WEBHOOK] checkout.session.expired processed successfully`);
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
            console.log(`[WEBHOOK] Acknowledged ${event.type} (no action needed)`);
            break;
          case 'payment_intent.created':
          case 'payment_intent.processing':
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

  app.post('/webhook', handleWebhook);
  app.post('/webhook/:uuid', handleWebhook);

  return app;
}

async function handlePaymentSucceeded(paymentIntent: any, storage: Storage, env: Env) {
  const piId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
  console.log(`[PAYMENT] Payment succeeded: ${piId}`);

  let order = piId ? await storage.getOrderByPaymentIntent(piId) : undefined;

  const metaOid = String(paymentIntent?.metadata?.internalOrderId || '').trim();
  if (!order && metaOid) {
    order = await storage.getOrder(metaOid);
  }

  if (!order && piId) {
    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const pi = await stripe.paymentIntents.retrieve(piId);
      const oid = String((pi.metadata as any)?.internalOrderId || '').trim();
      if (oid) order = await storage.getOrder(oid);
    } catch (e: any) {
      console.error(`[PAYMENT] Could not retrieve PI ${piId}: ${e?.message || e}`);
    }
  }

  if (!order) {
    console.error(`[PAYMENT] ERROR: No order found for payment intent: ${piId}`);
    return;
  }

  console.log(`[PAYMENT] Found order: ${order.id} for ${order.customerEmail}`);

  await finalizePaidOrderById(storage, env, order.id, 'webhook.payment_intent.succeeded', {
    stripePaymentIntentId: piId,
  });
  console.log(`[PAYMENT] Completed processing order ${order.id}`);
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

async function handleCheckoutAsyncFailed(session: any, storage: Storage) {
  const order = await storage.getOrderByCheckoutSession(session?.id);
  if (!order) return;
  await storage.updateOrder(order.id, {
    status: 'failed',
    stripePaymentIntentId: session?.payment_intent ?? order.stripePaymentIntentId ?? null,
    stripeCustomerId: session?.customer ?? order.stripeCustomerId ?? null,
  } as any);
}

async function handleCheckoutExpired(session: any, storage: Storage) {
  const order = await storage.getOrderByCheckoutSession(session?.id);
  if (!order) return;
  await storage.updateOrder(order.id, {
    stripePaymentIntentId: session?.payment_intent ?? order.stripePaymentIntentId ?? null,
    stripeCustomerId: session?.customer ?? order.stripeCustomerId ?? null,
  } as any);
}
