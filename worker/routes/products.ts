import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

const defaultProducts = [
  {
    id: "firestick-hd",
    name: "StreamStick Starter Kit",
    price: 13000,
    description: "Get fully loaded in just 10 minutes! Your Fire Stick arrives ready - simply plug in, enter your credentials (sent instantly after purchase), and follow our quick setup video.",
    imageUrl: "",
    category: "firestick",
    shadowProductId: "prod_TYEEobMjXf5B3d",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "firestick-4k",
    name: "StreamStick 4K Kit",
    price: 14000,
    description: "Best-selling Fire Stick - get fully loaded in 10 minutes! Plug in, enter your instant credentials, follow our setup video, and you're streaming in 4K with Dolby Vision.",
    imageUrl: "",
    category: "firestick",
    shadowProductId: "prod_TYEEFruD8obUE7",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "firestick-4k-max",
    name: "StreamStick Max Kit",
    price: 15000,
    description: "Ultimate 4K Max with Wi-Fi 6E - get fully loaded in just 10 minutes! Your device arrives ready with breathtaking 4K and Dolby Atmos sound.",
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
