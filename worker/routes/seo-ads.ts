import { Hono } from 'hono';
import type { Env } from '../index';
import { getStorage } from '../helpers';

export function createSeoAdRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/ads', async (c) => {
    try {
      const storage = getStorage(c.env);
      const ads = await storage.getSeoAds();
      return c.json({ data: ads });
    } catch (error: any) {
      console.error('Failed to fetch SEO ads:', error);
      return c.json({ error: 'Failed to fetch SEO ads', details: error.message }, 500);
    }
  });

  router.get('/ads/featured', async (c) => {
    try {
      const limit = parseInt(c.req.query('limit') || '6', 10);
      const storage = getStorage(c.env);
      const ads = await storage.getFeaturedSeoAds(limit);
      return c.json({ data: ads });
    } catch (error: any) {
      console.error('Failed to fetch featured SEO ads:', error);
      return c.json({ error: 'Failed to fetch featured ads', details: error.message }, 500);
    }
  });

  router.get('/ads/category/:category', async (c) => {
    try {
      const category = c.req.param('category');
      const storage = getStorage(c.env);
      const ads = await storage.getSeoAdsByCategory(category);
      return c.json({ data: ads });
    } catch (error: any) {
      console.error('Failed to fetch SEO ads by category:', error);
      return c.json({ error: 'Failed to fetch ads by category', details: error.message }, 500);
    }
  });

  router.get('/ads/search', async (c) => {
    try {
      const query = c.req.query('q') || '';
      if (!query) {
        return c.json({ data: [] });
      }
      const storage = getStorage(c.env);
      const ads = await storage.searchSeoAds(query);
      return c.json({ data: ads });
    } catch (error: any) {
      console.error('Failed to search SEO ads:', error);
      return c.json({ error: 'Failed to search ads', details: error.message }, 500);
    }
  });

  router.get('/:slug', async (c) => {
    try {
      const slug = c.req.param('slug');
      const storage = getStorage(c.env);
      const ad = await storage.getSeoAdBySlug(slug);
      if (!ad) {
        return c.json({ error: 'SEO ad not found' }, 404);
      }
      return c.json({ data: ad });
    } catch (error: any) {
      console.error('Failed to fetch SEO ad:', error);
      return c.json({ error: 'Failed to fetch SEO ad', details: error.message }, 500);
    }
  });

  return router;
}


