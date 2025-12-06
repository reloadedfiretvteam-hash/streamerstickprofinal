import { Hono } from 'hono';
import { createStorage } from '../storage';
import type { Env } from '../index';

export function createProductRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/', async (c) => {
    try {
      const storage = createStorage(c.env.DATABASE_URL);
      const products = await storage.getRealProducts();
      return c.json({ data: products });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return c.json({ error: "Failed to fetch products" }, 500);
    }
  });

  app.get('/:id', async (c) => {
    try {
      const storage = createStorage(c.env.DATABASE_URL);
      const product = await storage.getRealProduct(c.req.param('id'));
      if (!product) {
        return c.json({ error: "Product not found" }, 404);
      }
      return c.json({ data: product });
    } catch (error: any) {
      console.error("Error fetching product:", error);
      return c.json({ error: "Failed to fetch product" }, 500);
    }
  });

  return app;
}
