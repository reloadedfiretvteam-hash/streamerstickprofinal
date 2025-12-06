import { Hono } from 'hono';
import Stripe from 'stripe';
import { createStorage } from '../storage';
import { checkoutRequestSchema } from '../../shared/schema';
import type { Env } from '../index';

export function createCheckoutRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', async (c) => {
    try {
      const storage = createStorage(c.env.DATABASE_URL);
      const body = await c.req.json();
      
      const parseResult = checkoutRequestSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({ error: parseResult.error.message }, 400);
      }
      
      const { items, customerEmail, customerName, isRenewal, existingUsername } = parseResult.data;

      let existingCustomer = null;
      if (isRenewal && existingUsername) {
        existingCustomer = await storage.getCustomerByUsername(existingUsername);
        if (!existingCustomer) {
          return c.json({ 
            error: "Username not found. Please check your username or select 'New Account' instead." 
          }, 404);
        }
      }

      const productsWithQuantity: Array<{ product: any; quantity: number }> = [];
      
      for (const item of items) {
        const product = await storage.getRealProduct(item.productId);
        if (!product) {
          return c.json({ error: `Product not found: ${item.productId}` }, 404);
        }
        if (!product.shadowPriceId) {
          return c.json({ error: `Product not configured for checkout: ${item.productId}` }, 400);
        }
        productsWithQuantity.push({ product, quantity: item.quantity });
      }

      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-04-30.acacia',
      });

      const baseUrl = new URL(c.req.url).origin;

      const lineItems = productsWithQuantity.map(({ product, quantity }) => ({
        price: product.shadowPriceId,
        quantity,
      }));

      const realProductIds = productsWithQuantity.map(p => p.product.id).join(',');
      const realProductNames = productsWithQuantity.map(p => p.product.name).join(', ');
      const shadowProductIds = productsWithQuantity.map(p => p.product.shadowProductId || '').join(',');

      const hasFireStickProduct = productsWithQuantity.some(({ product }) => {
        const name = (product.name || '').toLowerCase();
        return name.includes('fire') || name.includes('stick') || name.includes('firestick');
      });

      const sessionConfig: any = {
        payment_method_types: ['card'],
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

      if (hasFireStickProduct) {
        sessionConfig.shipping_address_collection = {
          allowed_countries: ['US', 'CA'],
        };
        sessionConfig.phone_number_collection = {
          enabled: true,
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      const totalAmount = productsWithQuantity.reduce(
        (sum, { product, quantity }) => sum + product.price * quantity, 
        0
      );

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
      });

      return c.json({ 
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      return c.json({ error: "Failed to create checkout session" }, 500);
    }
  });

  app.get('/session/:sessionId', async (c) => {
    try {
      const storage = createStorage(c.env.DATABASE_URL);
      const order = await storage.getOrderByCheckoutSession(c.req.param('sessionId'));
      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }
      
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-04-30.acacia',
      });
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

  return app;
}
