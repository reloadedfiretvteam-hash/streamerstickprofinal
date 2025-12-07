import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

export function createCustomerRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/lookup/:username', async (c) => {
    try {
      const storage = getStorage(c.env);
      const customer = await storage.getCustomerByUsername(c.req.param('username'));
      if (!customer) {
        return c.json({ error: "Customer not found", exists: false }, 404);
      }
      
      return c.json({ 
        exists: true,
        data: {
          id: customer.id,
          username: customer.username,
          email: customer.email,
          fullName: customer.fullName,
          status: customer.status,
          totalOrders: customer.totalOrders,
        }
      });
    } catch (error: any) {
      console.error("Error looking up customer:", error);
      return c.json({ error: "Failed to lookup customer" }, 500);
    }
  });

  return app;
}
