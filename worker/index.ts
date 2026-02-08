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

// SEO location page API (for /l/:country/:pageType/:slug)
app.get('/api/seo-page/:country/:pageType/:slug', async (c) => {
  const country = c.req.param('country');
  const pageType = c.req.param('pageType');
  const slug = c.req.param('slug');
  const storage = getStorage(c.env);
  const page = await storage.getSeoPageByPath(country, pageType, slug);
  if (!page) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json(page);
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

// Cron trigger handler for email campaigns (called every 6 hours)
app.get('/cron/email-campaigns', async (c) => {
  try {
    // Call the email campaign processing endpoint internally
    const baseUrl = new URL(c.req.url).origin;
    const response = await fetch(`${baseUrl}/api/email-campaigns/process-scheduled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return c.json(result);
  } catch (error: any) {
    console.error('Cron job error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// SEO 301 redirects: DB (redirect_map) first, then static
const SEO_REDIRECTS_STATIC: Record<string, string> = {
  '/guides': '/iptv-services',
  '/guide': '/iptv-services',
  '/firestick': '/iptv-firestick',
  '/jailbreak': '/jailbroken-fire-sticks',
  '/devices': '/firestick-devices',
  '/media-players': '/iptv-media-players',
  '/iptv-apps': '/iptv-media-players',
  '/iptv-players': '/iptv-media-players',
};
app.get('*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  try {
    const storage = getStorage(c.env);
    const dbRedirects = await storage.getRedirectMap();
    for (const r of dbRedirects) {
      if (r.old_path === path) {
        return c.redirect('https://streamstickpro.com' + r.new_path, (r.status_code as 301) || 301);
      }
    }
  } catch {
    /* use static */
  }
  const target = SEO_REDIRECTS_STATIC[path];
  if (target) {
    return c.redirect('https://streamstickpro.com' + target, 301);
  }
  return next();
});

// Sitemap index (for 50K+ URLs: point to sitemap.xml and future sitemap-*.xml)
app.get('/sitemap-index.xml', (c) => {
  const baseUrl = 'https://streamstickpro.com';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
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
    
    // Only list canonical URLs; /free-trial 301s to / so omit from sitemap
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/iptv-services', priority: '0.9', changefreq: 'weekly' },
      { url: '/iptv-firestick', priority: '0.9', changefreq: 'weekly' },
      { url: '/jailbroken-fire-sticks', priority: '0.9', changefreq: 'weekly' },
      { url: '/firestick-devices', priority: '0.9', changefreq: 'weekly' },
      { url: '/best-iptv-firestick', priority: '0.9', changefreq: 'weekly' },
      { url: '/iptv-media-players', priority: '0.9', changefreq: 'weekly' },
      { url: '/terms', priority: '0.5', changefreq: 'yearly' },
      { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
      { url: '/refund', priority: '0.5', changefreq: 'yearly' },
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

    // SEO location pages from Supabase (seo_architecture) — /shop already in staticPages
    const seoPages = await storage.getSeoPagesForSitemap(25000);
    for (const page of seoPages) {
      const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

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

// Security headers for all responses
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
function applySecurityHeaders(res: Response): Response {
  const next = new Response(res.body, { status: res.status, statusText: res.statusText, headers: new Headers(res.headers) });
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => next.headers.set(k, v));
  return next;
}

app.get('*', async (c) => {
  try {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    return applySecurityHeaders(res);
  } catch {
    const fallback = await c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)));
    return applySecurityHeaders(fallback);
  }
});

export default app;
