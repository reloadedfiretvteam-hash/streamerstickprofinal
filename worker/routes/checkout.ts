import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { checkoutRequestSchema } from '../../shared/schema';
import type { Env } from '../index';

export function createCheckoutRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', async (c) => {
    try {
      console.log("Checkout: Starting checkout process");
      const storage = getStorage(c.env);
      const body = await c.req.json();
      console.log("Checkout: Received body:", JSON.stringify(body));
      
      const parseResult = checkoutRequestSchema.safeParse(body);
      if (!parseResult.success) {
        console.log("Checkout: Validation failed:", parseResult.error.message);
        return c.json({ error: parseResult.error.message }, 400);
      }
      
      const { items, customerEmail, customerName, customerPhone, customerMessage, isRenewal, existingUsername, countryPreference } = parseResult.data;
      console.log("Checkout: Parsed data - items:", items.length, "email:", customerEmail);

      let existingCustomer: Awaited<ReturnType<typeof storage.getCustomerByUsername>> | null = null;
      if (isRenewal && existingUsername) {
        existingCustomer = await storage.getCustomerByUsername(existingUsername) ?? null;
        if (!existingCustomer) {
          return c.json({ 
            error: "Username not found. Please check your username or select 'New Account' instead." 
          }, 404);
        }
      }

      const productsWithQuantity: Array<{ product: any; quantity: number }> = [];
      
      for (const item of items) {
        console.log("Checkout: Looking up product:", item.productId);
        const product = await storage.getRealProduct(item.productId);
        if (!product) {
          console.log("Checkout: Product not found:", item.productId);
          return c.json({ error: `Product not found: ${item.productId}` }, 404);
        }
        if (!product.shadowPriceId) {
          console.log("Checkout: Product not configured:", item.productId);
          return c.json({ error: `Product not configured for checkout: ${item.productId}` }, 400);
        }
        console.log("Checkout: Found product:", product.name, "shadowPriceId:", product.shadowPriceId);
        productsWithQuantity.push({ product, quantity: item.quantity });
      }

      console.log("Checkout: Creating Stripe session");
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      const baseUrl = new URL(c.req.url).origin;

      const lineItems = productsWithQuantity.map(({ product, quantity }) => ({
        price: product.shadowPriceId,
        quantity,
      }));

      const realProductIds = productsWithQuantity.map(p => p.product.id).join(',');
      const realProductNames = productsWithQuantity.map(p => p.product.name).join(', ');
      const shadowProductIds = productsWithQuantity.map(p => p.product.shadowProductId || '').join(',');

      const hasPhysicalProduct = productsWithQuantity.some(({ product }) => {
        const name = (product.name || '').toLowerCase();
        const id = (product.id || '').toLowerCase();
        return name.includes('fire') || name.includes('stick') || name.includes('firestick') ||
               name.includes('onn') || name.includes('android') || name.includes('device') ||
               id.includes('firestick') || id.includes('android-onn');
      });

      const sessionConfig: any = {
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        customer_email: customerEmail,
        metadata: {
          realProductIds,
          realProductNames,
          shadowProductIds,
          isRenewal: isRenewal ? 'true' : 'false',
          existingUsername: existingUsername || '',
          existingCustomerId: existingCustomer?.id || '',
        },
      };

      if (hasPhysicalProduct) {
        sessionConfig.shipping_address_collection = {
          allowed_countries: ['US', 'CA'],
        };
        sessionConfig.phone_number_collection = {
          enabled: true,
        };
      }

      console.log("Checkout: Calling stripe.checkout.sessions.create with lineItems:", JSON.stringify(lineItems));
      const session = await stripe.checkout.sessions.create(sessionConfig);
      console.log("Checkout: Stripe session created:", session.id);

      const totalAmount = productsWithQuantity.reduce(
        (sum, { product, quantity }) => sum + product.price * quantity, 
        0
      );

      console.log("Checkout: Creating order in database");
      const order = await storage.createOrder({
        customerEmail,
        customerName: customerName || null,
        stripeCheckoutSessionId: session.id,
        shadowProductId: shadowProductIds,
        shadowPriceId: productsWithQuantity.map(p => p.product.shadowPriceId).join(','),
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
      console.log("Checkout: Order created:", order.id);

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
      if (order.status !== 'paid') {
        // Try to verify with Stripe if we have a session
        if (sessionId) {
          const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
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

      // Send order confirmation
      try {
        console.log(`[EMAIL] Attempting to send order confirmation for order ${order.id}`);
        console.log(`[EMAIL] Order details:`, {
          id: order.id,
          email: order.customerEmail,
          amount: order.amount,
          productName: order.realProductName,
          hasResendKey: !!c.env.RESEND_API_KEY,
        });
        await sendOrderConfirmation(order, c.env);
        results.orderConfirmation = true;
        console.log(`[EMAIL] ✅ Order confirmation sent to ${order.customerEmail}`);
      } catch (error: any) {
        results.errors.push(`Order confirmation: ${error.message}`);
        console.error(`[EMAIL] ❌ Failed to send order confirmation:`, error);
        console.error(`[EMAIL] Error stack:`, error.stack);
      }

      // Send owner notification
      try {
        console.log(`[EMAIL] Attempting to send owner notification for order ${order.id}`);
        await sendOwnerOrderNotification(order, c.env);
        results.ownerNotification = true;
        console.log(`[EMAIL] ✅ Owner notification sent`);
      } catch (error: any) {
        results.errors.push(`Owner notification: ${error.message}`);
        console.error(`[EMAIL] ❌ Failed to send owner notification:`, error);
        console.error(`[EMAIL] Error stack:`, error.stack);
      }

      // Send credentials if not already sent
      if (!order.credentialsSent) {
        try {
          console.log(`[EMAIL] Attempting to send credentials for order ${order.id}`);
          await sendCredentialsEmail(order, c.env, storage);
          results.credentials = true;
          console.log(`[EMAIL] ✅ Credentials sent to ${order.customerEmail}`);
        } catch (error: any) {
          results.errors.push(`Credentials: ${error.message}`);
          console.error(`[EMAIL] ❌ Failed to send credentials:`, error);
          console.error(`[EMAIL] Error stack:`, error.stack);
        }
      } else {
        results.credentials = true; // Already sent
        console.log(`[EMAIL] Credentials already sent for order ${order.id}`);
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
