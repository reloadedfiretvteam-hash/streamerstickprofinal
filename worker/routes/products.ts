import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

/** Fallback when Supabase has no rows; use Admin + Stripe price IDs in production. */
const defaultProducts = [
  {
    id: 'onn-google-hd',
    name: 'ONN Full HD (1080p) Google TV Kit',
    price: 15000,
    description:
      'onn. Full HD Streaming Device with Google TV, voice remote, and guided Reloaded Fire TV setup. Includes 1-year Reloaded Fire TV plan, tutorials, shipping, and 24/7 support.',
    imageUrl: '/images/onn-full-hd-google-tv.webp',
    category: 'devices',
    shadowProductId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'onn-google-4k',
    name: 'ONN 4K Ultra HD Google TV Kit',
    price: 16000,
    description:
      'onn. 4K Streaming Device with Google TV, HDR, Dolby Audio, voice remote, and guided Reloaded Fire TV setup. Includes 1-year Reloaded Fire TV plan, tutorials, shipping, and 24/7 support.',
    imageUrl: '/images/onn-4k-google-tv.jpg',
    category: 'devices',
    shadowProductId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
      console.error('Error fetching products:', error);
      return c.json({ data: defaultProducts });
    }
  });

  app.get('/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const product = await storage.getRealProduct(c.req.param('id'));
      if (!product) {
        return c.json({ error: 'Product not found' }, 404);
      }
      return c.json({ data: product });
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return c.json({ error: 'Failed to fetch product' }, 500);
    }
  });

  return app;
}
