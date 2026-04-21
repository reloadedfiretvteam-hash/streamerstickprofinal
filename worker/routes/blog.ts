import { Hono } from 'hono';
import type { Env } from '../index';
import { getStorage } from '../helpers';

export function createBlogRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/posts', async (c) => {
    try {
      const storage = getStorage(c.env);
      const limit = Math.min(parseInt(c.req.query('limit') || '100', 10), 1000);
      const offset = parseInt(c.req.query('offset') || '0', 10);
      const tag = c.req.query('tag') || '';
      const search = c.req.query('search') || c.req.query('q') || '';

      let posts: any[];
      if (search) {
        posts = await storage.searchBlogPosts(search);
      } else {
        posts = await storage.getBlogPosts();
        // Filter by tag if provided
        if (tag) {
          posts = posts.filter((p: any) =>
            (p.tags && Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())) ||
            (p.category && p.category.toLowerCase() === tag.toLowerCase())
          );
        }
      }

      const total = posts.length;
      const paginated = posts.slice(offset, offset + limit);

      return c.json({ data: paginated, total, limit, offset }, 200, {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      });
    } catch (error: any) {
      console.error('Failed to fetch blog posts:', error);
      return c.json({ error: 'Failed to fetch blog posts', details: error.message }, 500);
    }
  });

  router.get('/posts/featured', async (c) => {
    try {
      const storage = getStorage(c.env);
      const posts = await storage.getFeaturedBlogPosts();
      return c.json({ data: posts });
    } catch (error: any) {
      console.error('Failed to fetch featured posts:', error);
      return c.json({ error: 'Failed to fetch featured posts', details: error.message }, 500);
    }
  });

  router.get('/search', async (c) => {
    try {
      const query = c.req.query('q') || '';
      const storage = getStorage(c.env);
      const posts = await storage.searchBlogPosts(query);
      return c.json({ data: posts });
    } catch (error: any) {
      console.error('Failed to search blog posts:', error);
      return c.json({ error: 'Failed to search posts', details: error.message }, 500);
    }
  });

  router.get('/:slug', async (c) => {
    try {
      const slug = c.req.param('slug');
      const storage = getStorage(c.env);
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return c.json({ error: 'Blog post not found' }, 404);
      }
      return c.json({ data: post });
    } catch (error: any) {
      console.error('Failed to fetch blog post:', error);
      return c.json({ error: 'Failed to fetch blog post', details: error.message }, 500);
    }
  });

  return router;
}
