import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

export function createOrderRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  // Public order tracking endpoint — accepts purchase code (PC-XXXXX) or email
  app.get('/track', async (c) => {
    const q = (c.req.query('q') || '').trim();
    if (!q) return c.json({ error: 'Please provide a purchase code or email address.' }, 400);

    try {
      const storage = getStorage(c.env);
      let order = null;

      if (q.toUpperCase().startsWith('PC-')) {
        const orders = await storage.getOrdersByEmail(q).catch(() => []);
        // Try to find by purchase code across all orders (fallback: email search won't work here)
        // Use a direct DB query if available
        const allByCode = await (storage as any).getOrderByPurchaseCode?.(q.toUpperCase()).catch(() => null);
        order = allByCode ?? null;
      } else if (q.includes('@')) {
        const orders = await storage.getOrdersByEmail(q).catch(() => []);
        order = orders && orders.length > 0 ? orders[0] : null;
      } else {
        return c.json({ error: 'Please enter a valid purchase code (PC-XXXXX) or email address.' }, 400);
      }

      if (!order) return c.json({ error: 'Order not found. Check your purchase code or email.' }, 404);

      // Return safe subset — never expose full credentials unless order is completed
      const safe = {
        id: order.id,
        purchaseCode: order.purchaseCode,
        status: order.status,
        productName: order.productName || order.realProductName || 'IPTV Service',
        amount: order.amount,
        customerEmail: maskEmail(order.customerEmail || ''),
        createdAt: order.createdAt,
        generatedUsername: order.status === 'completed' ? order.generatedUsername : undefined,
        generatedPassword: order.status === 'completed' ? order.generatedPassword : undefined,
        serviceUrl: order.status === 'completed' ? (order.serviceUrl || 'http://ky-tv.cc') : undefined,
        setupVideoUrl: order.status === 'completed' ? order.setupVideoUrl : undefined,
      };

      return c.json({ data: safe });
    } catch (error: any) {
      console.error('Error tracking order:', error?.message || error);
      return c.json({ error: 'Unable to retrieve order. Please try again.' }, 500);
    }
  });

  app.get('/:email', async (c) => {
    if ((c.env.NODE_ENV || '').toLowerCase() === 'production') {
      return c.json({ error: "Not found" }, 404);
    }

    try {
      const storage = getStorage(c.env);
      const orders = await storage.getOrdersByEmail(c.req.param('email'));
      return c.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }
  });

  return app;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const masked = user.length <= 2 ? user[0] + '***' : user[0] + '***' + user[user.length - 1];
  return `${masked}@${domain}`;
}
