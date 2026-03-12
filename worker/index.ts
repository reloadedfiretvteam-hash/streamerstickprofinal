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
import { createMarketingRoutes } from './routes/marketing';
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
  /** Optional salt for hashing visitor IDs (recommended) */
  VISITOR_HASH_SALT?: string;
  GITHUB_TOKEN?: string;
  OPENAI_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  NODE_ENV?: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const app = new Hono<{ Bindings: Env }>();

// --- Location pages static fallback cache (critical for crawl/index stability) ---
// Without caching, repeatedly fetching + parsing location-pages.json can exceed Worker CPU/memory limits
// and cause 503 "Worker exceeded resource limits" for Googlebot across /l/*.
type LocationStaticPage = { path: string; t: string; d: string; h: string };
type LocationPagesIndex = {
  loadedAt: number;
  list: LocationStaticPage[];
  byPath: Map<string, LocationStaticPage>;
  byRegionKey: Map<string, string[]>; // key: country|pageType|region -> sample list of paths
  regionCount: Map<string, number>; // key: country|pageType|region -> total count
  countryCount: Map<string, number>; // key: country -> total count
  countryTypeCount: Map<string, number>; // key: country|pageType -> total count
};

let LOCATION_CACHE: LocationPagesIndex | null = null;
let LOCATION_CACHE_PROMISE: Promise<LocationPagesIndex | null> | null = null;
const LOCATION_CACHE_TTL_MS = 10 * 60 * 1000;

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

function setCookieHeader(name: string, value: string, maxAgeSeconds: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; Secure; HttpOnly`;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isBotUA(ua: string): boolean {
  return /bot|crawler|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|pinterest|discord|whatsapp|telegram/i.test(ua || '');
}

const CA_REGIONS = new Set(['ab', 'bc', 'mb', 'nb', 'nl', 'ns', 'nt', 'nu', 'on', 'pe', 'qc', 'sk', 'yt']);
const US_REGIONS = new Set([
  'al','ak','az','ar','ca','co','ct','de','fl','ga','hi','id','il','in','ia','ks','ky','la','me','md','ma','mi','mn','ms','mo','mt',
  'ne','nv','nh','nj','nm','ny','nc','nd','oh','ok','or','pa','ri','sc','sd','tn','tx','ut','vt','va','wa','wv','wi','wy','dc',
]);
const UK_REGIONS = new Set(['england', 'scotland', 'wales', 'ni']);

function regionFromSlug(country: string, slug: string): string {
  const s = (slug || '').toLowerCase();
  const parts = s.split('-').filter(Boolean);
  if (parts.length < 2) return '';
  const last = parts[parts.length - 1];
  if (last.length > 20) return '';
  const c = (country || '').toLowerCase();
  if (c === 'ca') return CA_REGIONS.has(last) ? last : '';
  if (c === 'usa' || c === 'us') return US_REGIONS.has(last) ? last : '';
  if (c === 'uk') return UK_REGIONS.has(last) ? last : '';
  // fallback: accept last token as region if it looks reasonable
  return last;
}

function regionKey(country: string, pageType: string, slug: string): string {
  return `${(country || '').toLowerCase()}|${(pageType || '').toLowerCase()}|${regionFromSlug(country, slug)}`;
}

async function getLocationPagesIndex(c: any): Promise<LocationPagesIndex | null> {
  const now = Date.now();
  if (LOCATION_CACHE && now - LOCATION_CACHE.loadedAt < LOCATION_CACHE_TTL_MS) return LOCATION_CACHE;
  if (LOCATION_CACHE_PROMISE) return LOCATION_CACHE_PROMISE;

  LOCATION_CACHE_PROMISE = (async () => {
    try {
      const assetRes = await c.env.ASSETS.fetch(new Request(new URL('/location-pages.json', c.req.url)));
      if (!assetRes.ok) return null;
      const list = (await assetRes.json()) as LocationStaticPage[];
      const byPath = new Map<string, LocationStaticPage>();
      const byRegionKey = new Map<string, string[]>();
      const regionCount = new Map<string, number>();
      const countryCount = new Map<string, number>();
      const countryTypeCount = new Map<string, number>();
      for (const p of list) {
        if (!p?.path) continue;
        byPath.set(p.path, p);
        // /l/{country}/{pageType}/{slug}
        const seg = p.path.split('/').filter(Boolean);
        const country = seg[1] || '';
        const pageType = seg[2] || '';
        const slug = seg[3] || '';
        const k = regionKey(country, pageType, slug);

        const cKey = (country || '').toLowerCase();
        countryCount.set(cKey, (countryCount.get(cKey) || 0) + 1);
        const ctKey = `${cKey}|${(pageType || '').toLowerCase()}`;
        countryTypeCount.set(ctKey, (countryTypeCount.get(ctKey) || 0) + 1);

        if (!k.endsWith('|')) {
          regionCount.set(k, (regionCount.get(k) || 0) + 1);
          const arr = byRegionKey.get(k) || [];
          if (arr.length < 80) arr.push(p.path); // sample cap (enough for related links + hubs)
          byRegionKey.set(k, arr);
        }
      }
      const idx: LocationPagesIndex = { loadedAt: now, list, byPath, byRegionKey, regionCount, countryCount, countryTypeCount };
      LOCATION_CACHE = idx;
      return idx;
    } catch {
      return null;
    } finally {
      LOCATION_CACHE_PROMISE = null;
    }
  })();

  return LOCATION_CACHE_PROMISE;
}

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
app.route('/api/admin/marketing', createMarketingRoutes());

// Deduplicated visit tracking (ip_hash + session); public, no auth
app.post('/api/track-visit', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const page = typeof body.page === 'string' ? body.page : '/';
    const page_url = typeof body.page_url === 'string' ? body.page_url : null;
    const referrer = typeof body.referrer === 'string' ? body.referrer : null;
    const session_id = typeof body.session_id === 'string' ? body.session_id : null;
    const ua = (typeof body.user_agent === 'string' ? body.user_agent : c.req.header('user-agent')) || '';

    // Stable visitor cookie (unique visitor). If missing, create it.
    const cookies = parseCookies(c.req.header('cookie') ?? null);
    let vid = cookies['vid'];
    let setCookie: string | null = null;
    if (!vid) {
      vid = crypto.randomUUID();
      setCookie = setCookieHeader('vid', vid, 60 * 60 * 24 * 30);
    }

    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown';
    const salt = c.env.VISITOR_HASH_SALT || c.env.JWT_SECRET || 'streamstickpro';
    const ip_hash =
      typeof body.ip_hash === 'string' && body.ip_hash
        ? body.ip_hash
        : await sha256Hex(`vid:${vid}|salt:${salt}`) || await sha256Hex(`ip:${ip}|ua:${ua}|salt:${salt}`);

    const cfData = (c.req.raw as any).cf || {};
    const storage = getStorage(c.env);
    await storage.trackVisitByHash({
      ip_hash,
      state: body.state ?? cfData.region ?? null,
      city: body.city ?? cfData.city ?? null,
      country: body.country ?? cfData.country ?? null,
      user_agent: ua || null,
      session_id,
      page,
      page_url,
      referrer,
      is_bot: isBotUA(ua),
    });
    if (setCookie) c.header('Set-Cookie', setCookie);
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

app.get('/unsubscribe', async (c) => {
  try {
    const email = c.req.query('email');
    if (!email) return c.html('<html><body><h1>Missing email parameter</h1></body></html>', 400);
    const { createClient } = await import('@supabase/supabase-js');
    const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_SERVICE_ROLL_KEY || c.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);
    await supabase.from('contacts').update({ is_subscribed: false }).eq('email', email);
    return c.html('<!DOCTYPE html><html><head><title>Unsubscribed</title><style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a2e;color:#fff;margin:0}div{text-align:center;padding:40px;background:#16213e;border-radius:16px;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,0.3)}</style></head><body><div><h1>Unsubscribed</h1><p>You have been successfully unsubscribed from StreamStickPro emails.</p><p><a href="https://streamstickpro.com" style="color:#667eea">Return to StreamStickPro</a></p></div></body></html>');
  } catch (e: any) {
    return c.html('<html><body><h1>Error processing unsubscribe</h1></body></html>', 500);
  }
});

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
  const env = c.env;
  const bindings = {
    stripe: !!(env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.length > 0),
    resend: !!(env.RESEND_API_KEY && env.RESEND_API_KEY.length > 0),
    supabase: !!(env.VITE_SUPABASE_URL && (env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLL_KEY)),
  };
  const ok = bindings.stripe && bindings.resend && bindings.supabase;
  return c.json({
    status: ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '2.0.1',
    bindings,
  });
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

// SEO location page API (for /l/:country/:pageType/:slug). DB first, then static build fallback. Never 500 for "not found"; 404 only.
app.get('/api/seo-page/:country/:pageType/:slug', async (c) => {
  try {
    const country = c.req.param('country');
    const pageType = c.req.param('pageType');
    const slug = c.req.param('slug');
    const path = `/l/${country.toLowerCase()}/${pageType}/${slug}`;
    const storage = getStorage(c.env);
    let page = await storage.getSeoPageByPath(country, pageType, slug);
    if (!page) {
      try {
        const idx = await getLocationPagesIndex(c);
        const staticPage = idx?.byPath.get(path);
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
      } catch {
        // ignore
      }
    }
    if (!page) return c.json({ error: 'Not found' }, 404);
    return c.json(page);
  } catch (err) {
    console.error('[api/seo-page]', err instanceof Error ? err.message : String(err));
    return c.json({ error: 'Service temporarily unavailable' }, 503, { 'Retry-After': '60' });
  }
});

// Related internal links for location pages (fast: served from cached location-pages index)
app.get('/api/seo-related/:country/:pageType/:slug', async (c) => {
  const country = c.req.param('country');
  const pageType = c.req.param('pageType');
  const slug = c.req.param('slug');
  const path = `/l/${country.toLowerCase()}/${pageType}/${slug}`;
  try {
    const idx = await getLocationPagesIndex(c);
    if (!idx) return c.json({ related: [] }, 200, { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' });
    const k = regionKey(country, pageType, slug);
    const rel = (idx.byRegionKey.get(k) || []).filter((p) => p !== path).slice(0, 12);
    const related = rel.map((p) => {
      const entry = idx.byPath.get(p);
      return { url: p, title: entry?.h || entry?.t || p };
    });
    return c.json({ related }, 200, { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' });
  } catch {
    return c.json({ related: [] }, 200, { 'Cache-Control': 'public, max-age=300' });
  }
});

app.get('/api/debug', async (c) => {
  // This endpoint is useful during development but should not be exposed in production.
  if ((c.env.NODE_ENV || '').toLowerCase() === 'production') {
    return c.json({ error: 'Not found' }, 404);
  }
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

// Locations hub data for internal linking at scale (kept small + cacheable)
app.get('/api/locations/hub', async (c) => {
  const country = (c.req.query('country') || '').toLowerCase();
  const pageType = (c.req.query('pageType') || '').toLowerCase();
  const region = (c.req.query('region') || '').toLowerCase();
  const idx = await getLocationPagesIndex(c);
  if (!idx) return c.json({ countries: [], pageTypes: [], regions: [], cities: [] }, 200, { 'Cache-Control': 'public, max-age=300' });

  const cacheHeaders = { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' };

  if (!country) {
    const countries = Array.from(idx.countryCount.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
    return c.json({ countries }, 200, cacheHeaders);
  }

  if (country && !pageType) {
    const pageTypes = Array.from(idx.countryTypeCount.entries())
      .filter(([k]) => k.startsWith(country + '|'))
      .map(([k, count]) => ({ pageType: k.split('|')[1], count }))
      .sort((a, b) => b.count - a.count);
    return c.json({ country, pageTypes }, 200, cacheHeaders);
  }

  if (country && pageType && !region) {
    const regions = Array.from(idx.regionCount.entries())
      .filter(([k]) => k.startsWith(`${country}|${pageType}|`))
      .map(([k, count]) => {
        const parts = k.split('|');
        const r = parts[2] || '';
        const sample = (idx.byRegionKey.get(k) || []).slice(0, 5).map((p) => {
          const entry = idx.byPath.get(p);
          return { url: p, title: entry?.h || entry?.t || p };
        });
        return { region: r, count, sample };
      })
      .sort((a, b) => b.count - a.count);
    return c.json({ country, pageType, regions }, 200, cacheHeaders);
  }

  const key = `${country}|${pageType}|${region}`;
  const paths = (idx.byRegionKey.get(key) || []).slice(0, 60);
  const cities = paths.map((p) => {
    const entry = idx.byPath.get(p);
    return { url: p, title: entry?.h || entry?.t || p };
  });
  return c.json({ country, pageType, region, cities }, 200, cacheHeaders);
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
// GSC: avoid 5xx when DB/timeout fails — return 503 with Retry-After so crawlers retry; only 404 when page truly missing.
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
    let page: any = null;
    try {
      const storage = getStorage(c.env);
      page = await storage.getSeoPageByPath(country, pageType, slug);
    } catch {
      // DB timeout/unavailable — fall back to static index only (don't 5xx)
    }
    if (page) {
      title = (page.title || page.h1 || 'IPTV & Jailbroken Fire Stick').replace(/\[LOCATION\]/g, page.location || page.region || slug);
      desc = (page.meta_description || page.p1_snippet || '').trim().substring(0, 160) || 'IPTV and Fire Stick guides for your area. StreamStickPro—18K+ channels, free trial. USA, Canada, UK.';
      if (Array.isArray(page.faq_json) && page.faq_json.length > 0) {
        faqJson = page.faq_json.map((f: any) => ({ question: f.question || f.q || '', answer: f.answer || f.a || '' })).filter((f: any) => f.question && f.answer);
      }
    } else {
      const idx = await getLocationPagesIndex(c);
      const staticPage = idx?.byPath.get(path);
      if (staticPage) {
        title = staticPage.t;
        desc = (staticPage.d || '').trim().substring(0, 160) || 'IPTV and Fire Stick guides for your area. StreamStickPro—18K+ channels, free trial. USA, Canada, UK.';
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
    if (!title) {
      // Return real 404 for crawlers so GSC doesn't report "soft 404" (was: return next() → SPA 200 + "not found")
      const notFoundHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Page Not Found | StreamStickPro</title><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="https://streamstickpro.com/"></head><body><h1>Page Not Found</h1><p>This location or topic page was not found.</p><p><a href="https://streamstickpro.com/">StreamStickPro Home</a></p></body></html>`;
      return new Response(notFoundHtml, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    const url = `https://streamstickpro.com${path}`;
    const ogImage = 'https://streamstickpro.com/opengraph.jpg';
    const h1Text = escapeHtml(title);
    const descSafe = escapeHtml(desc.substring(0, 160) || 'IPTV and Fire Stick guides. StreamStickPro—18K+ channels, free trial.');
    const fullTitleRaw = `${title} | StreamStick Pro`;
    const fullTitle = fullTitleRaw.length > 60 ? fullTitleRaw.slice(0, 57) + "..." : fullTitleRaw;
    const fullTitleSafe = escapeHtml(fullTitle);

    // Dynamic internal linking (same region) for crawl depth + topical authority.
    let dynamicRelated = '';
    try {
      const idx = await getLocationPagesIndex(c);
      const k = regionKey(country, pageType, slug);
      const rel = (idx?.byRegionKey.get(k) || []).filter((p) => p !== path).slice(0, 8);
      if (rel.length) {
        const items = rel
          .map((p) => {
            const entry = idx?.byPath.get(p);
            const label = escapeHtml((entry?.h || entry?.t || p).toString()).slice(0, 80);
            return `<li><a href=\"https://streamstickpro.com${p}\">${label}</a></li>`;
          })
          .join('');
        dynamicRelated = `<h3>More guides in your area</h3><ul>${items}</ul>`;
      }
    } catch {
      /* ignore */
    }

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
        ${dynamicRelated}
      </section>
    </article>
  </main>
  <footer role="contentinfo"><p>&copy; StreamStickPro. <a href="https://streamstickpro.com/">StreamStickPro</a> – IPTV, Fire Sticks, and streaming guides.</p></footer>
  <script>window.location.replace(${JSON.stringify(url)});</script>
  <noscript><p>Continue to <a href="${url}">${h1Text}</a>.</p></noscript>
</body>
</html>`;
    return applySecurityHeaders(new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }), path);
  } catch (err) {
    console.error('[location page]', path, err instanceof Error ? err.message : String(err));
    const tmp = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Temporarily Unavailable</title><meta name="robots" content="noindex,nofollow"></head><body><h1>Temporarily Unavailable</h1><p>Please try again in a moment.</p><p><a href="https://streamstickpro.com/">StreamStickPro Home</a></p></body></html>`;
    return new Response(tmp, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '60' } });
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
  '/tutorial': '/tutorials',
  '/tutorials/iptv-media-players': '/tutorials',
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
  // '/resources': removed — was self-redirect loop (301 → /resources → 301 → infinite)
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

// ── Block crawlers on secure domain (shadow store should NEVER appear in search engines) ──
const SECURE_HOSTS = new Set(['secure.streamstickpro.com']);
app.get('/robots.txt', (c) => {
  const hostname = new URL(c.req.url).hostname;
  if (SECURE_HOSTS.has(hostname)) {
    return c.text('User-agent: *\nDisallow: /\n', 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

// ── RSS/Atom Feed (content freshness signal + aggregator traffic) ──
app.get('/feed.xml', async (c) => {
  const baseUrl = 'https://streamstickpro.com';
  const now = new Date().toUTCString();
  let items = '';
  try {
    const storage = getStorage(c.env);
    const blogPosts = await storage.getBlogPosts();
    for (const post of blogPosts) {
      if (!post.published) continue;
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : now;
      const title = escapeHtml((post.title || 'Blog Post').toString());
      const desc = escapeHtml(((post.excerpt || post.metaDescription || post.title || '').toString()).slice(0, 300));
      const link = `${baseUrl}/blog/${post.slug}`;
      items += `    <item>\n      <title>${title}</title>\n      <link>${link}</link>\n      <guid isPermaLink="true">${link}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <description>${desc}</description>\n      <category>${escapeHtml((post.category || 'Guides').toString())}</category>\n    </item>\n`;
    }
  } catch { /* DB unavailable — empty feed is valid */ }
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>StreamStickPro – IPTV &amp; Fire Stick Blog</title>
    <link>${baseUrl}/blog</link>
    <description>IPTV guides, Fire Stick tutorials, streaming tips, and cord-cutting news from StreamStickPro.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.png</url>
      <title>StreamStickPro</title>
      <link>${baseUrl}</link>
    </image>
${items}  </channel>
</rss>`;
  return c.text(rss, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=7200' });
});
app.get('/rss.xml', (c) => c.redirect('https://streamstickpro.com/feed.xml', 301));

// ── OpenSearch XML (browser search integration) ──
app.get('/opensearch.xml', (c) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>StreamStickPro</ShortName>
  <Description>Search StreamStickPro: IPTV guides, Fire Stick tutorials, streaming tips</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Url type="text/html" template="https://streamstickpro.com/blog?search={searchTerms}"/>
  <Image width="16" height="16" type="image/png">https://streamstickpro.com/favicon.png</Image>
</OpenSearchDescription>`;
  return c.text(xml, 200, { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
});

// Sitemap index (SEO/AEO prompt: sitemap-pages + sitemap-posts; sitemap.xml = full single file)
const SITEMAP_INDEX_XML = (baseUrl: string, today: string) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemap-pages.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-posts.xml</loc><lastmod>${today}</lastmod></sitemap>
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
  { url: '/locations', priority: '0.85', changefreq: 'daily' },
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
  { url: '/tutorials', priority: '0.9', changefreq: 'weekly' },
  { url: '/resources', priority: '0.85', changefreq: 'weekly' },
  { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { url: '/refund', priority: '0.5', changefreq: 'yearly' },
  // Do not include checkout in sitemap (noindex + disallowed in robots)
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
      const idx = await getLocationPagesIndex(c);
      for (const item of idx?.list || []) {
        xml += `<url><loc>${baseUrl}${item.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
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

// Sitemap route - must be before catch-all (full: static + blog + location). Resilient: never 500; Supabase failure returns static + location-pages.json.
app.get('/sitemap.xml', async (c) => {
  const baseUrl = 'https://streamstickpro.com';
  const today = new Date().toISOString().split('T')[0];
  let blogPosts: any[] = [];
  let seoPages: { path: string; updated_at?: string }[] = [];

  try {
    const storage = getStorage(c.env);
    try {
      blogPosts = await storage.getBlogPosts();
    } catch (e) {
      console.error('sitemap getBlogPosts:', (e as Error)?.message);
    }
    try {
      seoPages = await storage.getSeoPagesForSitemap(50000);
    } catch (e) {
      console.error('sitemap getSeoPagesForSitemap:', (e as Error)?.message);
    }
  } catch {
    // getStorage failed (e.g. missing env); continue with empty blog + seo
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const page of STATIC_SITEMAP_PAGES) {
    sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  for (const post of blogPosts) {
    if (post.published) {
      const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : today;
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  }

  for (const page of seoPages) {
    const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : today;
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
      const idx = await getLocationPagesIndex(c);
      for (const item of idx?.list || []) {
        sitemap += `  <url>
    <loc>${baseUrl}${item.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
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
});

// ── IndexNow key files (plain text, not SPA HTML) — serve both keys so submissions always validate ──
app.get('/3b1a52f5f41a4138b1f21c3265180f44.txt', (c) => {
  return c.text('3b1a52f5f41a4138b1f21c3265180f44', 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
});
app.get('/752d1cf8edc045568943005a03892968.txt', (c) => {
  return c.text('752d1cf8edc045568943005a03892968', 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
});

// ── IndexNow bulk URL submission ──
app.post('/api/indexnow/ping', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body.urls) ? body.urls.slice(0, 10000) : [];
    if (!urls.length) return c.json({ error: 'urls array required' }, 400);
    const key = '3b1a52f5f41a4138b1f21c3265180f44';
    const payload = { host: 'streamstickpro.com', key, keyLocation: `https://streamstickpro.com/${key}.txt`, urlList: urls };
    const resp = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return c.json({ submitted: urls.length, status: resp.status, ok: resp.status >= 200 && resp.status < 300 });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ── Per-page SEO meta for SPA pages (critical: Googlebot sees unique meta per page) ──
const PAGE_META: Record<string, { title: string; description: string; noindex?: boolean }> = {
  '/': { title: 'IPTV Fire Stick 2026 | 18K+ Channels, No Buffer | StreamStick Pro', description: 'Best IPTV for Fire Stick 2026: 18,000+ live channels, VOD movies, 24/7 support. Free 36-hour trial. Jailbroken Fire Sticks and ONN Google TV included.' },
  '/shop': { title: 'Shop IPTV Subscriptions & Fire Sticks | StreamStick Pro', description: 'Buy IPTV subscriptions, jailbroken Fire Sticks, and ONN Google TV devices. 18,000+ channels, instant setup, 24/7 support. Shop StreamStickPro now.' },
  '/blog': { title: 'IPTV & Streaming Blog | Guides, News, Tips | StreamStick Pro', description: 'Expert IPTV guides, Fire Stick tutorials, streaming tips, and cord-cutting news. Updated weekly by StreamStickPro.' },
  '/locations': { title: 'IPTV Service by City & Region | USA, Canada, UK | StreamStick Pro', description: 'Find IPTV service in your city. StreamStickPro covers 40,000+ locations across USA, Canada, and UK. Local guides, setup help, free trial.' },
  '/iptv-services': { title: 'Best IPTV Service 2026 | 18K+ Channels | StreamStick Pro', description: 'StreamStickPro IPTV: 18,000+ live channels, 100,000+ VOD, EPG guide, catch-up TV. Works on Fire Stick, Google TV, Smart TVs. Free 36-hour trial.' },
  '/jailbroken-fire-sticks': { title: 'Jailbroken Fire Sticks 2026 | Pre-Loaded, Ready to Stream | StreamStick Pro', description: 'Buy jailbroken Fire Sticks pre-loaded with IPTV, Kodi, Stremio, TiviMate. 18K+ channels, plug and play. Ships fast to USA, Canada, UK.' },
  '/onn-google-tv': { title: 'ONN Google TV IPTV Setup 2026 | StreamStick Pro', description: 'Set up IPTV on ONN Google TV in minutes. 18,000+ channels, TiviMate & Smarters Pro compatible. Step-by-step guide by StreamStickPro.' },
  '/36hr-trial': { title: 'Free 36-Hour IPTV Trial | 18K+ Channels | StreamStick Pro', description: 'Try StreamStickPro free for 36 hours. 18,000+ live channels, VOD, EPG guide. No credit card required. Instant access.' },
  '/pricing': { title: 'IPTV Pricing & Plans 2026 | StreamStick Pro', description: 'StreamStickPro IPTV pricing: affordable monthly and yearly plans. 18,000+ channels, 4K quality, multi-device support. Compare plans.' },
  '/iptv-firestick': { title: 'IPTV for Fire Stick 2026 | Setup Guide | StreamStick Pro', description: 'How to set up IPTV on Amazon Fire Stick. Step-by-step guide for IPTV Smarters Pro, TiviMate, and more. 18K+ channels with StreamStickPro.' },
  '/best-iptv-firestick': { title: 'Best IPTV for Fire Stick 2026 | Top Picks | StreamStick Pro', description: 'Best IPTV services for Amazon Fire Stick in 2026. Compare features, channels, prices. StreamStickPro rated #1 with 18K+ channels.' },
  '/firestick-devices': { title: 'Fire Stick Devices for IPTV 2026 | StreamStick Pro', description: 'Best Fire Stick devices for IPTV streaming in 2026. Fire Stick 4K Max, Lite, and pre-loaded jailbroken options compared.' },
  '/iptv-media-players': { title: 'Best IPTV Media Players 2026 | Apps & Devices | StreamStick Pro', description: 'Top IPTV media players and apps: TiviMate, IPTV Smarters Pro, Kodi, Perfect Player, VLC. Setup guides and comparisons.' },
  '/iptv-smarters-pro': { title: 'IPTV Smarters Pro Setup Guide 2026 | StreamStick Pro', description: 'Complete IPTV Smarters Pro setup guide. Install on Fire Stick, Android, iOS. Add StreamStickPro credentials and start streaming 18K+ channels.' },
  '/tivimate': { title: 'TiviMate IPTV Player Setup 2026 | StreamStick Pro', description: 'TiviMate setup guide for IPTV. Install on Fire Stick and Android TV. EPG, catch-up, multi-view. Best settings for StreamStickPro.' },
  '/tutorials': { title: 'IPTV & Fire Stick Tutorials | StreamStick Pro', description: 'Step-by-step IPTV tutorials: Fire Stick setup, app installation, troubleshooting, VPN guides. StreamStickPro video and text guides.' },
  '/resources': { title: 'IPTV Resources & Tools | StreamStick Pro', description: 'IPTV resources, tools, speed tests, VPN guides, and troubleshooting. Everything you need for the best streaming experience.' },
  '/ultimate-iptv-catalog-2026': { title: 'Ultimate IPTV Channel Catalog 2026 | 93K+ Channels | StreamStick Pro', description: 'Explore the ultimate IPTV channel catalog: 93,000+ channels from 150+ countries. Search by country, genre, language. StreamStickPro.' },
  '/tools/catalog': { title: 'IPTV Tools & Utilities | StreamStick Pro', description: 'Free IPTV tools: speed test, M3U validator, EPG checker, channel finder. StreamStickPro utilities for optimal streaming.' },
  '/terms': { title: 'Terms of Service | StreamStick Pro', description: 'StreamStickPro terms of service. Read our policies on IPTV subscriptions, Fire Stick purchases, refunds, and account usage.' },
  '/privacy': { title: 'Privacy Policy | StreamStick Pro', description: 'StreamStickPro privacy policy. How we collect, use, and protect your personal information. GDPR and CCPA compliant.' },
  '/refund': { title: 'Refund Policy | StreamStick Pro', description: 'StreamStickPro refund policy. 7-day money-back guarantee on IPTV subscriptions. How to request a refund.' },
  '/shadow-services': { title: 'StreamStick Pro', description: 'StreamStickPro secure store.', noindex: true },
  '/checkout': { title: 'Checkout | StreamStick Pro', description: 'Complete your StreamStickPro purchase.', noindex: true },
  '/success': { title: 'Order Confirmed | StreamStick Pro', description: 'Your StreamStickPro order has been confirmed.', noindex: true },
  '/customer-login': { title: 'Customer Login | StreamStick Pro', description: 'Log in to your StreamStickPro account.', noindex: true },
  '/my-account': { title: 'My Account | StreamStick Pro', description: 'Manage your StreamStickPro account.', noindex: true },
  '/forgot-password': { title: 'Forgot Password | StreamStick Pro', description: 'Reset your StreamStickPro password.', noindex: true },
  '/reset-password': { title: 'Reset Password | StreamStick Pro', description: 'Reset your StreamStickPro password.', noindex: true },
};

// Security + SEO headers for all responses (Google/Bing trust signals)
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  'Content-Security-Policy': "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src https://js.stripe.com https://www.facebook.com; object-src 'none'; base-uri 'self'; form-action 'self' https://js.stripe.com;",
};
function applySecurityHeaders(res: Response, pathname?: string, hostname?: string): Response {
  const next = new Response(res.body, { status: res.status, statusText: res.statusText, headers: new Headers(res.headers) });
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => next.headers.set(k, v));
  // X-Robots-Tag: redundant signal that reinforces meta robots at HTTP level
  const noindexPaths = new Set(['/checkout', '/success', '/admin', '/customer-login', '/my-account', '/forgot-password', '/reset-password', '/shadow-services']);
  const isSecureDomain = hostname && (hostname === 'secure.streamstickpro.com' || hostname.endsWith('.secure.streamstickpro.com'));
  if (isSecureDomain || (pathname && noindexPaths.has(pathname))) {
    next.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else {
    next.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }
  // Link: canonical HTTP header (complements HTML <link rel="canonical">)
  if (pathname) {
    const canon = `https://streamstickpro.com${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
    next.headers.set('Link', `<${canon}>; rel="canonical"`);
  }
  // Cache-Control for HTML (short TTL, stale-while-revalidate for speed)
  if (!next.headers.has('cache-control') && (next.headers.get('content-type') || '').includes('text/html')) {
    next.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600');
  }
  return next;
}

// VS-competitor meta for crawler SSR
const VS_META: Record<string, { title: string; description: string }> = {
  '/vs-iptvstronger': { title: 'StreamStickPro vs IPTVStronger 2026 | Honest Comparison', description: 'Compare StreamStickPro vs IPTVStronger: channels, pricing, reliability, devices. See why StreamStickPro leads with 18K+ channels and free trial.' },
  '/vs-troypoint': { title: 'StreamStickPro vs TroyPoint 2026 | IPTV Comparison', description: 'StreamStickPro vs TroyPoint comparison: features, pricing, setup. StreamStickPro offers 18K+ channels, pre-loaded Fire Sticks, 24/7 support.' },
  '/vs-hypotv': { title: 'StreamStickPro vs HypoTV 2026 | Which IPTV Is Better?', description: 'Compare StreamStickPro vs HypoTV: channel count, reliability, price. StreamStickPro: 18K+ channels, 4K, free trial.' },
  '/vs-tvworldwide': { title: 'StreamStickPro vs TV Worldwide 2026 | IPTV Showdown', description: 'StreamStickPro vs TV Worldwide: features, price, device support compared. 18K+ channels with StreamStickPro.' },
  '/vs-iptvproviders': { title: 'StreamStickPro vs IPTV Providers 2026 | Best IPTV Service', description: 'StreamStickPro vs IPTV Providers: head-to-head comparison. Channels, VOD, price, reliability. StreamStickPro wins with 18K+ channels.' },
  '/vs-xtremehd': { title: 'StreamStickPro vs XtremeHD 2026 | IPTV Comparison', description: 'Compare StreamStickPro vs XtremeHD IPTV: channels, quality, price. StreamStickPro offers 18K+ channels and free trial.' },
  '/vs-iptvgreat': { title: 'StreamStickPro vs IPTV Great 2026 | Best IPTV', description: 'StreamStickPro vs IPTV Great: full comparison of features, channels, pricing. StreamStickPro leads with 18K+ channels.' },
  '/vs-shoroc': { title: 'StreamStickPro vs Shoroc 2026 | IPTV Comparison', description: 'Compare StreamStickPro vs Shoroc IPTV service. Channels, reliability, price. StreamStickPro: 18K+ channels, free trial.' },
  '/vs-iptvencoder': { title: 'StreamStickPro vs IPTV Encoder 2026 | Comparison', description: 'StreamStickPro vs IPTV Encoder: features, channels, pricing compared. StreamStickPro offers 18K+ channels and 24/7 support.' },
};

/** Resolve per-page meta: static map, vs pages, or fetch blog post from DB. */
async function resolvePageMeta(pathname: string, env: Env): Promise<{ title: string; description: string; noindex?: boolean } | null> {
  // 1. Static page map
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // 2. VS competitor pages
  if (VS_META[pathname]) return VS_META[pathname];
  // 3. Blog post: /blog/<slug>
  const blogMatch = pathname.match(/^\/blog\/([a-z0-9][a-z0-9\-]*[a-z0-9])$/);
  if (blogMatch) {
    try {
      const storage = getStorage(env);
      const post = await storage.getBlogPostBySlug(blogMatch[1]);
      if (post) {
        const titleRaw = (post.title || 'Blog | StreamStickPro').toString();
        const fullTitle = titleRaw.length > 60 ? titleRaw.slice(0, 57) + '...' : titleRaw;
        const descRaw = (post.excerpt || post.metaDescription || post.title || '').toString().slice(0, 160) || 'IPTV guides, Fire Stick tutorials, and streaming tips from StreamStickPro.';
        return { title: fullTitle, description: descRaw };
      }
    } catch { /* DB unavailable — fall through */ }
  }
  return null;
}

/** Build BreadcrumbList JSON-LD for any page (gives crawlers navigation context). */
function buildBreadcrumbLD(pathname: string, pageTitle: string): string {
  const base = 'https://streamstickpro.com';
  const crumbs: { name: string; url: string }[] = [{ name: 'Home', url: base + '/' }];
  if (pathname !== '/') {
    // Add intermediate crumb for known sections
    if (pathname.startsWith('/blog')) {
      if (pathname !== '/blog') crumbs.push({ name: 'Blog', url: base + '/blog' });
    } else if (pathname.startsWith('/vs-')) {
      crumbs.push({ name: 'Comparisons', url: base + '/iptv-services' });
    } else if (pathname.startsWith('/l/')) {
      crumbs.push({ name: 'Locations', url: base + '/locations' });
    }
    crumbs.push({ name: pageTitle.replace(/ \| StreamStick Pro$/i, '').slice(0, 60), url: base + pathname });
  }
  if (crumbs.length < 2) return '';
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.map((c, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': c.name,
      'item': c.url,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

/** Inject per-page meta tags into the SPA shell so Googlebot sees unique title/canonical/description per URL. */
function injectMeta(html: string, pathname: string, meta: { title: string; description: string; noindex?: boolean } | null): string {
  const base = 'https://streamstickpro.com';
  const canon = `${base}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;

  if (!meta) {
    return html
      .replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canon}">`)
      .replace(/<meta[^>]*property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canon}">`);
  }
  const titleSafe = escapeHtml(meta.title);
  const descSafe = escapeHtml(meta.description);
  const robotsContent = meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  // BreadcrumbList JSON-LD for crawlers (only on indexable pages)
  const breadcrumbLD = meta.noindex ? '' : buildBreadcrumbLD(pathname, meta.title);

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${titleSafe}</title>`);
  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canon}">`);
  out = out.replace(/<meta[^>]*name=["']description["'][^>]*>/i, `<meta name="description" content="${descSafe}">`);
  out = out.replace(/<meta[^>]*name=["']robots["'][^>]*>/i, `<meta name="robots" content="${robotsContent}">`);
  out = out.replace(/<meta[^>]*property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${titleSafe}">`);
  out = out.replace(/<meta[^>]*property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${descSafe}">`);
  out = out.replace(/<meta[^>]*property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canon}">`);
  // Inject breadcrumb LD before </head> (RSS/OpenSearch links already in static index.html)
  if (breadcrumbLD) out = out.replace('</head>', `${breadcrumbLD}</head>`);
  return out;
}

app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const pathname = url.pathname;
  const hostname = url.hostname;
  const meta = await resolvePageMeta(pathname, c.env);

  try {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return applySecurityHeaders(res, pathname, hostname);
    const html = await res.text();
    const fixed = injectMeta(html, pathname, meta);
    return applySecurityHeaders(new Response(fixed, { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }), pathname, hostname);
  } catch {
    const fallback = await c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)));
    const html = await fallback.text();
    const fixed = injectMeta(html, pathname, meta);
    return applySecurityHeaders(new Response(fixed, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }), pathname, hostname);
  }
});

export default app;
