import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { createProductRoutes } from './routes/products';
import { createCheckoutRoutes } from './routes/checkout';
import { createOrderRoutes } from './routes/orders';
import { createAdminRoutes } from './routes/admin';
import { createWebhookRoutes } from './routes/webhook';
import { createVisitorRoutes } from './routes/visitors';
import { createCustomerRoutes } from './routes/customers';
import { createTrialRoutes } from './routes/trial';
import { createAuthRoutes, authMiddleware } from './routes/auth';
import { createBlogRoutes } from './routes/blog';
import { createSeoAdRoutes } from './routes/seo-ads';
import { createAIAssistantRoutes } from './routes/ai-assistant';
import { createEmailCampaignRoutes } from './routes/email-campaigns';
import { getStorage } from './helpers';

export interface Env {
  DATABASE_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  JWT_SECRET?: string;
  GITHUB_TOKEN?: string;
  OPENAI_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  NODE_ENV?: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://streamstickpro.com', 'https://www.streamstickpro.com', 'https://secure.streamstickpro.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  credentials: true,
}));

app.route('/api/auth', createAuthRoutes());
app.route('/api/products', createProductRoutes());
app.route('/api/checkout', createCheckoutRoutes());
app.route('/api/orders', createOrderRoutes());
app.use('/api/admin/*', authMiddleware);
app.route('/api/admin', createAdminRoutes());
app.route('/api/stripe', createWebhookRoutes());
app.route('/api/track', createVisitorRoutes());
app.route('/api/admin/visitors', createVisitorRoutes());
app.route('/api/customer', createCustomerRoutes());
app.route('/api/free-trial', createTrialRoutes());
app.route('/api/blog', createBlogRoutes());
app.route('/api/seo-ads', createSeoAdRoutes());
app.route('/api/ai-assistant', createAIAssistantRoutes());
app.route('/api/email-campaigns', createEmailCampaignRoutes());

app.post('/api/track-cart', async (c) => {
  try {
    const { getStorage } = await import('./helpers');
    const storage = getStorage(c.env);
    const body = await c.req.json();
    const { email, customerName, cartItems, totalAmount } = body;

    if (!email || !cartItems || cartItems.length === 0) {
      return c.json({ error: 'Email and cart items required' }, 400);
    }

    await storage.trackAbandonedCart({
      email,
      customerName: customerName || null,
      cartItems,
      totalAmount: totalAmount || 0,
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking cart:', error);
    return c.json({ success: true });
  }
});

app.get('/api/stripe/config', async (c) => {
  const publishableKey = c.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return c.json({ error: 'Stripe not configured' }, 500);
  }
  return c.json({ publishableKey });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.1' });
});

app.get('/api/debug', async (c) => {
  const supabaseUrl = c.env.VITE_SUPABASE_URL || '';
  const supabaseKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Test Supabase connection
  let supabaseTest = { connected: false, error: '', productCount: 0 };
  try {
    const { getStorage } = await import('./helpers');
    const storage = getStorage(c.env);
    const products = await storage.getRealProducts();
    supabaseTest = { connected: true, error: '', productCount: products.length };
  } catch (err: any) {
    supabaseTest = { connected: false, error: err.message || String(err), productCount: 0 };
  }
  
  // Test Stripe connection
  let stripeTest = { connected: false, error: '' };
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    await stripe.products.list({ limit: 1 });
    stripeTest = { connected: true, error: '' };
  } catch (err: any) {
    stripeTest = { connected: false, error: err.message || String(err) };
  }
  
  return c.json({
    supabase: {
      hasUrl: !!supabaseUrl,
      urlPrefix: supabaseUrl.substring(0, 30) || 'none',
      hasKey: !!supabaseKey,
      keyLength: supabaseKey.length,
      keyPrefix: supabaseKey.substring(0, 10) || 'none',
      test: supabaseTest,
    },
    stripe: {
      hasSecretKey: !!c.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!c.env.STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!c.env.STRIPE_WEBHOOK_SECRET,
      secretKeyPrefix: c.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'none',
      test: stripeTest,
    },
    email: {
      hasResendKey: !!c.env.RESEND_API_KEY,
      hasFromEmail: !!c.env.RESEND_FROM_EMAIL,
      fromEmail: c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com',
    },
    auth: {
      hasAdminUsername: !!c.env.ADMIN_USERNAME,
      hasAdminPassword: !!c.env.ADMIN_PASSWORD,
      hasJwtSecret: !!c.env.JWT_SECRET,
    },
    nodeEnv: c.env.NODE_ENV || 'not set',
  });
});

// Sitemap route - must be before catch-all
app.get('/sitemap.xml', async (c) => {
  try {
    const baseUrl = 'https://streamstickpro.com';
    const storage = getStorage(c.env);
    
    // Get blog posts and products
    const blogPosts = await storage.getBlogPosts();
    const products = await storage.getRealProducts();
    
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/checkout', priority: '0.7', changefreq: 'weekly' },
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
    
    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add blog posts
    for (const post of blogPosts) {
      if (post.published) {
        const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Add shop page (products are on the shop page)
    sitemap += `  <url>
    <loc>${baseUrl}/shop</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

    sitemap += `</urlset>`;

    return c.text(sitemap, 200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error: any) {
    console.error('Error generating sitemap:', error);
    // Fallback to static file if dynamic generation fails
    try {
      const response = await c.env.ASSETS.fetch(new Request(new URL('/sitemap.xml', c.req.url)));
      if (response.ok) {
        return new Response(response.body, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch {
      // If static file also fails, return error
    }
    return c.text('Error generating sitemap', 500);
  }
});

app.get('*', async (c) => {
  try {
    return await c.env.ASSETS.fetch(c.req.raw);
  } catch {
    return c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)));
  }
});

export default app;
