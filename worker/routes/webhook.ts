import { Hono } from 'hono';
import Stripe from 'stripe';
import { createStorage } from '../storage';
import { sendOrderConfirmation, sendCredentialsEmail, sendOwnerOrderNotification, generateCredentials, generateUniqueCredentials } from '../email';
import type { Env } from '../index';

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

      const storage = createStorage(c.env.DATABASE_URL);

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

async function handleCheckoutComplete(session: any, storage: ReturnType<typeof createStorage>, env: Env) {
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

async function handlePaymentSucceeded(paymentIntent: any, storage: ReturnType<typeof createStorage>, env: Env) {
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

async function handlePaymentFailed(paymentIntent: any, storage: ReturnType<typeof createStorage>) {
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
