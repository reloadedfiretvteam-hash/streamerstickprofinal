import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { checkoutRequestSchema, effectiveRealProductChargeCents } from '../../shared/schema';
import type { Env } from '../index';

const isProduction = (env: Env) => (env.NODE_ENV || '').toLowerCase() === 'production';

const maskEmail = (email?: string | null): string => {
  if (!email || !email.includes('@')) return 'unknown';
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'unknown';
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
};

const DEFAULT_PAYMENT_METHODS: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
  'card',
  'link',
  'cashapp',
  'klarna',
  'affirm',
];

function extractInvalidPaymentMethod(error: unknown): string | null {
  const message = String((error as any)?.message || '').toLowerCase();
  if (!message.includes('payment method type') || !message.includes('invalid')) return null;
  const match = message.match(/provided:\s*([a-z0-9_]+)/i);
  return match?.[1]?.toLowerCase() || null;
}

export function createCheckoutRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', async (c) => {
    try {
      const debugLog = (...args: unknown[]) => {
        if (!isProduction(c.env)) console.log(...args);
      };
      debugLog("Checkout: Starting checkout process");
      const storage = getStorage(c.env);
      const body = await c.req.json();
      debugLog("Checkout: Received checkout payload");
      
      const parseResult = checkoutRequestSchema.safeParse(body);
      if (!parseResult.success) {
        debugLog("Checkout: Validation failed:", parseResult.error.message);
        return c.json({ error: parseResult.error.message }, 400);
      }
      
      const { items, customerEmail, customerName, customerPhone, customerMessage, isRenewal, existingUsername, countryPreference } = parseResult.data;
      debugLog("Checkout: Parsed data - items:", items.length, "email:", maskEmail(customerEmail));

      let existingCustomer: Awaited<ReturnType<typeof storage.getCustomerByUsername>> | null = null;
      if (isRenewal && existingUsername) {
        existingCustomer = await storage.getCustomerByUsername(existingUsername) ?? null;
        if (!existingCustomer) {
          return c.json({ 
            error: "Username not found. Please check your username or select 'New Account' instead." 
          }, 404);
        }
      }

      const activePromo = await storage.getActiveSitePromotion();
      type ResolvedLine = { product: any; quantity: number; stripePriceId: string; unitAmountCents: number };
      const productsWithQuantity: ResolvedLine[] = [];

      for (const item of items) {
        debugLog("Checkout: Looking up product:", item.productId);
        const product = await storage.getRealProduct(item.productId);
        if (!product) {
          debugLog("Checkout: Product not found:", item.productId);
          return c.json({ error: `Product not found: ${item.productId}` }, 404);
        }

        const wantsPromo = item.applySitePromotion === true;
        let stripePriceId = product.shadowPriceId;
        let unitAmountCents = effectiveRealProductChargeCents({
          price: product.price,
          salePrice: product.salePrice ?? null,
        });

        if (wantsPromo) {
          if (!activePromo || activePromo.realProductId !== product.id) {
            return c.json({
              error: "This promotion is not active or does not apply to this product. Remove the promotional item or refresh the page.",
            }, 400);
          }
          stripePriceId = activePromo.promoShadowPriceId;
          unitAmountCents = activePromo.promoAmountCents;
        }

        if (!stripePriceId) {
          debugLog("Checkout: Product not configured:", item.productId);
          return c.json({ error: `Product not configured for checkout: ${item.productId}` }, 400);
        }

        debugLog("Checkout: Resolved line:", product.name, "priceId:", stripePriceId, "promo:", wantsPromo && !!activePromo);
        productsWithQuantity.push({ product, quantity: item.quantity, stripePriceId, unitAmountCents });
      }

      const sitePromotionApplied = productsWithQuantity.some(
        (p, idx) => items[idx]?.applySitePromotion === true && activePromo && p.product.id === activePromo.realProductId
      );

      debugLog("Checkout: Creating Stripe session");
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      const baseUrl = new URL(c.req.url).origin;

      const lineItems = productsWithQuantity.map(({ stripePriceId, quantity }) => ({
        price: stripePriceId,
        quantity,
      }));

      const realProductIds = productsWithQuantity.map(p => p.product.id).join(',');
      const realProductNames = productsWithQuantity.map(p => p.product.name).join(', ');
      const shadowProductIds = productsWithQuantity.map(p => p.product.shadowProductId || '').join(',');

      const sessionConfig: any = {
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout`,
        customer_email: customerEmail,
        payment_method_types: [...DEFAULT_PAYMENT_METHODS],
        allow_promotion_codes: true,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
        phone_number_collection: {
          enabled: true,
        },
        metadata: {
          realProductIds,
          realProductNames,
          shadowProductIds,
          isRenewal: isRenewal ? 'true' : 'false',
          existingUsername: existingUsername || '',
          existingCustomerId: existingCustomer?.id || '',
          sitePromotionApplied: sitePromotionApplied ? 'true' : 'false',
        },
      };

      debugLog("Checkout: Calling stripe.checkout.sessions.create with lineItems:", lineItems.length);
      let session: Stripe.Checkout.Session | null = null;
      let workingMethods = [...DEFAULT_PAYMENT_METHODS];

      while (!session) {
        try {
          sessionConfig.payment_method_types = workingMethods;
          session = await stripe.checkout.sessions.create(sessionConfig);
        } catch (err: any) {
          const invalidMethod = extractInvalidPaymentMethod(err);
          // If Stripe rejects a specific method (e.g. affirm not enabled), remove it and retry.
          if (invalidMethod && workingMethods.includes(invalidMethod as any) && workingMethods.length > 2) {
            workingMethods = workingMethods.filter((m) => m !== (invalidMethod as any));
            debugLog(`Checkout: Removed unsupported payment method '${invalidMethod}', retrying with`, workingMethods);
            continue;
          }
          throw err;
        }
      }
      debugLog("Checkout: Stripe session created:", session.id);

      const totalAmount = productsWithQuantity.reduce(
        (sum, { unitAmountCents, quantity }) => sum + unitAmountCents * quantity,
        0
      );

      debugLog("Checkout: Creating order in database");
      const order = await storage.createOrder({
        customerEmail,
        customerName: customerName || null,
        stripeCheckoutSessionId: session.id,
        shadowProductId: shadowProductIds,
        shadowPriceId: productsWithQuantity.map(p => p.stripePriceId).join(','),
        realProductId: realProductIds,
        realProductName: realProductNames,
        amount: totalAmount,
        status: 'pending',
        credentialsSent: false,
        isRenewal: isRenewal || false,
        existingUsername: existingUsername || null,
        customerId: existingCustomer?.id || null,
        countryPreference: countryPreference || null,
      });
      debugLog("Checkout: Order created:", order.id);

      return c.json({ 
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error.message || error);
      console.error("Error stack:", error.stack);
      return c.json({ error: "Failed to create checkout session", details: error.message }, 500);
    }
  });

  app.get('/session/:sessionId', async (c) => {
    try {
      const storage = getStorage(c.env);
      const order = await storage.getOrderByCheckoutSession(c.req.param('sessionId'));
      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }
      
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(c.req.param('sessionId'));
      
      return c.json({ 
        order,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
      });
    } catch (error: any) {
      console.error("Error fetching checkout session:", error);
      return c.json({ error: "Failed to fetch checkout session" }, 500);
    }
  });

  // Direct email endpoint - separate from webhooks (like free trials)
  app.post('/send-emails', async (c) => {
    try {
      const debugLog = (...args: unknown[]) => {
        if (!isProduction(c.env)) console.log(...args);
      };
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { sessionId, orderId } = body;

      let order;
      if (sessionId) {
        order = await storage.getOrderByCheckoutSession(sessionId);
      } else if (orderId) {
        order = await storage.getOrder(orderId);
      } else {
        return c.json({ error: "sessionId or orderId required" }, 400);
      }

      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      // Verify payment was successful
      let stripeSession: Stripe.Checkout.Session | null = null;
      if (order.status !== 'paid') {
        // Try to verify with Stripe if we have a session
        if (sessionId) {
          const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          stripeSession = session;
          if (session.payment_status !== 'paid') {
            return c.json({ error: "Payment not completed" }, 400);
          }
          // Update order status if needed
          if (order.status !== 'paid') {
            await storage.updateOrder(order.id, { status: 'paid' });
            order = await storage.getOrder(order.id);
          }
        } else {
          return c.json({ error: "Payment not completed" }, 400);
        }
      }

      // Always hydrate shipping details from Stripe session before owner/customer emails.
      // This prevents missing fulfillment address when webhook processing is delayed.
      if (sessionId) {
        try {
          if (!stripeSession) {
            const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
            stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
          }
          const shipping = stripeSession.shipping_details;
          if (shipping) {
            const line1 = shipping.address?.line1 || '';
            const line2 = shipping.address?.line2 || '';
            const shippingStreet = line2 ? `${line1}, ${line2}` : line1 || null;
            await storage.updateOrder(order.id, {
              shippingName: shipping.name || null,
              shippingPhone: stripeSession.customer_details?.phone || null,
              shippingStreet,
              shippingCity: shipping.address?.city || null,
              shippingState: shipping.address?.state || null,
              shippingZip: shipping.address?.postal_code || null,
              shippingCountry: shipping.address?.country || null,
            });
            order = (await storage.getOrder(order.id)) || order;
          }
        } catch (error: any) {
          console.warn(`[CHECKOUT] Could not hydrate shipping details from Stripe session ${sessionId}: ${error?.message || error}`);
        }
      }

      // Verify order has required fields
      if (!order.customerEmail) {
        console.error(`[EMAIL] Order ${order.id} missing customerEmail`);
        return c.json({ error: "Order missing customer email" }, 400);
      }

      // Import email functions
      const { sendOrderConfirmation, sendCredentialsEmail, sendOwnerOrderNotification } = await import('../email');

      const results = {
        orderConfirmation: false,
        credentials: false,
        ownerNotification: false,
        errors: [] as string[],
      };

      // If credentials were already sent, treat this call as idempotent success.
      // This avoids duplicate confirmation/owner emails when success page retries.
      if (order.credentialsSent) {
        return c.json({
          success: true,
          results: {
            orderConfirmation: true,
            credentials: true,
            ownerNotification: true,
            errors: [] as string[],
          },
          message: "Emails were already sent previously",
        });
      }

      // Send order confirmation
      try {
        debugLog(`[EMAIL] Attempting to send order confirmation for order ${order.id}`);
        debugLog(`[EMAIL] Order details:`, {
          id: order.id,
          email: maskEmail(order.customerEmail),
          amount: order.amount,
          productName: order.realProductName,
          hasResendKey: !!c.env.RESEND_API_KEY,
        });
        await sendOrderConfirmation(order, c.env);
        results.orderConfirmation = true;
        debugLog(`[EMAIL] ✅ Order confirmation sent to ${maskEmail(order.customerEmail)}`);
      } catch (error: any) {
        results.errors.push(`Order confirmation: ${error.message}`);
        console.error(`[EMAIL] ❌ Failed to send order confirmation:`, error);
        console.error(`[EMAIL] Error stack:`, error.stack);
      }

      // Send owner notification
      try {
        debugLog(`[EMAIL] Attempting to send owner notification for order ${order.id}`);
        await sendOwnerOrderNotification(order, c.env);
        results.ownerNotification = true;
        debugLog(`[EMAIL] ✅ Owner notification sent`);
      } catch (error: any) {
        results.errors.push(`Owner notification: ${error.message}`);
        console.error(`[EMAIL] ❌ Failed to send owner notification:`, error);
        console.error(`[EMAIL] Error stack:`, error.stack);
      }

      // Send credentials if not already sent
      if (!order.credentialsSent) {
        try {
          debugLog(`[EMAIL] Attempting to send credentials for order ${order.id}`);
          await sendCredentialsEmail(order, c.env, storage);
          results.credentials = true;
          debugLog(`[EMAIL] ✅ Credentials sent to ${maskEmail(order.customerEmail)}`);
        } catch (error: any) {
          results.errors.push(`Credentials: ${error.message}`);
          console.error(`[EMAIL] ❌ Failed to send credentials:`, error);
          console.error(`[EMAIL] Error stack:`, error.stack);
        }
      } else {
        results.credentials = true; // Already sent
        debugLog(`[EMAIL] Credentials already sent for order ${order.id}`);
      }

      // Create email campaign for customer
      try {
        const campaignResponse = await fetch(`${c.req.url.split('/api/checkout')[0]}/api/email-campaigns/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            campaignType: 'purchase',
            orderId: order.id,
          }),
        });
        if (campaignResponse.ok) {
          console.log(`[EMAIL_CAMPAIGN] ✅ Campaign created for ${order.customerEmail}`);
        }
      } catch (error: any) {
        console.warn(`[EMAIL_CAMPAIGN] Failed to create campaign: ${error.message}`);
        // Don't fail the request if campaign creation fails
      }

      return c.json({ 
        success: true,
        results,
        message: "Emails sent successfully"
      });
    } catch (error: any) {
      console.error("Error sending emails:", error);
      return c.json({ error: "Failed to send emails", details: error.message }, 500);
    }
  });

  return app;
}
