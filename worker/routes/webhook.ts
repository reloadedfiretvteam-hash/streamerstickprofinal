import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { sendOrderConfirmation, sendCredentialsEmail, sendOwnerOrderNotification, generateCredentials, generateUniqueCredentials } from '../email';
import type { Env } from '../index';

type Storage = ReturnType<typeof getStorage>;

export function createWebhookRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  // Handle webhook with optional UUID suffix (from stripe-replit-sync managed webhooks)
  const handleWebhook = async (c: any) => {
    try {
      const signature = c.req.header('stripe-signature');
      const eventId = c.req.header('stripe-webhook-event-id') || 'unknown';

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:16',message:'Webhook received',data:{hasSignature:!!signature,eventId,hasWebhookSecret:!!c.env.STRIPE_WEBHOOK_SECRET,hasResendKey:!!c.env.RESEND_API_KEY,hasFromEmail:!!c.env.RESEND_FROM_EMAIL},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log(`[WEBHOOK] Received request, event-id header: ${eventId}`);
      console.log(`[WEBHOOK] RESEND_API_KEY configured: ${!!c.env.RESEND_API_KEY}`);
      console.log(`[WEBHOOK] RESEND_FROM_EMAIL: ${c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com'}`);

      if (!signature) {
        console.error('[WEBHOOK] Missing stripe-signature header');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:26',message:'Missing signature',data:{eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Still return 200 to acknowledge receipt - Stripe needs 200-299 range
        return c.json({ received: true, error: 'Missing signature' }, 200);
      }

      const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:34',message:'Webhook secret missing',data:{eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Still return 200 to acknowledge receipt - configuration issue logged
        return c.json({ received: true, error: 'Webhook not configured' }, 200);
      }

      let event: Stripe.Event;
      try {
        const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
        const rawBody = await c.req.text();
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:42',message:'Event verified',data:{eventType:event.type,eventId:event.id,hasDataObject:!!event.data.object},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log(`[WEBHOOK] Verified event: ${event.type} (${event.id})`);
      } catch (error: any) {
        console.error(`[WEBHOOK] Signature verification failed: ${error.message}`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:47',message:'Signature verification failed',data:{error:error.message,eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // Still return 200 to prevent retries - invalid signature logged but acknowledged
        return c.json({ received: true, error: 'Invalid signature' }, 200);
      }

      const storage = getStorage(c.env);
      let processingResult = { success: true, error: null as string | null };

      try {
        switch (event.type) {
          case 'checkout.session.completed':
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:54',message:'Processing checkout.session.completed',data:{sessionId:event.data.object.id,paymentIntent:event.data.object.payment_intent,customerEmail:event.data.object.customer_details?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.log(`[WEBHOOK] Processing checkout.session.completed`);
            await handleCheckoutComplete(event.data.object, storage, c.env);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:58',message:'checkout.session.completed processed',data:{sessionId:event.data.object.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.log(`[WEBHOOK] checkout.session.completed processed successfully`);
            break;
          case 'payment_intent.succeeded':
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:61',message:'Processing payment_intent.succeeded',data:{paymentIntentId:event.data.object.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.log(`[WEBHOOK] Processing payment_intent.succeeded`);
            await handlePaymentSucceeded(event.data.object, storage, c.env);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:65',message:'payment_intent.succeeded processed',data:{paymentIntentId:event.data.object.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:78',message:'Unhandled event type',data:{eventType:event.type},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
            break;
        }
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:81',message:'Error processing event',data:{eventType:event.type,error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        console.error(`[WEBHOOK] Error processing ${event.type}: ${error.message}`);
        console.error(`[WEBHOOK] Stack trace: ${error.stack}`);
        processingResult = { success: false, error: error.message };
      }

      // Always return 200 OK to prevent Stripe retries (event was received)
      // Stripe requires HTTP 200-299 status codes to consider webhook delivered
      return c.json({ received: true }, 200);
    } catch (error: any) {
      // Final safety net - catch any unexpected errors and still return 200
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:90',message:'Unexpected webhook error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      console.error(`[WEBHOOK] Unexpected error in webhook handler: ${error.message}`);
      console.error(`[WEBHOOK] Stack trace: ${error.stack}`);
      return c.json({ received: true, error: 'Unexpected error' }, 200);
    }
  };

  // Register both routes - with and without UUID
  app.post('/webhook', handleWebhook);
  app.post('/webhook/:uuid', handleWebhook);

  return app;
}

async function handleCheckoutComplete(session: any, storage: Storage, env: Env) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:105',message:'handleCheckoutComplete started',data:{sessionId:session.id,paymentIntent:session.payment_intent,customerEmail:session.customer_details?.email,hasResendKey:!!env.RESEND_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log(`[CHECKOUT] Session completed: ${session.id}`);
  console.log(`[CHECKOUT] Payment intent: ${session.payment_intent}`);
  console.log(`[CHECKOUT] Customer email: ${session.customer_details?.email}`);
  
  const order = await storage.getOrderByCheckoutSession(session.id);
  if (!order) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:112',message:'No order found for session',data:{sessionId:session.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
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

  const productIds = order.realProductId?.split(',') || [];
  const hasIPTV = productIds.some(id => id.trim().startsWith('iptv-')) || 
                  productIds.some(id => id.trim().startsWith('firestick-'));

  if (hasIPTV) {
    if (order.isRenewal && order.existingUsername) {
      console.log(`Processing renewal for existing username: ${order.existingUsername}`);
      
      const existingCustomer = await storage.getCustomerByUsername(order.existingUsername);
      if (existingCustomer) {
        updateData.generatedUsername = existingCustomer.username;
        updateData.generatedPassword = existingCustomer.password;
        
        if (!order.customerId) {
          updateData.customerId = existingCustomer.id;
        }
        
        await storage.incrementCustomerOrders(existingCustomer.id);
        console.log(`Renewal processed for customer ${existingCustomer.id}, order count incremented`);
      } else {
        console.log(`WARNING: Could not find customer with username ${order.existingUsername}`);
      }
    } else {
      console.log(`Processing new customer order, generating credentials`);
      
      const credentials = await generateUniqueCredentials(order, storage);
      updateData.generatedUsername = credentials.username;
      updateData.generatedPassword = credentials.password;
      
      const customerPhone = session.customer_details?.phone || order.shippingPhone || updateData.shippingPhone || undefined;
      const customerName = order.customerName || session.customer_details?.name || undefined;
      
      try {
        const newCustomer = await storage.createCustomer({
          username: credentials.username,
          password: credentials.password,
          email: order.customerEmail,
          fullName: customerName,
          phone: customerPhone,
        });
        
        updateData.customerId = newCustomer.id;
        console.log(`Created new customer ${newCustomer.id} with username ${credentials.username}`);
        
        await storage.incrementCustomerOrders(newCustomer.id);
      } catch (error) {
        console.error('Error creating customer record:', error);
      }
    }
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:226',message:'Starting email delivery',data:{orderId:order.id,customerEmail:updatedOrder.customerEmail,hasResendKey:!!env.RESEND_API_KEY,fromEmail:env.RESEND_FROM_EMAIL||'noreply@streamstickpro.com',credentialsSent:updatedOrder.credentialsSent},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log(`[EMAIL] Starting email delivery for order ${order.id}`);
  console.log(`[EMAIL] Sending to: ${updatedOrder.customerEmail}`);
  console.log(`[EMAIL] RESEND_API_KEY configured: ${!!env.RESEND_API_KEY}`);
  console.log(`[EMAIL] RESEND_FROM_EMAIL: ${env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com'}`);
  
  // Send order confirmation
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:234',message:'Calling sendOrderConfirmation',data:{orderId:updatedOrder.id,customerEmail:updatedOrder.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log(`[EMAIL] Attempting to send order confirmation...`);
    await sendOrderConfirmation(updatedOrder, env);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:237',message:'Order confirmation sent successfully',data:{orderId:updatedOrder.id,customerEmail:updatedOrder.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log(`[EMAIL] ✅ Order confirmation sent successfully to ${updatedOrder.customerEmail}`);
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:240',message:'Order confirmation failed',data:{orderId:updatedOrder.id,error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    console.error(`[EMAIL] ❌ ERROR sending order confirmation: ${error.message}`);
    console.error(`[EMAIL] Error details:`, error);
    console.error(`[EMAIL] Error stack: ${error.stack}`);
  }
  
  // Send owner notification
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:244',message:'Calling sendOwnerOrderNotification',data:{orderId:updatedOrder.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log(`[EMAIL] Attempting to send owner notification...`);
    await sendOwnerOrderNotification(updatedOrder, env);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:247',message:'Owner notification sent successfully',data:{orderId:updatedOrder.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log(`[EMAIL] ✅ Owner notification sent successfully`);
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:250',message:'Owner notification failed',data:{orderId:updatedOrder.id,error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'J'})}).catch(()=>{});
    // #endregion
    console.error(`[EMAIL] ❌ ERROR sending owner notification: ${error.message}`);
    console.error(`[EMAIL] Error details:`, error);
    console.error(`[EMAIL] Error stack: ${error.stack}`);
  }
  
  // Send credentials if not already sent
  if (!updatedOrder.credentialsSent) {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:256',message:'Calling sendCredentialsEmail',data:{orderId:updatedOrder.id,customerEmail:updatedOrder.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log(`[EMAIL] Attempting to send credentials email...`);
      await sendCredentialsEmail(updatedOrder, env, storage);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:259',message:'Credentials email sent successfully',data:{orderId:updatedOrder.id,customerEmail:updatedOrder.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log(`[EMAIL] ✅ Credentials sent successfully to ${updatedOrder.customerEmail}`);
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:262',message:'Credentials email failed',data:{orderId:updatedOrder.id,error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
      console.error(`[EMAIL] ❌ ERROR sending credentials: ${error.message}`);
      console.error(`[EMAIL] Error details:`, error);
      console.error(`[EMAIL] Error stack: ${error.stack}`);
    }
  } else {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:266',message:'Credentials already sent',data:{orderId:order.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'L'})}).catch(()=>{});
    // #endregion
    console.log(`[EMAIL] Credentials already sent for order ${order.id}`);
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook.ts:268',message:'Checkout complete finished',data:{orderId:order.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
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

  // Fetch updated order
  const updatedOrder = await storage.getOrder(order.id);
  if (!updatedOrder) {
    console.error(`[PAYMENT] ERROR: Could not retrieve updated order ${order.id}`);
    return;
  }

  // Ensure we have customer email
  if (!updatedOrder.customerEmail) {
    console.error(`[EMAIL] ERROR: Order ${order.id} missing customerEmail`);
    return;
  }

  console.log(`[EMAIL] Starting email delivery for order ${order.id}`);
  console.log(`[EMAIL] Sending to: ${updatedOrder.customerEmail}`);
  
  // Send order confirmation
  try {
    await sendOrderConfirmation(updatedOrder, env);
    console.log(`[EMAIL] Order confirmation sent to ${updatedOrder.customerEmail}`);
  } catch (error: any) {
    console.error(`[EMAIL] ERROR sending order confirmation: ${error.message}`);
    console.error(`[EMAIL] Error stack: ${error.stack}`);
  }
  
  // Send owner notification
  try {
    await sendOwnerOrderNotification(updatedOrder, env);
    console.log(`[EMAIL] Owner notification sent`);
  } catch (error: any) {
    console.error(`[EMAIL] ERROR sending owner notification: ${error.message}`);
    console.error(`[EMAIL] Error stack: ${error.stack}`);
  }
  
  // Send credentials if not already sent
  if (!updatedOrder.credentialsSent) {
    try {
      await sendCredentialsEmail(updatedOrder, env, storage);
      console.log(`[EMAIL] Credentials sent to ${updatedOrder.customerEmail}`);
    } catch (error: any) {
      console.error(`[EMAIL] ERROR sending credentials: ${error.message}`);
      console.error(`[EMAIL] Error stack: ${error.stack}`);
    }
  } else {
    console.log(`[EMAIL] Credentials already sent for order ${order.id}`);
  }

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
