import { Hono } from 'hono';
import { createStorage } from '../storage';
import type { Env } from '../index';

export function createOrderRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/:email', async (c) => {
    try {
      const storage = createStorage(c.env.DATABASE_URL);
      const orders = await storage.getOrdersByEmail(c.req.param('email'));
      return c.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }
  });

  return app;
}
