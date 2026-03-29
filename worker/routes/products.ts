import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

const defaultProducts = [
  {
    id: "firestick-hd",
    name: "StreamStick Starter Kit",
    price: 12500,
    description: "Entry-level Fire Stick bundle with Reloaded Fire TV, instant credentials, educational tutorial, 1-year included access, and 24/7 support. No dead apps or Kodi rebuilds.",
    imageUrl: "",
    category: "firestick",
    shadowProductId: "prod_TYEEobMjXf5B3d",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "firestick-4k",
    name: "StreamStick 4K Kit",
    price: 13500,
    description: "Best-value Fire Stick 4K bundle with Reloaded Fire TV, instant credentials, tutorial video, 1-year included access, and 24/7 support for a smoother all-in-one setup.",
    imageUrl: "",
    category: "firestick",
    shadowProductId: "prod_TYEEFruD8obUE7",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "firestick-4k-max",
    name: "StreamStick Max Kit",
    price: 14500,
    description: "Premium Fire Stick 4K Max bundle with Reloaded Fire TV, instant credentials, educational tutorial, 1-year included access, and priority 24/7 support.",
    imageUrl: "",
    category: "firestick",
    shadowProductId: "prod_TYEEeLmZMqrUxh",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function createProductRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/', async (c) => {
    try {
      const storage = getStorage(c.env);
      const products = await storage.getRealProducts();
      if (products && products.length > 0) {
        return c.json({ data: products });
      }
      return c.json({ data: defaultProducts });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return c.json({ data: defaultProducts });
    }
  });

  app.get('/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
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
