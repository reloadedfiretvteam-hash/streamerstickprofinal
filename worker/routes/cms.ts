/**
 * CMS routes — reads content from WordPress via the free built-in REST API.
 * No paid plugins required. Works with Elementor, Gutenberg, or plain pages.
 * Auth is optional: set WP_APPLICATION_USER + WP_APPLICATION_PASSWORD in
 * Cloudflare env to access draft pages; public pages work without any auth.
 */
import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from './auth';
import { getStorage } from '../helpers';

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

function hostsFromEnv(raw?: string | null): string[] {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True if hostname equals or is a subdomain of an entry (e.g. preview.secure.example.com vs secure.example.com). */
function hostnameInList(hostname: string, hosts: string[]): boolean {
  const h = hostname.trim().toLowerCase();
  for (const host of hosts) {
    if (!host) continue;
    if (h === host || h.endsWith(`.${host}`)) return true;
  }
  return false;
}

function isDefaultSecureStreamstickHost(hostname: string): boolean {
  const h = hostname.trim().toLowerCase();
  return h === 'secure.streamstickpro.com' || h.endsWith('.secure.streamstickpro.com');
}

/**
 * Secure / shadow storefront hosts use `prices.shadow` from WordPress for checkout overrides;
 * the main public site uses `prices.live`. Matches worker `isSecureDomain` and client `VITE_SECURE_HOSTS`.
 */
function useShadowPriceMap(hostname: string, env: Env): boolean {
  if (isDefaultSecureStreamstickHost(hostname)) return true;
  if (hostnameInList(hostname, hostsFromEnv(env.VITE_SECURE_HOSTS))) return true;
  if (hostnameInList(hostname, hostsFromEnv(env.SHADOW_HOSTS))) return true;
  return false;
}

/**
 * Pages preview / extra shadow hostnames: with Application Password, prefer WordPress draft page content.
 * See `ops/cloudflare/pages-cms-env-vars.md` (`SHADOW_HOSTS`).
 */
function preferWordPressDraft(hostname: string, env: Env, hasAuth: boolean): boolean {
  if (!hasAuth) return false;
  return hostnameInList(hostname, hostsFromEnv(env.SHADOW_HOSTS));
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

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

async function savePageJson(env: Env, slug: string, data: unknown): Promise<{
  ok: boolean;
  page?: WpPage;
  source?: string;
  error?: string;
}> {
  const origin = getWpOrigin(env);
  const auth = getAuthHeader(env);
  if (!origin) return { ok: false, error: 'WordPress origin is not configured' };
  if (!auth) return { ok: false, error: 'WordPress Application Password is not configured' };

  const base = `${origin}/wp-json/wp/v2`;
  const fields = 'id,slug,status,modified,content,title';
  const lookupUrl = `${base}/pages?slug=${encodeURIComponent(slug)}&context=edit&status=any&_fields=${fields}`;
  const lookup = await fetch(lookupUrl, { headers: { Authorization: auth } });
  if (!lookup.ok) return { ok: false, error: `WordPress lookup returned ${lookup.status}` };

  const rows = (await lookup.json()) as WpPage[];
  const page = Array.isArray(rows) ? rows[0] : null;
  if (!page?.id) return { ok: false, error: `WordPress page not found for slug "${slug}"` };

  const content = `<pre><code>${escapeHtml(JSON.stringify(data, null, 2))}</code></pre>`;
  const updateUrl = `${base}/pages/${page.id}`;
  const update = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!update.ok) {
    const detail = await update.text().catch(() => '');
    return { ok: false, error: `WordPress update returned ${update.status}${detail ? `: ${detail.slice(0, 240)}` : ''}` };
  }

  const updated = (await update.json()) as WpPage;
  return { ok: true, page: updated, source: updateUrl };
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

  /**
   * Active Supabase `page_edits` for a page (default `main`). Merged on the client on top of WordPress home JSON.
   * Short cache so Visual Editor changes show within ~2 minutes without redeploy.
   */
  app.get('/page-overrides', async (c) => {
    try {
      const pageId = String(c.req.query('pageId') || 'main').trim() || 'main';
      const storage = getStorage(c.env);
      const edits = await storage.getPageEdits(pageId);
      return c.json({ data: edits, pageId }, 200, {
        'Cache-Control': 'public, max-age=120',
      });
    } catch (e: any) {
      return c.json({ data: [], pageId: 'main', error: e?.message || 'page_overrides_failed' }, 200, {
        'Cache-Control': 'public, max-age=30',
      });
    }
  });

  /** /api/cms/home — JSON content block for the home page */
  app.get('/home', async (c) => {
    try {
      const slug = String(c.env.WP_HOME_PAGE_SLUG || HOME_SLUG).trim();
      const auth = getAuthHeader(c.env);
      const hostname = new URL(c.req.url).hostname;
      const preferDraft = preferWordPressDraft(hostname, c.env, !!auth);
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
      const auth = getAuthHeader(c.env);
      const hostname = new URL(c.req.url).hostname;
      const preferDraft = preferWordPressDraft(hostname, c.env, !!auth);
      const isShadowHost = useShadowPriceMap(hostname, c.env);
      const { page, source } = await fetchPage(c.env, slug, preferDraft);
      const raw = page?.content?.raw || page?.content?.rendered || '';
      const payload = raw ? extractJson(raw) : null;
      const data = normalizePricing(payload, isShadowHost);
      return c.json(
        {
          data,
          meta: {
            slug,
            pageStatus: page?.status,
            updatedAt: page?.modified,
            source,
            preferDraft,
            isShadowHost,
          },
        },
        200,
        {
          'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
        },
      );
    } catch (e: any) {
      return c.json({
        data: { shadow: {}, live: {}, selectedMode: 'live', selectedPrices: {} },
        meta: { error: e?.message },
      });
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

  /** Authenticated JSON save endpoint used by the admin "WordPress Headless" editor.
   * This keeps checkout separate: it only updates WordPress CMS page JSON.
   */
  app.put('/page/:slug', authMiddleware, async (c) => {
    try {
      const slug = c.req.param('slug');
      const allowed = new Set([
        String(c.env.WP_HOME_PAGE_SLUG || HOME_SLUG).trim(),
        String(c.env.WP_PRICING_PAGE_SLUG || PRICING_SLUG).trim(),
      ]);
      if (!allowed.has(slug)) return c.json({ error: 'CMS page is not editable from this endpoint', slug }, 403);

      const body = await c.req.json().catch(() => null);
      const data = body?.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return c.json({ error: 'Expected JSON body with object field "data"' }, 400);
      }

      const saved = await savePageJson(c.env, slug, data);
      if (!saved.ok) return c.json({ error: saved.error || 'WordPress save failed' }, 502);

      return c.json({
        ok: true,
        slug,
        updatedAt: saved.page?.modified,
        source: saved.source,
      });
    } catch (e: any) {
      return c.json({ error: e?.message || 'WordPress save failed' }, 500);
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

  /** /api/cms/health — diagnostic for the WordPress integration.
   * Confirms WP origin, auth, and that the home + pricing pages exist with parseable JSON.
   * Safe to call publicly — never echoes secrets, only booleans + page IDs. */
  app.get('/health', async (c) => {
    const origin = getWpOrigin(c.env);
    const auth = getAuthHeader(c.env);
    const homeSlug = String(c.env.WP_HOME_PAGE_SLUG || HOME_SLUG).trim();
    const pricingSlug = String(c.env.WP_PRICING_PAGE_SLUG || PRICING_SLUG).trim();

    const result: any = {
      origin,
      authConfigured: !!auth,
      slugs: { home: homeSlug, pricing: pricingSlug },
      pages: {} as Record<string, { found: boolean; id?: number; status?: string; jsonOk?: boolean; error?: string }>,
      ok: false,
    };

    if (!origin) {
      result.error = 'WP_ORIGIN / WORDPRESS_URL is not configured in Cloudflare Pages env';
      return c.json(result, 503);
    }

    try {
      const reach = await fetch(`${origin}/wp-json/`, { method: 'GET' });
      result.reachable = reach.ok || reach.status < 500;
      result.reachableStatus = reach.status;
    } catch (e: any) {
      result.reachable = false;
      result.reachableError = e?.message || String(e);
      return c.json(result, 502);
    }

    for (const [key, slug] of [['home', homeSlug], ['pricing', pricingSlug]] as const) {
      try {
        const { page } = await fetchPage(c.env, slug, false);
        if (!page) {
          result.pages[key] = { found: false, error: `Page with slug "${slug}" not found in WordPress` };
          continue;
        }
        const raw = page.content?.raw || page.content?.rendered || '';
        const parsed = raw ? extractJson(raw) : null;
        result.pages[key] = {
          found: true,
          id: page.id,
          status: page.status,
          jsonOk: !!parsed,
        };
      } catch (e: any) {
        result.pages[key] = { found: false, error: e?.message || String(e) };
      }
    }

    result.ok = !!result.reachable
      && result.pages.home?.found
      && result.pages.pricing?.found;
    return c.json(result, result.ok ? 200 : 502, { 'Cache-Control': 'no-store' });
  });

  /** /api/cms/media — authenticated proxy upload to WordPress media library.
   * Sends multipart/form-data (file field "file") through to wp/v2/media.
   * Requires the same admin JWT used for /page saves. WP must have an Application Password configured. */
  app.post('/media', authMiddleware, async (c) => {
    const origin = getWpOrigin(c.env);
    const auth = getAuthHeader(c.env);
    if (!origin) return c.json({ error: 'WordPress origin is not configured' }, 503);
    if (!auth) return c.json({ error: 'WordPress Application Password is not configured' }, 503);

    let form: FormData;
    try {
      form = await c.req.formData();
    } catch (e: any) {
      return c.json({ error: 'Expected multipart/form-data with a "file" field' }, 400);
    }
    const file = form.get('file');
    if (!(file instanceof File)) return c.json({ error: 'Missing file' }, 400);

    const titleRaw = form.get('title');
    const altRaw = form.get('alt');
    const title = typeof titleRaw === 'string' ? titleRaw : '';
    const alt = typeof altRaw === 'string' ? altRaw : '';

    const wpForm = new FormData();
    wpForm.append('file', file, file.name || 'upload');
    if (title) wpForm.append('title', title);
    if (alt) wpForm.append('alt_text', alt);

    const url = `${origin}/wp-json/wp/v2/media`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: auth },
      body: wpForm,
    });
    const detail = await res.text();
    let parsed: any = null;
    try { parsed = JSON.parse(detail); } catch { /* keep text */ }

    if (!res.ok) {
      return c.json({
        error: `WordPress media upload returned ${res.status}`,
        detail: parsed || detail.slice(0, 500),
      }, 502);
    }
    return c.json({
      ok: true,
      id: parsed?.id,
      url: parsed?.source_url,
      mime: parsed?.mime_type,
      title: parsed?.title?.rendered || title,
    });
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
