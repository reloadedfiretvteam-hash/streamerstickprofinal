/**
 * Dedicated Stripe Payment Webhook Handler
 * 
 * This handler ONLY processes paid purchases (not free trials).
 * It sends confirmation emails to customers and notification emails to the owner via Resend.
 * 
 * Key features:
 * - Uses Stripe metadata to get product info (not page URLs - cloaked pages don't matter)
 * - Separates paid purchases from free trials
 * - Sends emails via Resend
 */

import Stripe from 'stripe';
import { getUncachableResendClient } from './resendClient';
import { getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'reloadedfiretvteam@gmail.com';

/**
 * Check if a checkout session is for a free trial
 * Uses metadata to determine, not page URLs
 */
function isFreeTrialSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.trial === 'true' || 
         session.metadata?.is_trial === 'true' ||
         session.amount_total === 0 ||
         session.payment_status === 'unpaid';
}

/**
 * Get product name from Stripe metadata or session data
 * This ensures cloaked pages don't affect the webhook logic
 */
function getProductName(session: Stripe.Checkout.Session): string {
  // Priority: metadata > line items > default
  if (session.metadata?.product_name) {
    return session.metadata.product_name;
  }
  
  if (session.metadata?.realProductName) {
    return session.metadata.realProductName;
  }
  
  // Fallback to line items description
  if (session.line_items?.data?.[0]?.description) {
    return session.line_items.data[0].description;
  }
  
  return 'Your purchase';
}

/**
 * Handle paid checkout session completion
 * Sends confirmation email to customer and notification to owner
 */
export async function handlePaidCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[PAYMENT WEBHOOK] Processing paid checkout session: ${session.id}`);
  
  // Skip free trials - they have their own handler
  if (isFreeTrialSession(session)) {
    console.log(`[PAYMENT WEBHOOK] Skipping free trial session: ${session.id}`);
    return;
  }
  
  // Only process paid sessions
  if (session.payment_status !== 'paid') {
    console.log(`[PAYMENT WEBHOOK] Session not paid yet: ${session.id}, status: ${session.payment_status}`);
    return;
  }
  
  const customerEmail = session.customer_details?.email || session.customer_email;
  if (!customerEmail) {
    console.warn(`[PAYMENT WEBHOOK] No customer email on session: ${session.id}`);
    return;
  }
  
  const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
  const currency = (session.currency || 'usd').toUpperCase();
  const productName = getProductName(session);
  const customerName = session.customer_details?.name || session.metadata?.customer_name || 'Valued Customer';
  
  const { client, fromEmail } = await getUncachableResendClient();
  
  try {
    // Email to customer
    await client.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Order Confirmation - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Thank You for Your Purchase!</h1>
          
          <p>Hi ${customerName},</p>
          
          <p>Your order has been confirmed and payment has been received.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333;">Order Details</h2>
            <p><strong>Product:</strong> ${productName}</p>
            ${amountTotal > 0 ? `<p><strong>Total:</strong> $${amountTotal.toFixed(2)} ${currency}</p>` : ''}
            <p><strong>Order ID:</strong> ${session.id}</p>
            ${session.metadata?.order_id ? `<p><strong>Internal Order ID:</strong> ${session.metadata.order_id}</p>` : ''}
          </div>
          
          <p>You will receive your login credentials and setup instructions in a separate email shortly.</p>
          
          <p>If you have any questions, just reply to this email.</p>
          
          <p>Best regards,<br>StreamStickPro Team</p>
        </div>
      `,
    });
    
    console.log(`[PAYMENT WEBHOOK] Customer confirmation email sent to ${customerEmail}`);
    
    // Email to owner
    await client.emails.send({
      from: fromEmail,
      to: OWNER_EMAIL,
      subject: `💰 New Paid Order - $${amountTotal.toFixed(2)} - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">💰 New Paid Order!</h1>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b;">
            <h2 style="margin-top: 0; color: #92400e;">Order Summary</h2>
            <p style="font-size: 24px; color: #16a34a; font-weight: bold; margin: 10px 0;">$${amountTotal.toFixed(2)} ${currency}</p>
          </div>
          
          <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #7c3aed;">Customer Details</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Stripe Session ID:</strong> ${session.id}</p>
            ${session.payment_intent ? `<p><strong>Payment Intent ID:</strong> ${session.payment_intent}</p>` : ''}
            ${session.metadata?.order_id ? `<p><strong>Internal Order ID:</strong> ${session.metadata.order_id}</p>` : ''}
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #2563eb;">Product Information</h2>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Status:</strong> Paid</p>
            ${session.metadata?.realProductId ? `<p><strong>Product ID:</strong> ${session.metadata.realProductId}</p>` : ''}
          </div>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <strong>📧 Email Status:</strong> Confirmation email sent to customer. Credentials email will be sent separately.
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
            StreamStickPro Payment Webhook System
          </p>
        </div>
      `,
    });
    
    console.log(`[PAYMENT WEBHOOK] Owner notification sent to ${OWNER_EMAIL}`);
    
    // Update order in database if it exists
    try {
      const order = await storage.getOrderByCheckoutSession(session.id);
      if (order) {
        await storage.updateOrder(order.id, {
          status: 'paid',
          stripePaymentIntentId: session.payment_intent as string || null,
          stripeCustomerId: session.customer as string || null,
        });
        console.log(`[PAYMENT WEBHOOK] Order ${order.id} updated to paid status`);
      }
    } catch (error) {
      console.error(`[PAYMENT WEBHOOK] Error updating order:`, error);
      // Don't fail the webhook if order update fails
    }
    
  } catch (error: any) {
    console.error(`[PAYMENT WEBHOOK] Error sending emails:`, error.message);
    throw error; // Re-throw to let webhook handler know it failed
  }
}

/**
 * Handle payment intent succeeded
 * Alternative handler for direct PaymentIntent usage
 */
export async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  console.log(`[PAYMENT WEBHOOK] Processing payment intent: ${pi.id}`);
  
  const amount = pi.amount_received / 100;
  const currency = pi.currency.toUpperCase();
  const customerEmail = 
    (pi.charges.data[0]?.billing_details?.email as string | undefined) ||
    (pi.receipt_email as string | undefined);
  
  if (!customerEmail) {
    console.warn(`[PAYMENT WEBHOOK] No customer email on payment intent: ${pi.id}`);
    return;
  }
  
  const productName = pi.metadata?.product_name || 
                     pi.metadata?.realProductName || 
                     'Your purchase';
  const customerName = pi.metadata?.customer_name || 'Valued Customer';
  
  const { client, fromEmail } = await getUncachableResendClient();
  
  try {
    // Email to customer
    await client.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Payment Confirmation - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Thank You, Payment Received!</h1>
          
          <p>Hi ${customerName},</p>
          
          <p>We have successfully received your payment.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333;">Payment Details</h2>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)} ${currency}</p>
            <p><strong>Payment ID:</strong> ${pi.id}</p>
          </div>
          
          <p>You will receive your order confirmation and credentials shortly.</p>
          
          <p>If you have any questions, just reply to this email.</p>
          
          <p>Best regards,<br>StreamStickPro Team</p>
        </div>
      `,
    });
    
    console.log(`[PAYMENT WEBHOOK] Customer confirmation email sent to ${customerEmail}`);
    
    // Email to owner
    await client.emails.send({
      from: fromEmail,
      to: OWNER_EMAIL,
      subject: `💰 New Stripe Payment - $${amount.toFixed(2)} - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">💰 New Payment Received!</h1>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b;">
            <h2 style="margin-top: 0; color: #92400e;">Payment Summary</h2>
            <p style="font-size: 24px; color: #16a34a; font-weight: bold; margin: 10px 0;">$${amount.toFixed(2)} ${currency}</p>
          </div>
          
          <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #7c3aed;">Customer Details</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Payment Intent ID:</strong> ${pi.id}</p>
            ${pi.metadata?.order_id ? `<p><strong>Internal Order ID:</strong> ${pi.metadata.order_id}</p>` : ''}
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #2563eb;">Product Information</h2>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Status:</strong> Paid</p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
            StreamStickPro Payment Webhook System
          </p>
        </div>
      `,
    });
    
    console.log(`[PAYMENT WEBHOOK] Owner notification sent to ${OWNER_EMAIL}`);
    
    // Update order in database if it exists
    try {
      const order = await storage.getOrderByPaymentIntent(pi.id);
      if (order) {
        await storage.updateOrder(order.id, {
          status: 'paid',
        });
        console.log(`[PAYMENT WEBHOOK] Order ${order.id} updated to paid status`);
      }
    } catch (error) {
      console.error(`[PAYMENT WEBHOOK] Error updating order:`, error);
      // Don't fail the webhook if order update fails
    }
    
  } catch (error: any) {
    console.error(`[PAYMENT WEBHOOK] Error sending emails:`, error.message);
    throw error;
  }
}

