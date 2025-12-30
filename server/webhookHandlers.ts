import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { EmailService } from './emailService';
import type { Order } from '@shared/schema';
import * as bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);

    const stripe = await getUncachableStripeClient();
    const webhookSecret = await getWebhookSecret(uuid);
    
    if (!webhookSecret) {
      console.log('Webhook secret not found, skipping custom event handling');
      return;
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      await WebhookHandlers.handleEvent(event);
    } catch (error: any) {
      console.error('Error verifying webhook signature:', error.message);
    }
  }

  static async handleEvent(event: any): Promise<void> {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // First, send payment confirmation emails via dedicated handler (for paid purchases only)
        // This uses Resend and only handles paid purchases, not free trials
        try {
          await handlePaidCheckoutSession(session);
        } catch (error: any) {
          console.error(`[WEBHOOK] Error in payment email handler:`, error.message);
          // Continue with order processing even if email fails
        }
        
        // Then, handle order updates and credentials (existing logic)
        await WebhookHandlers.handleCheckoutComplete(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Handle order updates and confirmation emails
        // EmailService.sendOrderConfirmation is called inside handlePaymentSucceeded
        // It uses realProductName from the database order (not metadata/URLs)
        await WebhookHandlers.handlePaymentSucceeded(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed':
        await WebhookHandlers.handlePaymentFailed(event.data.object);
        break;
      default:
        break;
    }
  }

  static async handleCheckoutComplete(session: any): Promise<void> {
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
        
        const credentials = await EmailService.generateUniqueCredentials(order);
        updateData.generatedUsername = credentials.username;
        updateData.generatedPassword = credentials.password;
        
        const customerPhone = session.customer_details?.phone || order.shippingPhone || updateData.shippingPhone || undefined;
        const customerName = order.customerName || session.customer_details?.name || undefined;
        
        try {
          const hashedPassword = await hashPassword(credentials.password);
          const newCustomer = await storage.createCustomer({
            username: credentials.username,
            password: hashedPassword,
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
        // Only send emails for paid purchases (not free trials)
        if (session.payment_status === 'paid' && session.amount_total && session.amount_total > 0) {
          // Send order confirmation email to customer (uses realProductName from database)
          await EmailService.sendOrderConfirmation(updatedOrder);
          
          // Send detailed owner notification
          await EmailService.sendOwnerOrderNotification(updatedOrder);
          
          // Schedule credentials email (separate from payment confirmation)
          await EmailService.scheduleCredentialsEmail(updatedOrder.id);
        }
      } catch (error) {
        console.error('Error sending confirmation emails:', error);
      }
    }
  }

  static async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
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
          // Only send emails for paid purchases
          if (paymentIntent.amount_received && paymentIntent.amount_received > 0) {
            // Send order confirmation email to customer (uses realProductName from database)
            await EmailService.sendOrderConfirmation(updatedOrder);
            
            // Send detailed owner notification
            await EmailService.sendOwnerOrderNotification(updatedOrder);
            
            // Schedule credentials email (separate from payment confirmation)
            await EmailService.scheduleCredentialsEmail(updatedOrder.id);
          }
        } catch (error) {
          console.error('Error sending confirmation emails:', error);
        }
      }
    }
  }

  static async handlePaymentFailed(paymentIntent: any): Promise<void> {
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
}

async function getWebhookSecret(uuid: string): Promise<string | null> {
  try {
    const stripeSync = await getStripeSync();
    const webhooks = await stripeSync.listManagedWebhooks();
    const webhook = webhooks.find((w: any) => w.url.includes(uuid));
    return webhook?.secret || null;
  } catch (error) {
    console.error('Error getting webhook secret:', error);
    return null;
  }
}
