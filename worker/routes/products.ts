import { Hono } from 'hono';
import { createStorage } from '../storage';
import type { Env } from '../index';

export function createProductRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/', async (c) => {
    try {
      if (!c.env.VITE_SUPABASE_URL || !c.env.SUPABASE_SERVICE_KEY) {
        return c.json({ error: "Supabase not configured" }, 500);
      }
      const storage = createStorage({
        supabaseUrl: c.env.VITE_SUPABASE_URL,
        supabaseKey: c.env.SUPABASE_SERVICE_KEY
      });
      const products = await storage.getRealProducts();
      return c.json({ data: products });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return c.json({ 
        error: "Failed to fetch products", 
        details: error.message,
        supabaseConfigured: !!(c.env.VITE_SUPABASE_URL && c.env.SUPABASE_SERVICE_KEY)
      }, 500);
    }
  });

  app.get('/:id', async (c) => {
    try {
      const storage = createStorage({
        supabaseUrl: c.env.VITE_SUPABASE_URL,
        supabaseKey: c.env.SUPABASE_SERVICE_KEY
      });
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
