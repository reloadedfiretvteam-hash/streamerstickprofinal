import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { sendCredentialsEmail } from '../email';
import { createCustomerSchema, updateCustomerSchema } from '../../shared/schema';
import type { Env } from '../index';

export function createAdminRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/orders', async (c) => {
    try {
      const storage = getStorage(c.env);
      const orders = await storage.getAllOrders();
      return c.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }
  });

  app.get('/orders/stats', async (c) => {
    try {
      const storage = getStorage(c.env);
      const allOrders = await storage.getAllOrders();
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      const paidOrders = allOrders.filter(o => o.status === 'paid');
      const pendingOrders = allOrders.filter(o => o.status === 'pending');
      
      const ordersToday = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= today);
      const ordersThisWeek = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= weekAgo);
      const ordersThisMonth = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= monthAgo);
      
      const revenueToday = ordersToday
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueThisWeek = ordersThisWeek
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueThisMonth = ordersThisMonth
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      const firestickOrders = allOrders.filter(o => 
        o.realProductId?.includes('firestick') || o.realProductName?.toLowerCase().includes('fire stick')
      );
      const pendingFulfillments = firestickOrders.filter(o => 
        o.status === 'paid' && (!o.fulfillmentStatus || o.fulfillmentStatus === 'pending')
      );
      
      const recentOrders = allOrders
        .filter(o => o.createdAt)
        .sort((a, b) => {
          const dateA = new Date(a.createdAt!).getTime();
          const dateB = new Date(b.createdAt!).getTime();
          return dateB - dateA;
        })
        .slice(0, 10)
        .map(o => ({
          id: o.id,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          productName: o.realProductName,
          amount: o.amount,
          status: o.status,
          fulfillmentStatus: o.fulfillmentStatus,
          createdAt: o.createdAt,
        }));
      
      return c.json({
        data: {
          totalOrders: allOrders.length,
          ordersToday: ordersToday.length,
          ordersThisWeek: ordersThisWeek.length,
          ordersThisMonth: ordersThisMonth.length,
          totalRevenue,
          revenueToday,
          revenueThisWeek,
          revenueThisMonth,
          pendingFulfillments: pendingFulfillments.length,
          recentOrders,
        }
      });
    } catch (error: any) {
      console.error("Error fetching order stats:", error);
      return c.json({ error: "Failed to fetch order statistics" }, 500);
    }
  });

  app.put('/orders/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { status, credentialsSent } = body;

      const existingOrder = await storage.getOrder(c.req.param('id'));
      if (!existingOrder) {
        return c.json({ error: "Order not found" }, 404);
      }

      const order = await storage.updateOrder(c.req.param('id'), {
        status,
        credentialsSent,
      });

      return c.json({ data: order });
    } catch (error: any) {
      console.error("Error updating order:", error);
      return c.json({ error: "Failed to update order" }, 500);
    }
  });

  app.post('/orders/:id/resend-credentials', async (c) => {
    try {
      const storage = getStorage(c.env);
      const order = await storage.getOrder(c.req.param('id'));
      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      await sendCredentialsEmail(order, c.env, storage);

      return c.json({ success: true, message: "Credentials email sent" });
    } catch (error: any) {
      console.error("Error resending credentials:", error);
      return c.json({ error: "Failed to resend credentials" }, 500);
    }
  });

  app.get('/fulfillment', async (c) => {
    try {
      const storage = getStorage(c.env);
      const orders = await storage.getFireStickOrdersForFulfillment();
      return c.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching fulfillment orders:", error);
      return c.json({ error: "Failed to fetch fulfillment orders" }, 500);
    }
  });

  app.put('/fulfillment/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { fulfillmentStatus, amazonOrderId } = body;

      const existingOrder = await storage.getOrder(c.req.param('id'));
      if (!existingOrder) {
        return c.json({ error: "Order not found" }, 404);
      }

      const updates: any = {};
      if (fulfillmentStatus !== undefined) {
        updates.fulfillmentStatus = fulfillmentStatus;
      }
      if (amazonOrderId !== undefined) {
        updates.amazonOrderId = amazonOrderId;
      }

      const order = await storage.updateOrder(c.req.param('id'), updates);
      return c.json({ data: order });
    } catch (error: any) {
      console.error("Error updating fulfillment:", error);
      return c.json({ error: "Failed to update fulfillment" }, 500);
    }
  });

  app.get('/products', async (c) => {
    try {
      const storage = getStorage(c.env);
      const products = await storage.getRealProducts();
      return c.json({ data: products });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return c.json({ error: "Failed to fetch products" }, 500);
    }
  });

  app.post('/products', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { id, name, description, price, imageUrl, category, shadowProductId, shadowPriceId } = body;

      if (!id || !name || !price) {
        return c.json({ error: "ID, name, and price are required" }, 400);
      }

      const product = await storage.createRealProduct({
        id,
        name,
        description: description || null,
        price,
        imageUrl: imageUrl || null,
        category: category || null,
        shadowProductId: shadowProductId || null,
        shadowPriceId: shadowPriceId || null,
      });

      return c.json({ data: product });
    } catch (error: any) {
      console.error("Error creating product:", error);
      return c.json({ error: "Failed to create product" }, 500);
    }
  });

  app.put('/products/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { name, description, price, imageUrl, category, shadowProductId, shadowPriceId } = body;

      const existingProduct = await storage.getRealProduct(c.req.param('id'));
      if (!existingProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      const product = await storage.updateRealProduct(c.req.param('id'), {
        name,
        description,
        price,
        imageUrl,
        category,
        shadowProductId,
        shadowPriceId,
      });

      return c.json({ data: product });
    } catch (error: any) {
      console.error("Error updating product:", error);
      return c.json({ error: "Failed to update product" }, 500);
    }
  });

  app.delete('/products/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const existingProduct = await storage.getRealProduct(c.req.param('id'));
      if (!existingProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      const deleted = await storage.deleteRealProduct(c.req.param('id'));
      
      if (deleted) {
        return c.json({ success: true });
      } else {
        return c.json({ error: "Failed to delete product" }, 500);
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return c.json({ error: "Failed to delete product" }, 500);
    }
  });

  app.post('/products/:id/sync-stripe-price', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { price, shadowName } = body;

      if (!price || price <= 0) {
        return c.json({ error: "Valid price is required" }, 400);
      }

      const existingProduct = await storage.getRealProduct(c.req.param('id'));
      if (!existingProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      let shadowProductId = existingProduct.shadowProductId;
      
      if (!shadowProductId) {
        const productName = shadowName || `Service ${existingProduct.id}`;
        const stripeProduct = await stripe.products.create({
          name: productName,
          description: `Shadow product for ${existingProduct.name}`,
          metadata: {
            realProductId: existingProduct.id,
          },
        });
        shadowProductId = stripeProduct.id;
      }

      const priceInCents = Math.round(price);

      const stripePrice = await stripe.prices.create({
        product: shadowProductId,
        unit_amount: priceInCents,
        currency: 'usd',
        metadata: {
          realProductId: existingProduct.id,
        },
      });

      const updatedProduct = await storage.updateRealProduct(c.req.param('id'), {
        price: priceInCents,
        shadowProductId,
        shadowPriceId: stripePrice.id,
      });

      return c.json({ 
        data: updatedProduct,
        stripeProductId: shadowProductId,
        stripePriceId: stripePrice.id,
      });
    } catch (error: any) {
      console.error("Error syncing Stripe price:", error);
      return c.json({ error: `Failed to sync Stripe price: ${error.message}` }, 500);
    }
  });

  app.post('/products/create-with-stripe', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { id, name, description, price, imageUrl, category, shadowName } = body;

      if (!id || !name || !price) {
        return c.json({ error: "ID, name, and price are required" }, 400);
      }

      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      const productName = shadowName || `Service ${id}`;
      const stripeProduct = await stripe.products.create({
        name: productName,
        description: `Shadow product`,
        metadata: {
          realProductId: id,
        },
      });

      const priceInCents = Math.round(price);

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: priceInCents,
        currency: 'usd',
        metadata: {
          realProductId: id,
        },
      });

      const product = await storage.createRealProduct({
        id,
        name,
        description: description || null,
        price: priceInCents,
        imageUrl: imageUrl || null,
        category: category || null,
        shadowProductId: stripeProduct.id,
        shadowPriceId: stripePrice.id,
      });

      return c.json({ 
        data: product,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });
    } catch (error: any) {
      console.error("Error creating product with Stripe:", error);
      return c.json({ error: `Failed to create product: ${error.message}` }, 500);
    }
  });

  app.get('/visitors/stats', async (c) => {
    try {
      const storage = getStorage(c.env);
      const stats = await storage.getVisitorStats();
      return c.json({ data: stats });
    } catch (error: any) {
      console.error("Error fetching visitor stats:", error);
      return c.json({ error: "Failed to fetch visitor stats" }, 500);
    }
  });

  app.get('/page-edits', async (c) => {
    try {
      const storage = getStorage(c.env);
      const edits = await storage.getAllPageEdits();
      return c.json({ data: edits });
    } catch (error: any) {
      console.error("Error fetching all page edits:", error);
      return c.json({ error: "Failed to fetch page edits" }, 500);
    }
  });

  app.post('/page-edits', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { pageId, sectionId, elementId, elementType, content, imageUrl, isActive } = body;

      if (!pageId || !sectionId || !elementId || !elementType) {
        return c.json({ error: "Page ID, section ID, element ID, and element type are required" }, 400);
      }

      const edit = await storage.upsertPageEdit({
        pageId,
        sectionId,
        elementId,
        elementType,
        content: content || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      return c.json({ data: edit });
    } catch (error: any) {
      console.error("Error saving page edit:", error);
      return c.json({ error: "Failed to save page edit" }, 500);
    }
  });

  app.delete('/page-edits/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const deleted = await storage.deletePageEdit(c.req.param('id'));
      
      if (deleted) {
        return c.json({ success: true });
      } else {
        return c.json({ error: "Page edit not found" }, 404);
      }
    } catch (error: any) {
      console.error("Error deleting page edit:", error);
      return c.json({ error: "Failed to delete page edit" }, 500);
    }
  });

  app.get('/customers', async (c) => {
    try {
      const storage = getStorage(c.env);
      const search = c.req.query('search');
      let customersList;
      
      if (search && search.trim()) {
        customersList = await storage.searchCustomers(search.trim());
      } else {
        customersList = await storage.getAllCustomers();
      }
      
      return c.json({ data: customersList });
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      return c.json({ error: "Failed to fetch customers" }, 500);
    }
  });

  app.get('/customers/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const customer = await storage.getCustomer(c.req.param('id'));
      if (!customer) {
        return c.json({ error: "Customer not found" }, 404);
      }
      return c.json({ data: customer });
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      return c.json({ error: "Failed to fetch customer" }, 500);
    }
  });

  app.get('/customers/:id/orders', async (c) => {
    try {
      const storage = getStorage(c.env);
      const customer = await storage.getCustomer(c.req.param('id'));
      if (!customer) {
        return c.json({ error: "Customer not found" }, 404);
      }
      
      const customerOrders = await storage.getCustomerOrders(c.req.param('id'));
      return c.json({ data: customerOrders });
    } catch (error: any) {
      console.error("Error fetching customer orders:", error);
      return c.json({ error: "Failed to fetch customer orders" }, 500);
    }
  });

  app.post('/customers', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const parseResult = createCustomerSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({ error: parseResult.error.message }, 400);
      }

      const existingByUsername = await storage.getCustomerByUsername(parseResult.data.username);
      if (existingByUsername) {
        return c.json({ error: "A customer with this username already exists" }, 409);
      }

      const customer = await storage.createCustomer(parseResult.data);
      return c.json({ data: customer });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      return c.json({ error: "Failed to create customer" }, 500);
    }
  });

  app.put('/customers/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const parseResult = updateCustomerSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({ error: parseResult.error.message }, 400);
      }

      const existingCustomer = await storage.getCustomer(c.req.param('id'));
      if (!existingCustomer) {
        return c.json({ error: "Customer not found" }, 404);
      }

      if (parseResult.data.username && parseResult.data.username !== existingCustomer.username) {
        const conflictingCustomer = await storage.getCustomerByUsername(parseResult.data.username);
        if (conflictingCustomer) {
          return c.json({ error: "A customer with this username already exists" }, 409);
        }
      }

      const customer = await storage.updateCustomer(c.req.param('id'), parseResult.data);
      return c.json({ data: customer });
    } catch (error: any) {
      console.error("Error updating customer:", error);
      return c.json({ error: "Failed to update customer" }, 500);
    }
  });

  app.delete('/customers/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const existingCustomer = await storage.getCustomer(c.req.param('id'));
      if (!existingCustomer) {
        return c.json({ error: "Customer not found" }, 404);
      }

      const deleted = await storage.deleteCustomer(c.req.param('id'));
      
      if (deleted) {
        return c.json({ success: true });
      } else {
        return c.json({ error: "Failed to delete customer" }, 500);
      }
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      return c.json({ error: "Failed to delete customer" }, 500);
    }
  });

  app.get('/iptv-customers', async (c) => {
    try {
      const storage = getStorage(c.env);
      const iptvOrders = await storage.getIPTVOrders();
      return c.json({ data: iptvOrders });
    } catch (error: any) {
      console.error("Error fetching IPTV orders:", error);
      return c.json({ error: "Failed to fetch IPTV orders" }, 500);
    }
  });

  // Payment status dashboard - shows all payment health info
  app.get('/payment-status', async (c) => {
    try {
      const storage = getStorage(c.env);
      const allOrders = await storage.getAllOrders();
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const paidOrders = allOrders.filter(o => o.status === 'paid');
      const pendingOrders = allOrders.filter(o => o.status === 'pending');
      const failedOrders = allOrders.filter(o => o.status === 'failed');
      
      // Orders paid but credentials not sent
      const missingCredentials = paidOrders.filter(o => !o.credentialsSent);
      
      // Orders in last 7 days
      const recentOrders = allOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= weekAgo
      );
      const recentPaid = paidOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= weekAgo
      );
      
      // Revenue calculation
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      const weekRevenue = recentPaid.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      return c.json({
        data: {
          summary: {
            totalOrders: allOrders.length,
            paidOrders: paidOrders.length,
            pendingOrders: pendingOrders.length,
            failedOrders: failedOrders.length,
            missingCredentials: missingCredentials.length,
            totalRevenue: totalRevenue / 100,
            weekRevenue: weekRevenue / 100,
            recentOrdersCount: recentOrders.length,
          },
          // Orders that need attention (paid but no credentials sent)
          ordersNeedingAttention: missingCredentials.map(o => ({
            id: o.id,
            customerEmail: o.customerEmail,
            customerName: o.customerName,
            productName: o.realProductName,
            amount: (o.amount || 0) / 100,
            createdAt: o.createdAt,
            status: o.status,
            credentialsSent: o.credentialsSent,
            generatedUsername: o.generatedUsername,
          })),
          // Recent failed orders
          recentFailures: failedOrders.slice(0, 10).map(o => ({
            id: o.id,
            customerEmail: o.customerEmail,
            productName: o.realProductName,
            amount: (o.amount || 0) / 100,
            createdAt: o.createdAt,
          })),
          // Pending orders (might be abandoned checkouts)
          pendingOrdersList: pendingOrders.slice(0, 10).map(o => ({
            id: o.id,
            customerEmail: o.customerEmail,
            productName: o.realProductName,
            amount: (o.amount || 0) / 100,
            createdAt: o.createdAt,
          })),
        }
      });
    } catch (error: any) {
      console.error("Error fetching payment status:", error);
      return c.json({ error: "Failed to fetch payment status" }, 500);
    }
  });

  // Resend credentials to all orders missing them
  app.post('/fix-missing-credentials', async (c) => {
    try {
      const storage = getStorage(c.env);
      const allOrders = await storage.getAllOrders();
      const paidOrders = allOrders.filter(o => o.status === 'paid' && !o.credentialsSent);
      
      const results: Array<{ orderId: string; email: string; success: boolean; error?: string }> = [];
      
      for (const order of paidOrders) {
        try {
          await sendCredentialsEmail(order, c.env, storage);
          results.push({ orderId: order.id, email: order.customerEmail, success: true });
        } catch (error: any) {
          results.push({ orderId: order.id, email: order.customerEmail, success: false, error: error.message });
        }
      }
      
      return c.json({ 
        data: {
          processed: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        }
      });
    } catch (error: any) {
      console.error("Error fixing missing credentials:", error);
      return c.json({ error: "Failed to fix missing credentials" }, 500);
    }
  });

  return app;
}
