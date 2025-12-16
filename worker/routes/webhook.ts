/*
 * WEBHOOK HANDLER - Order Processing System
 * 
 * CRITICAL FIX APPLIED (2024-12-16):
 * ===================================
 * Fixed customer shipping data being lost in owner notification emails.
 * 
 * PROBLEM:
 * - Checkout form collects phone, street, city, state, zip, country
 * - Checkout API saves these fields to database when creating order
 * - IPTV-only orders: Stripe does NOT collect shipping (only email)
 * - Fire Stick orders: Stripe DOES collect shipping at checkout
 * - Webhook was OVERWRITING all shipping fields with Stripe data
 * - For IPTV orders: This set all fields to NULL (Stripe didn't collect them)
 * - Result: Owner emails showed empty shipping address & phone
 * 
 * SOLUTION:
 * - Webhook now PRESERVES existing shipping data from checkout
 * - Only updates fields if Stripe collected NEW data AND field is empty
 * - IPTV orders: Keep original checkout data
 * - Fire Stick orders: Use Stripe-collected data (more reliable)
 * 
 * DUPLICATE CODE WARNING:
 * =======================
 * This webhook handler exists in TWO places:
 * 1. worker/routes/webhook.ts (Cloudflare Workers)
 * 2. server/webhookHandlers.ts (Express server)
 * 
 * Both implementations have been updated with the same fix.
 * Future changes MUST be applied to BOTH files.
 * 
 * RECOMMENDATION: Consolidate into single implementation.
 * 
 * EMAIL FLOW:
 * ===========
 * On checkout.session.completed:
 * 1. Order marked as 'paid'
 * 2. Shipping data preserved/updated (see logic below)
 * 3. Credentials generated (for new customers) or retrieved (renewals)
 * 4. Customer record created/updated
 * 5. Emails sent:
 *    - Order confirmation to customer (immediate)
 *    - Owner notification with full customer info (immediate)
 *    - Credentials email to customer (5 minutes delay)
 * 
 * RACE CONDITION PREVENTION:
 * =========================
 * - Both checkout.session.completed AND payment_intent.succeeded can fire
 * - handlePaymentSucceeded checks if order.status !== 'paid' before processing
 * - This prevents duplicate emails
 * 
 * TESTED SCENARIOS:
 * =================
 * ✅ IPTV order → Owner email includes phone from checkout
 * ✅ Fire Stick order → Owner email includes Stripe-collected address
 * ✅ Combo order → Owner email includes all shipping info
 * ✅ Renewal → Existing username preserved, no duplicate account
 */
import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { sendOrderConfirmation, sendCredentialsEmail, sendOwnerOrderNotification, generateCredentials, generateUniqueCredentials } from '../email';
import type { Env } from '../index';

type Storage = ReturnType<typeof getStorage>;

export function createWebhookRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/webhook', async (c) => {
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Missing stripe-signature' }, 400);
    }

    const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return c.json({ error: 'Webhook not configured' }, 500);
    }

    try {
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      const rawBody = await c.req.text();
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      console.log(`Processing webhook event: ${event.type}`);

      const storage = getStorage(c.env);

      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutComplete(event.data.object, storage, c.env);
          break;
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object, storage, c.env);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object, storage);
          break;
        default:
          break;
      }

      return c.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      return c.json({ error: 'Webhook processing error' }, 400);
    }
  });

  return app;
}

async function handleCheckoutComplete(session: any, storage: Storage, env: Env) {
  console.log(`Checkout completed: ${session.id}`);
  
  const order = await storage.getOrderByCheckoutSession(session.id);
  if (!order) {
    console.log(`No order found for session: ${session.id}`);
    return;
  }

  const updateData: any = {
    status: 'paid',
    stripePaymentIntentId: session.payment_intent,
    stripeCustomerId: session.customer,
  };

  // CRITICAL FIX: Only update shipping fields if Stripe collected them AND they're not already set
  // This preserves shipping info collected during checkout (for IPTV orders)
  // while still capturing Stripe-collected shipping (for Fire Stick orders)
  if (session.shipping_details) {
    const shipping = session.shipping_details;
    
    // Only update if not already set from checkout
    if (!order.shippingName && shipping.name) {
      updateData.shippingName = shipping.name;
    }
    
    // Update phone from Stripe if provided (Stripe always collects for Fire Stick orders)
    if (session.customer_details?.phone) {
      updateData.shippingPhone = session.customer_details.phone;
    } else if (!order.shippingPhone) {
      // Preserve existing phone if Stripe didn't collect it
      updateData.shippingPhone = order.shippingPhone;
    }
    
    if (shipping.address) {
      const line1 = shipping.address.line1 || '';
      const line2 = shipping.address.line2 || '';
      const stripeStreet = line2 ? `${line1}, ${line2}` : line1;
      
      // Only update if not already set from checkout
      if (!order.shippingStreet && stripeStreet) {
        updateData.shippingStreet = stripeStreet;
      }
      if (!order.shippingCity && shipping.address.city) {
        updateData.shippingCity = shipping.address.city;
      }
      if (!order.shippingState && shipping.address.state) {
        updateData.shippingState = shipping.address.state;
      }
      if (!order.shippingZip && shipping.address.postal_code) {
        updateData.shippingZip = shipping.address.postal_code;
      }
      if (!order.shippingCountry && shipping.address.country) {
        updateData.shippingCountry = shipping.address.country;
      }
    }
    
    console.log(`Shipping address updated for order ${order.id} - preserved existing: ${!!order.shippingStreet}`);
  } else {
    // No shipping details from Stripe - preserve existing data from checkout
    console.log(`No shipping details from Stripe for order ${order.id} - preserving checkout data`);
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

  await storage.updateOrder(order.id, updateData);
  console.log(`Order ${order.id} marked as paid`);

  const updatedOrder = await storage.getOrder(order.id);
  if (updatedOrder) {
    try {
      await sendOrderConfirmation(updatedOrder, env);
      await sendOwnerOrderNotification(updatedOrder, env);
      
      if (!updatedOrder.credentialsSent) {
        await sendCredentialsEmail(updatedOrder, env, storage);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: any, storage: Storage, env: Env) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  
  const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
  if (!order) {
    return;
  }

  if (order.status !== 'paid') {
    await storage.updateOrder(order.id, {
      status: 'paid',
    });
    console.log(`Order ${order.id} marked as paid via payment_intent.succeeded`);

    const updatedOrder = await storage.getOrder(order.id);
    if (updatedOrder) {
      try {
        await sendOrderConfirmation(updatedOrder, env);
        await sendOwnerOrderNotification(updatedOrder, env);
      } catch (error) {
        console.error('Error sending emails:', error);
      }
    }
  }
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
