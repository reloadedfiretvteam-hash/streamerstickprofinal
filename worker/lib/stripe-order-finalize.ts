import type Stripe from 'stripe';
import type { Env } from '../index';
import { sendOrderConfirmation, sendOwnerOrderNotification } from '../email';
import { ensureProvisioningJob, orderNeedsProvisioning, processProvisioningJobByOrderId } from './provisioning';
import { getStorage } from '../helpers';

export type CheckoutStorage = ReturnType<typeof getStorage>;

export function isStripePaymentConfirmed(session: Stripe.Checkout.Session | Record<string, unknown>): boolean {
  const status = String((session as any)?.payment_status || '').toLowerCase();
  return status === 'paid' || status === 'no_payment_required';
}

/**
 * Mark paid + notify + provision. Idempotent: skips duplicate customer email if credentials already sent.
 */
export async function finalizePaidOrderById(
  storage: CheckoutStorage,
  env: Env,
  orderId: string,
  source: string,
  stripeRefs?: {
    stripePaymentIntentId?: string | null;
    stripeCustomerId?: string | null;
  },
  provisioningExtras?: Record<string, unknown>,
): Promise<void> {
  const order = await storage.getOrder(orderId);
  if (!order) return;

  const wasAlreadyPaid = order.status === 'paid';

  if (!wasAlreadyPaid) {
    await storage.updateOrder(order.id, {
      status: 'paid',
      stripePaymentIntentId: stripeRefs?.stripePaymentIntentId ?? order.stripePaymentIntentId ?? null,
      stripeCustomerId: stripeRefs?.stripeCustomerId ?? order.stripeCustomerId ?? null,
    } as any);
  } else if (stripeRefs?.stripePaymentIntentId || stripeRefs?.stripeCustomerId) {
    await storage.updateOrder(order.id, {
      stripePaymentIntentId: stripeRefs?.stripePaymentIntentId ?? order.stripePaymentIntentId ?? null,
      stripeCustomerId: stripeRefs?.stripeCustomerId ?? order.stripeCustomerId ?? null,
    } as any);
  }

  const updated = (await storage.getOrder(order.id)) || order;

  // Only notify on the first transition to paid so parallel webhooks + /success recovery do not duplicate emails.
  if (!wasAlreadyPaid) {
    try {
      await sendOwnerOrderNotification(updated, env);
    } catch (e: any) {
      console.error(`[EMAIL] Owner notification failed (${source}) for order ${updated.id}: ${e?.message || e}`);
    }

    if (updated.customerEmail) {
      try {
        await sendOrderConfirmation(updated, env);
      } catch (e: any) {
        console.error(`[EMAIL] Order confirmation failed (${source}) for order ${updated.id}: ${e?.message || e}`);
      }
    } else {
      console.error(`[EMAIL] Skipping customer confirmation (${source}) for order ${updated.id}: no email`);
    }
  }

  if (orderNeedsProvisioning(updated) && !updated.credentialsSent) {
    try {
      await ensureProvisioningJob(storage, updated, {
        source,
        ...provisioningExtras,
      });
      await processProvisioningJobByOrderId(env, updated.id);
    } catch (e: any) {
      console.error(`[PROVISIONING] Failed (${source}) for ${updated.id}: ${e?.message || e}`);
    }
  }
}

/**
 * Shared path for Checkout Session objects: update order row from session, then finalize only when Stripe confirms payment.
 * Used by Stripe webhooks and by the browser success-page recovery endpoint.
 */
export async function processCheckoutSessionCompletion(
  session: Stripe.Checkout.Session,
  storage: CheckoutStorage,
  env: Env,
  source: string,
): Promise<void> {
  console.log(`[CHECKOUT] Session ${source}: ${session.id}`);
  console.log(`[CHECKOUT] payment_status: ${session.payment_status}`);

  const order = await storage.getOrderByCheckoutSession(session.id);
  if (!order) {
    console.error(`[CHECKOUT] No order for session ${session.id}`);
    return;
  }

  const confirmed = isStripePaymentConfirmed(session);
  const updateData: Record<string, unknown> = {
    stripePaymentIntentId: session.payment_intent,
    stripeCustomerId: session.customer,
  };

  if (!confirmed) {
    updateData.status = 'pending';
  }

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
  }

  const customerEmail = order.customerEmail || session.customer_details?.email;
  if (!customerEmail) {
    console.error(`[EMAIL] No customer email for order ${order.id}; applying session update only`);
    await storage.updateOrder(order.id, updateData as any);
    return;
  }

  if (!order.customerEmail && customerEmail) {
    updateData.customerEmail = customerEmail;
  }

  await storage.updateOrder(order.id, updateData as any);

  if (!confirmed) {
    console.log(`[CHECKOUT] Session ${session.id} not paid yet; order ${order.id} stays pending`);
    return;
  }

  await finalizePaidOrderById(
    storage,
    env,
    order.id,
    source,
    {
      stripePaymentIntentId: session.payment_intent as string | null,
      stripeCustomerId: session.customer as string | null,
    },
    { sessionId: session.id },
  );
}
