import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

export function createOrderRoutes() {
  const app = new Hono<{ Bindings: Env }>();

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
