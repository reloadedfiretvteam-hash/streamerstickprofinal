/*
 * SERVER WEBHOOK HANDLER - Order Processing System
 * 
 * CRITICAL FIX APPLIED (2024-12-16):
 * ===================================
 * Fixed customer shipping data being lost in owner notification emails.
 * 
 * See worker/routes/webhook.ts for full documentation.
 * 
 * DUPLICATE CODE WARNING:
 * =======================
 * This is a DUPLICATE of worker/routes/webhook.ts
 * Both files must be kept in sync.
 * 
 * ARCHITECTURE NOTE:
 * ==================
 * This codebase has TWO parallel systems:
 * 1. Cloudflare Workers (worker/) - Used for production deployment
 * 2. Express Server (server/) - Used for development/testing
 * 
 * The same webhook logic exists in both:
 * - worker/routes/webhook.ts
 * - server/webhookHandlers.ts
 * 
 * Future changes must be applied to BOTH files.
 */
import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { EmailService } from './emailService';
import type { Order } from '@shared/schema';

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
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutComplete(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await WebhookHandlers.handlePaymentSucceeded(event.data.object);
        break;
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
        
        const credentials = await EmailService.generateUniqueCredentials(order);
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
        await EmailService.sendOrderConfirmation(updatedOrder);
        await EmailService.sendOwnerOrderNotification(updatedOrder);
        await EmailService.scheduleCredentialsEmail(updatedOrder.id);
      } catch (error) {
        console.error('Error sending emails:', error);
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
          await EmailService.sendOrderConfirmation(updatedOrder);
          await EmailService.sendOwnerOrderNotification(updatedOrder);
          await EmailService.scheduleCredentialsEmail(updatedOrder.id);
        } catch (error) {
          console.error('Error sending emails:', error);
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
