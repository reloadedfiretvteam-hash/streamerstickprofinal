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
  /** Only used in CI by run-supabase-migration.ts; not required by worker at runtime */
  DATABASE_URL?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SERVICE_ROLL_KEY?: string;
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

// Deduplicated visit tracking (ip_hash + session); public, no auth
app.post('/api/track-visit', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const ip_hash = body.ip_hash;
    const page = typeof body.page === 'string' ? body.page : '/';
    if (!ip_hash || typeof ip_hash !== 'string') {
      return c.json({ error: 'ip_hash required' }, 400);
    }
    const storage = getStorage(c.env);
    await storage.trackVisitByHash({
      ip_hash,
      state: body.state ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      user_agent: body.user_agent ?? c.req.header('user-agent') ?? null,
      session_id: body.session_id ?? null,
      page,
    });
    return c.json({ ok: true });
  } catch (err: any) {
    console.error('[track-visit]', err?.message || err);
    return c.json({ error: 'Failed to track visit', details: err?.message }, 500);
  }
});
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

// Catalog API: 93K catalog summary for Schema.org Dataset / AI citation (Nuclear SEO)
const CATALOG_SUMMARY = {
  channels: { usa: 847, france: 623, mexico: 456, india: 1247, total: 18000 },
  movies: 60237,
  series: 15423,
  languages: 89,
  countries: 195,
  devices: 7,
  hubUrl: 'https://streamstickpro.com/ultimate-iptv-catalog-2026',
};
app.get('/api/catalog-summary', (c) => {
  return c.json(CATALOG_SUMMARY, 200, {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': 'https://streamstickpro.com',
  });
});

// SEO location page API (for /l/:country/:pageType/:slug). DB first, then static build fallback so 25K pages work without DB seed.
app.get('/api/seo-page/:country/:pageType/:slug', async (c) => {
  const country = c.req.param('country');
  const pageType = c.req.param('pageType');
  const slug = c.req.param('slug');
  const path = `/l/${country.toLowerCase()}/${pageType}/${slug}`;
  const storage = getStorage(c.env);
  let page = await storage.getSeoPageByPath(country, pageType, slug);
  if (!page) {
    try {
      const assetRes = await c.env.ASSETS.fetch(new Request(new URL('/location-pages.json', c.req.url)));
      if (assetRes.ok) {
        const list = (await assetRes.json()) as { path: string; t: string; d: string; h: string }[];
        const staticPage = list.find((p) => p.path === path);
        if (staticPage) {
          page = {
            country: country.toUpperCase(),
            page_type: pageType,
            slug,
            title: staticPage.t,
            meta_description: staticPage.d,
            h1: staticPage.h,
            p1_snippet: staticPage.d,
            internal_links: [],
            faq_json: [],
          };
        }
      }
    } catch {
      // ignore
    }
  }
  if (!page) return c.json({ error: 'Not found' }, 404);
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

// Phase 4: OG-rich HTML for location pages (crawlers only) — must be before * redirect. DB first, then static build fallback so 25K pages have meta even without DB seed.
app.get('/l/:country/:pageType/:slug', async (c, next) => {
  const ua = (c.req.header('User-Agent') || '').toLowerCase();
  const isCrawler = /bot|crawler|facebookexternalhit|twitterbot|linkedinbot|slurp|whatsapp|telegram|pinterest|discord/i.test(ua);
  if (!isCrawler) return next();
  const country = c.req.param('country');
  const pageType = c.req.param('pageType');
  const slug = c.req.param('slug');
  const path = `/l/${country.toLowerCase()}/${pageType}/${slug}`;
  let title = '';
  let desc = '';
  let faqJson: { question: string; answer: string }[] = [];
  try {
    const storage = getStorage(c.env);
    const page = await storage.getSeoPageByPath(country, pageType, slug);
    if (page) {
      title = (page.title || page.h1 || 'IPTV & Jailbroken Fire Stick').replace(/\[LOCATION\]/g, page.location || page.region || slug);
      desc = (page.meta_description || page.p1_snippet || '').substring(0, 155);
      if (Array.isArray(page.faq_json) && page.faq_json.length > 0) {
        faqJson = page.faq_json.map((f: any) => ({ question: f.question || f.q || '', answer: f.answer || f.a || '' })).filter((f: any) => f.question && f.answer);
      }
    } else {
      const assetRes = await c.env.ASSETS.fetch(new Request(new URL('/location-pages.json', c.req.url)));
      if (assetRes.ok) {
        const list = (await assetRes.json()) as { path: string; t: string; d: string; h: string }[];
        const staticPage = list.find((p) => p.path === path);
        if (staticPage) {
          title = staticPage.t;
          desc = (staticPage.d || '').substring(0, 155);
        }
      }
    }
    if (faqJson.length === 0) {
      faqJson = [
        { question: 'What is the best IPTV service for ' + (slug || 'this area') + '?', answer: 'StreamStickPro offers 18,000+ live channels and 100,000+ movies and series, with a free trial. Works on Fire Stick, ONN Google TV, and Smart TVs.' },
        { question: 'Can I get a jailbroken Fire Stick with IPTV?', answer: 'Yes. StreamStickPro sells pre-loaded Fire Sticks with IPTV included. Setup in minutes with instant credentials and support.' },
        { question: 'Does StreamStickPro work on Google TV?', answer: 'Yes. StreamStickPro works on ONN Google TV and other Android TV devices. Native support with IPTV Smarters Pro and TiviMate.' },
        { question: 'Is there a free trial?', answer: 'Yes. StreamStickPro offers a 36-hour free trial. Start from the homepage to get instant access to 28,000+ channels.' },
        { question: 'What devices are supported?', answer: 'StreamStickPro works on Amazon Fire Stick, ONN Google TV, Android TV, Smart TVs, and set-top boxes. Use IPTV Smarters Pro or TiviMate for the best experience.' },
      ];
    }
    faqJson = sanitizeFaq(faqJson);
    if (!title) return next();
    const url = `https://streamstickpro.com${path}`;
    const ogImage = 'https://streamstickpro.com/opengraph.jpg';
    const h1Text = escapeHtml(title);
    const descSafe = escapeHtml(desc);
    const fullTitle = `${title} | StreamStickPro`;
    const fullTitleSafe = escapeHtml(fullTitle);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fullTitleSafe}</title>
  <meta name="description" content="${descSafe}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${fullTitleSafe}">
  <meta property="og:description" content="${descSafe}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="StreamStickPro">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${fullTitleSafe}">
  <meta name="twitter:description" content="${descSafe}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="robots" content="index, follow">
  ${faqJson.length > 0 ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqJson.map((f: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: escapeHtml(f.question),
      acceptedAnswer: { '@type': 'Answer', text: escapeHtml(f.answer) },
    })),
  })}</script>` : ''}
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header role="banner">
    <nav aria-label="Breadcrumb">
      <ol itemscope itemtype="https://schema.org/BreadcrumbList">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="https://streamstickpro.com/"><span itemprop="name">Home</span></a><meta itemprop="position" content="1"></li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="${url}"><span itemprop="name">${h1Text}</span></a><meta itemprop="position" content="2"></li>
      </ol>
    </nav>
  </header>
  <main id="main" role="main">
    <article>
      <h1>${h1Text}</h1>
      <p class="lead">${descSafe}</p>
      <section aria-labelledby="what-we-build">
        <h2 id="what-we-build">What StreamStickPro Builds</h2>
        <p>StreamStickPro builds <strong>IPTV subscriptions</strong> (18,000+ live channels, 100,000+ movies and series), <strong>jailbroken and pre-loaded Fire Sticks</strong> (Kodi, Stremio, TiviMate ready), and <strong>Google TV–compatible streaming</strong> for USA, Canada, and UK. Location guides, setup tutorials, and a free trial are included.</p>
      </section>
      <section aria-labelledby="related">
        <h2 id="related">Related</h2>
        <ul>
          <li><a href="https://streamstickpro.com/">Home &amp; 36hr Free Trial</a></li>
          <li><a href="https://streamstickpro.com/36hr-trial">Start 36-Hour Free Trial</a></li>
          <li><a href="https://streamstickpro.com/jailbroken-fire-sticks">Jailbroken Fire Sticks</a></li>
          <li><a href="https://streamstickpro.com/iptv-services">IPTV Services</a></li>
          <li><a href="https://streamstickpro.com/onn-google-tv">ONN Google TV Setup</a></li>
          <li><a href="https://streamstickpro.com/pricing">Pricing</a></li>
          <li><a href="https://streamstickpro.com/shop">Shop</a></li>
          <li><a href="https://streamstickpro.com/ultimate-iptv-catalog-2026">Explore 93K IPTV Catalog</a></li>
        </ul>
      </section>
    </article>
  </main>
  <footer role="contentinfo"><p>&copy; StreamStickPro. <a href="https://streamstickpro.com/">StreamStickPro</a> – IPTV, Fire Sticks, and streaming guides.</p></footer>
  <script>window.location.replace(${JSON.stringify(url)});</script>
  <noscript><p>Continue to <a href="${url}">${h1Text}</a>.</p></noscript>
</body>
</html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch {
    return next();
  }
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Sanitize FAQ for GSC: no empty/N/A/Location/short answers so Google does not show errors. */
function sanitizeFaq(items: { question: string; answer: string }[]): { question: string; answer: string }[] {
  const bad = new Set(['', 'n/a', 'na', 'location', '[location]', 'tbd', 'tba', '—', '–', '-']);
  return items.filter((f) => {
    const q = (f.question || '').trim();
    const a = (f.answer || '').trim();
    if (!q || !a) return false;
    if (a.length < 25) return false;
    if (bad.has(a.toLowerCase()) || bad.has(q.toLowerCase())) return false;
    if (/^\[LOCATION\]$/i.test(a) || /^location$/i.test(a)) return false;
    return true;
  });
}

// SEO 301 redirects: DB (redirect_map) first, then static. Flood niche: IPTV, jailbreak, Canada/US/UK, devices, media players.
const SEO_REDIRECTS_STATIC: Record<string, string> = {
  // Guides & trial
  '/guides': '/iptv-services',
  '/guide': '/iptv-services',
  '/trial': '/',
  '/free-trial': '/36hr-trial',
  // Fire Stick & jailbreak
  '/firestick': '/jailbroken-fire-sticks',
  '/fire-stick': '/jailbroken-fire-sticks',
  '/firestick-iptv': '/iptv-firestick',
  '/fire-stick-iptv': '/iptv-firestick',
  '/jailbreak': '/jailbroken-fire-sticks',
  '/jailbroken-firestick': '/jailbroken-fire-sticks',
  '/jailbroken-fire-stick': '/jailbroken-fire-sticks',
  '/unlocked-fire-stick': '/jailbroken-fire-sticks',
  '/preloaded-fire-stick': '/jailbroken-fire-sticks',
  '/kodi-fire-stick': '/jailbroken-fire-sticks',
  // Devices & players
  '/devices': '/firestick-devices',
  '/media-players': '/iptv-media-players',
  '/iptv-apps': '/iptv-media-players',
  '/iptv-players': '/iptv-media-players',
  '/iptv-smarters': '/iptv-smarters-pro',
  '/smarters-pro': '/iptv-smarters-pro',
  '/perfect-player': '/iptv-media-players',
  '/perfect-player-iptv': '/iptv-media-players',
  '/vlc-iptv': '/iptv-media-players',
  '/kodi-iptv': '/iptv-media-players',
  '/stremio': '/iptv-media-players',
  '/stremio-iptv': '/iptv-media-players',
  // Regions (pillar; location pages cover cities)
  '/iptv-canada': '/iptv-services',
  '/iptv-usa': '/iptv-services',
  '/iptv-us': '/iptv-services',
  '/iptv-uk': '/iptv-services',
  '/iptv-united-kingdom': '/iptv-services',
  '/best-iptv-canada': '/iptv-services',
  '/best-iptv-usa': '/iptv-services',
  '/best-iptv-uk': '/iptv-services',
  '/iptv-service': '/iptv-services',
  '/iptv-subscription': '/shop',
  '/iptv-plans': '/pricing',
  '/iptv-pricing': '/pricing',
  // ONN & Google TV
  '/onn': '/onn-google-tv',
  '/onn-tv': '/onn-google-tv',
  '/onn-google-tv-iptv': '/onn-google-tv',
  '/google-tv-iptv': '/onn-google-tv',
  '/android-tv-iptv': '/iptv-media-players',
  // Competitors
  '/iptvstronger': '/vs-iptvstronger',
  '/troypoint': '/vs-troypoint',
  '/hypotv': '/vs-hypotv',
  '/tvworldwide': '/vs-tvworldwide',
  '/iptvproviders': '/vs-iptvproviders',
  '/xtremehd': '/vs-xtremehd',
  '/iptvgreat': '/vs-iptvgreat',
  '/shoroc': '/vs-shoroc',
  '/iptvencoder': '/vs-iptvencoder',
  // Best / comparison
  '/best-iptv': '/best-iptv-firestick',
  '/best-iptv-firestick-2026': '/best-iptv-firestick',
  '/best-iptv-service': '/iptv-services',
  '/resources': '/resources',
  '/catalog': '/ultimate-iptv-catalog-2026',
  '/tools': '/tools/catalog',
  '/iptv': '/iptv-services',
  '/live-tv': '/iptv-services',
  '/streaming': '/iptv-services',
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

// Sitemap index (SEO/AEO prompt: sitemap-pages + sitemap-posts; sitemap.xml = full single file)
const SITEMAP_INDEX_XML = (baseUrl: string, today: string) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemap-pages.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-posts.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${baseUrl}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>`;
app.get('/sitemap-index.xml', (c) => {
  const today = new Date().toISOString().split('T')[0];
  return c.text(SITEMAP_INDEX_XML('https://streamstickpro.com', today), 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
});

const STATIC_SITEMAP_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/shop', priority: '0.9', changefreq: 'daily' },
  { url: '/blog', priority: '0.9', changefreq: 'daily' },
  { url: '/36hr-trial', priority: '0.95', changefreq: 'daily' },
  { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
  { url: '/jailbroken-fire-sticks', priority: '0.9', changefreq: 'weekly' },
  { url: '/onn-google-tv', priority: '0.9', changefreq: 'weekly' },
  { url: '/iptv-smarters-pro', priority: '0.9', changefreq: 'weekly' },
  { url: '/tivimate', priority: '0.9', changefreq: 'weekly' },
  { url: '/iptv-services', priority: '0.9', changefreq: 'weekly' },
  { url: '/iptv-firestick', priority: '0.9', changefreq: 'weekly' },
  { url: '/firestick-devices', priority: '0.9', changefreq: 'weekly' },
  { url: '/best-iptv-firestick', priority: '0.9', changefreq: 'weekly' },
  { url: '/iptv-media-players', priority: '0.9', changefreq: 'weekly' },
  { url: '/resources', priority: '0.85', changefreq: 'weekly' },
  { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { url: '/refund', priority: '0.5', changefreq: 'yearly' },
  { url: '/checkout', priority: '0.7', changefreq: 'weekly' },
  // Tier 1 crush pages
  { url: '/vs-iptvstronger', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-troypoint', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-iptvproviders', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-hypotv', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-tvworldwide', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-xtremehd', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-iptvgreat', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-shoroc', priority: '0.85', changefreq: 'weekly' },
  { url: '/vs-iptvencoder', priority: '0.85', changefreq: 'weekly' },
  { url: '/ultimate-iptv-catalog-2026', priority: '0.95', changefreq: 'daily' },
  { url: '/tools/catalog', priority: '0.85', changefreq: 'weekly' },
];

// sitemap-pages.xml: static + location pages only (SEO/AEO prompt)
app.get('/sitemap-pages.xml', async (c) => {
  const baseUrl = 'https://streamstickpro.com';
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  for (const p of STATIC_SITEMAP_PAGES) {
    xml += `<url><loc>${baseUrl}${p.url}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
  }
  try {
    const storage = getStorage(c.env);
    const seoPages = await storage.getSeoPagesForSitemap(50000);
    for (const page of seoPages) {
      const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : today;
      xml += `<url><loc>${baseUrl}${page.path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    }
    if (seoPages.length < 2000) {
      const assetRes = await c.env.ASSETS.fetch(new Request(new URL('/location-pages.json', c.req.url)));
      if (assetRes.ok) {
        const list = (await assetRes.json()) as { path: string }[];
        for (const item of list) {
          xml += `<url><loc>${baseUrl}${item.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
        }
      }
    }
  } catch {
    /* ignore */
  }
  xml += '</urlset>';
  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
});

// sitemap-posts.xml: blog only (SEO/AEO prompt)
app.get('/sitemap-posts.xml', async (c) => {
  const baseUrl = 'https://streamstickpro.com';
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  try {
    const storage = getStorage(c.env);
    const blogPosts = await storage.getBlogPosts();
    for (const post of blogPosts) {
      if (post.published) {
        const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : today;
        xml += `<url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      }
    }
  } catch {
    /* ignore */
  }
  xml += '</urlset>';
  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
});

// Sitemap route - must be before catch-all (full: static + blog + location)
app.get('/sitemap.xml', async (c) => {
  try {
    const baseUrl = 'https://streamstickpro.com';
    const storage = getStorage(c.env);
    
    // Get blog posts and products
    const blogPosts = await storage.getBlogPosts();
    const products = await storage.getRealProducts();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
    
    for (const page of STATIC_SITEMAP_PAGES) {
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

    // SEO location pages: Supabase first, then static fallback (25K from build) so Google gets thousands of URLs even if DB seed didn't run
    const seoPages = await storage.getSeoPagesForSitemap(50000);
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
    if (seoPages.length < 2000) {
      try {
        const assetRes = await c.env.ASSETS.fetch(new Request(new URL('/location-pages.json', c.req.url)));
        if (assetRes.ok) {
          const list = (await assetRes.json()) as { path: string }[];
          const today = new Date().toISOString().split('T')[0];
          for (const item of list) {
            sitemap += `  <url>
    <loc>${baseUrl}${item.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
          }
        }
      } catch {
        // ignore
      }
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
