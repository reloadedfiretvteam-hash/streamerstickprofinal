/**
 * CMS routes — reads content from WordPress via the free built-in REST API.
 * No paid plugins required. Works with Elementor, Gutenberg, or plain pages.
 * Auth is optional: set WP_APPLICATION_USER + WP_APPLICATION_PASSWORD in
 * Cloudflare env to access draft pages; public pages work without any auth.
 */
import { Hono } from 'hono';
import type { Env } from '../index';

type WpPage = {
  id?: number;
  slug?: string;
  status?: string;
  modified?: string;
  content?: { rendered?: string; raw?: string };
  title?: { rendered?: string };
};

const WP_ORIGIN      = 'https://indigo-meerkat-253284.hostingersite.com';
const HOME_SLUG      = 'streamstick-home-v1';
const PRICING_SLUG   = 'streamstick-pricing-v1';
const CACHE_SECONDS  = 300; // 5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanOrigin(v?: string | null): string {
  return String(v || '').trim().replace(/\/+$/, '');
}

function getWpOrigin(env: Env): string {
  return cleanOrigin(env.WP_ORIGIN || env.WORDPRESS_URL || WP_ORIGIN);
}

/** Returns a Basic auth header if Application Password is configured. */
function getAuthHeader(env: Env): string | null {
  const explicit = String(env.WP_REST_BASIC_AUTH || '').trim();
  if (explicit) return explicit.startsWith('Basic ') ? explicit : `Basic ${explicit}`;
  const user = String(env.WP_APPLICATION_USER || env.WORDPRESS_APPLICATION_USER || '').trim();
  const pass = String(env.WP_APPLICATION_PASSWORD || env.WORDPRESS_APPLICATION_PASSWORD || '').trim();
  if (!user || !pass) return null;
  return `Basic ${btoa(`${user}:${pass}`)}`;
}

function decodeHtml(v: string): string {
  return v
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .trim();
}

function fixEncoding(v: string): string {
  return v
    .replace(/Â·/g, '·').replace(/â€"|â€"/g, '-').replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€/g, '"').replace(/â€¦/g, '...').replace(/Â(?![A-Za-z0-9])/g, '')
    .trim();
}

function normalize<T>(value: T): T {
  if (typeof value === 'string') return fixEncoding(value) as T;
  if (Array.isArray(value)) return value.map(normalize) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)])) as T;
  return value;
}

function stripTags(v: string): string {
  return v.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Try to parse JSON from page content — works for both plain JSON pages and
 *  Elementor/Gutenberg pages that embed JSON in <pre><code> or <script> blocks. */
function extractJson(content: string): any | null {
  const candidates: string[] = [];

  for (const m of content.matchAll(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi))
    if (m[1]) candidates.push(m[1]);
  for (const m of content.matchAll(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi))
    if (m[1]) candidates.push(m[1]);
  for (const m of content.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi))
    if (m[1]) candidates.push(m[1]);
  candidates.push(content, stripTags(content));

  for (const c of candidates) {
    try {
      const parsed = JSON.parse(decodeHtml(c).trim());
      if (parsed && typeof parsed === 'object') return normalize(parsed);
    } catch { /* try next */ }
  }
  return null;
}

/** Fetch a published WordPress page by slug using the free built-in REST API. */
async function fetchPage(env: Env, slug: string, preferDraft = false): Promise<{
  page: WpPage | null; source: string | null;
}> {
  const origin = getWpOrigin(env);
  if (!origin) return { page: null, source: null };

  const auth = getAuthHeader(env);
  const base = `${origin}/wp-json/wp/v2`;
  const fields = 'id,slug,status,modified,content,title';

  const urls: string[] = [];

  // With auth (Application Password) → can fetch drafts
  if (auth && preferDraft) {
    urls.push(
      `${base}/pages?slug=${encodeURIComponent(slug)}&context=edit&status=any&_fields=${fields}`,
    );
  }
  // Without auth → public published pages only (always works, no cost)
  urls.push(`${base}/pages?slug=${encodeURIComponent(slug)}&_fields=${fields}`);

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: auth ? { Authorization: auth } : undefined });
      if (!res.ok) continue;
      const rows = (await res.json()) as WpPage[];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const order = preferDraft
        ? ['draft', 'pending', 'private', 'publish', 'future']
        : ['publish', 'future', 'private', 'pending', 'draft'];
      const page = rows.sort((a, b) =>
        order.indexOf(String(a.status)) - order.indexOf(String(b.status))
      )[0];
      if (page) return { page, source: url };
    } catch { /* try next URL */ }
  }
  return { page: null, source: null };
}

function normalizePricing(payload: any, isShadow: boolean) {
  const src = payload && typeof payload === 'object' ? payload : {};
  const root = src.prices ?? src;
  const toMap = (v: any): Record<string, string> => {
    const out: Record<string, string> = {};
    if (!v || typeof v !== 'object') return out;
    for (const [k, raw] of Object.entries(v)) {
      const id = String(raw || '').trim();
      if (k && /^price_/i.test(id)) out[String(k).trim()] = id;
    }
    return out;
  };
  const shadow = toMap(root.shadow ?? root.preview ?? root);
  const live   = toMap(root.live   ?? root.production ?? root);
  return {
    meta:    src.meta    ?? undefined,
    hero:    src.hero    ?? undefined,
    plans:   Array.isArray(src.plans) ? src.plans : [],
    faq:     src.faq     ?? undefined,
    shadow, live,
    selectedMode:   isShadow ? 'shadow' : 'live',
    selectedPrices: isShadow ? shadow : live,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

export function createCmsRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  /** /api/cms/home — JSON content block for the home page */
  app.get('/home', async (c) => {
    try {
      const slug = String(c.env.WP_HOME_PAGE_SLUG || HOME_SLUG).trim();
      const preferDraft = false;
      const { page, source } = await fetchPage(c.env, slug, preferDraft);
      const raw = page?.content?.raw || page?.content?.rendered || '';
      const data = raw ? extractJson(raw) : null;
      return c.json({ data, meta: { slug, pageStatus: page?.status, updatedAt: page?.modified, source } }, 200, {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      });
    } catch (e: any) {
      return c.json({ data: null, meta: { error: e?.message } });
    }
  });

  /** /api/cms/pricing — structured pricing data for the pricing page */
  app.get('/pricing', async (c) => {
    try {
      const slug = String(c.env.WP_PRICING_PAGE_SLUG || PRICING_SLUG).trim();
      const preferDraft = false;
      const { page, source } = await fetchPage(c.env, slug, preferDraft);
      const raw = page?.content?.raw || page?.content?.rendered || '';
      const payload = raw ? extractJson(raw) : null;
      const data = normalizePricing(payload, preferDraft);
      return c.json({ data, meta: { slug, pageStatus: page?.status, updatedAt: page?.modified, source, preferDraft } }, 200, {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      });
    } catch (e: any) {
      return c.json({ data: { shadow: {}, live: {}, selectedMode: 'live', selectedPrices: [] }, meta: { error: e?.message } });
    }
  });

  /** /api/cms/page/:slug — fetch any WordPress page by slug.
   *  Returns both the parsed JSON (if content is JSON) and the raw rendered HTML.
   *  Works with Elementor, Gutenberg, or plain WordPress pages. No cost. */
  app.get('/page/:slug', async (c) => {
    try {
      const slug = c.req.param('slug');
      const { page, source } = await fetchPage(c.env, slug);
      if (!page) return c.json({ error: 'Page not found', slug }, 404);

      const rendered = page.content?.rendered || '';
      const jsonData = extractJson(rendered);

      return c.json({
        id: page.id,
        slug: page.slug || slug,
        title: page.title?.rendered || '',
        status: page.status,
        updatedAt: page.modified,
        // Structured JSON extracted from page (if content is JSON-based)
        data: jsonData,
        // Full Elementor/Gutenberg rendered HTML (use with dangerouslySetInnerHTML)
        html: rendered,
        source,
      }, 200, {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      });
    } catch (e: any) {
      return c.json({ error: e?.message }, 500);
    }
  });

  /** /api/cms/pages — list all published WordPress pages */
  app.get('/pages', async (c) => {
    try {
      const origin = getWpOrigin(c.env);
      const auth = getAuthHeader(c.env);
      const url = `${origin}/wp-json/wp/v2/pages?per_page=50&_fields=id,title,slug,status,modified&status=publish`;
      const res = await fetch(url, { headers: auth ? { Authorization: auth } : undefined });
      if (!res.ok) return c.json({ error: `WordPress returned ${res.status}` }, 502);
      const pages = await res.json() as WpPage[];
      return c.json({ data: pages }, 200, {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      });
    } catch (e: any) {
      return c.json({ error: e?.message }, 500);
    }
  });

  /** /api/cms/posts — list WordPress blog posts (if you add blog posts to WP) */
  app.get('/posts', async (c) => {
    try {
      const origin = getWpOrigin(c.env);
      const auth = getAuthHeader(c.env);
      const limit = Math.min(parseInt(c.req.query('limit') || '10', 10), 100);
      const offset = parseInt(c.req.query('offset') || '0', 10);
      const url = `${origin}/wp-json/wp/v2/posts?per_page=${limit}&offset=${offset}&_fields=id,title,slug,excerpt,date,categories,tags&status=publish`;
      const res = await fetch(url, { headers: auth ? { Authorization: auth } : undefined });
      if (!res.ok) return c.json({ data: [], total: 0 }, 200);
      const posts = await res.json();
      const total = parseInt(res.headers.get('X-WP-Total') || '0', 10);
      return c.json({ data: posts, total }, 200, {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      });
    } catch (e: any) {
      return c.json({ data: [], total: 0, error: e?.message });
    }
  });

  return app;
}
