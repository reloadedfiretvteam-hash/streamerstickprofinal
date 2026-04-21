import { Hono } from 'hono';
import type { Env } from '../index';

type WpPage = {
  id?: number;
  slug?: string;
  status?: string;
  modified?: string;
  content?: {
    rendered?: string;
    raw?: string;
  };
  title?: {
    rendered?: string;
  };
};

const DEFAULT_HOME_PAGE_SLUG = 'streamstick-home-v1';
const DEFAULT_PRICING_PAGE_SLUG = 'streamstick-pricing-v1';
const DEFAULT_WORDPRESS_ORIGIN = 'https://indigo-meerkat-253284.hostingersite.com';

function cleanOrigin(value?: string | null): string {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getWordPressOrigin(env: Env): string {
  return cleanOrigin(env.WP_ORIGIN || env.WORDPRESS_URL || DEFAULT_WORDPRESS_ORIGIN);
}

function getAuthHeader(env: Env): string | null {
  const explicit = String(env.WP_REST_BASIC_AUTH || '').trim();
  if (explicit) return explicit.startsWith('Basic ') ? explicit : `Basic ${explicit}`;
  const user = String(env.WP_APPLICATION_USER || env.WORDPRESS_APPLICATION_USER || '').trim();
  const pass = String(env.WP_APPLICATION_PASSWORD || env.WORDPRESS_APPLICATION_PASSWORD || '').trim();
  if (!user || !pass) return null;
  return `Basic ${btoa(`${user}:${pass}`)}`;
}

function csvSet(value?: string | null): Set<string> {
  return new Set(
    String(value || '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isShadowRequest(hostname: string, env: Env): boolean {
  const host = hostname.toLowerCase();
  if (!host) return false;
  const explicit = csvSet(env.SHADOW_HOSTS || env.VITE_SECURE_HOSTS);
  if (explicit.has(host)) return true;
  return host.includes('shadow') || host.includes('preview');
}

function wpRestBases(origin: string): string[] {
  const normalized = cleanOrigin(origin);
  const noIndex = normalized.replace(/\/index\.php$/i, '');
  const candidates = [
    `${normalized}/wp-json/wp/v2`,
    `${noIndex}/wp-json/wp/v2`,
    `${normalized}/index.php/wp-json/wp/v2`,
    `${noIndex}/index.php/wp-json/wp/v2`,
  ];
  return Array.from(new Set(candidates.map(cleanOrigin).filter(Boolean)));
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function repairMojibake(value: string): string {
  return value
    .replace(/Â·/g, '·')
    .replace(/â€”|â€“/g, '-')
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€¦/g, '...')
    .replace(/Â(?![A-Za-z0-9])/g, '')
    .trim();
}

function normalizeCmsValue<T>(value: T): T {
  if (typeof value === 'string') {
    return repairMojibake(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeCmsValue(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeCmsValue(entry)]),
    ) as T;
  }
  return value;
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function tryParseJson(value: string): any | null {
  const trimmed = decodeHtml(value).trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function extractJsonFromContent(content: string): any | null {
  const candidates: string[] = [];

  const scriptMatches = content.matchAll(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scriptMatches) {
    if (match[1]) candidates.push(match[1]);
  }

  const codeMatches = content.matchAll(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi);
  for (const match of codeMatches) {
    if (match[1]) candidates.push(match[1]);
  }

  const fencedMatches = content.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi);
  for (const match of fencedMatches) {
    if (match[1]) candidates.push(match[1]);
  }

  candidates.push(content);
  candidates.push(stripTags(content));

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);
    if (parsed && typeof parsed === 'object') return normalizeCmsValue(parsed);
  }

  return null;
}

function normalizePricingPayload(payload: any, isShadow: boolean) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const rootMap =
    source.prices && typeof source.prices === 'object'
      ? source.prices
      : source;
  const shadow =
    rootMap.shadow && typeof rootMap.shadow === 'object'
      ? rootMap.shadow
      : rootMap.preview && typeof rootMap.preview === 'object'
        ? rootMap.preview
        : rootMap;
  const live =
    rootMap.live && typeof rootMap.live === 'object'
      ? rootMap.live
      : rootMap.production && typeof rootMap.production === 'object'
        ? rootMap.production
        : rootMap;

  const toValidMap = (value: any): Record<string, string> => {
    const out: Record<string, string> = {};
    if (!value || typeof value !== 'object') return out;
    for (const [key, raw] of Object.entries(value)) {
      const priceId = String(raw || '').trim();
      if (key && /^price_/i.test(priceId)) out[String(key).trim()] = priceId;
    }
    return out;
  };

  const shadowPrices = toValidMap(shadow);
  const livePrices = toValidMap(live);

  return {
    meta: source.meta && typeof source.meta === 'object' ? source.meta : undefined,
    hero: source.hero && typeof source.hero === 'object' ? source.hero : undefined,
    plans: Array.isArray(source.plans) ? source.plans : [],
    faq: source.faq && typeof source.faq === 'object' ? source.faq : undefined,
    shadow: shadowPrices,
    live: livePrices,
    selectedMode: isShadow ? 'shadow' : 'live',
    selectedPrices: isShadow ? shadowPrices : livePrices,
  };
}

async function fetchPageBySlug(
  env: Env,
  slug: string,
  preferDraft: boolean,
): Promise<{ page: WpPage | null; source: string | null }> {
  const origin = getWordPressOrigin(env);
  if (!origin) return { page: null, source: null };

  const authHeader = getAuthHeader(env);
  const statuses = preferDraft
    ? ['draft', 'future', 'pending', 'private', 'publish']
    : ['publish', 'future', 'draft', 'pending', 'private'];
  const fields = 'id,slug,status,modified,content,title';

  for (const base of wpRestBases(origin)) {
    const attempts = [
      authHeader
        ? `${base}/pages?slug=${encodeURIComponent(slug)}&context=edit&status=${encodeURIComponent(
            statuses.join(','),
          )}&_fields=${encodeURIComponent(fields)}`
        : null,
      `${base}/pages?slug=${encodeURIComponent(slug)}&_fields=${encodeURIComponent(fields)}`,
    ].filter(Boolean) as string[];

    for (const url of attempts) {
      try {
        const response = await fetch(url, {
          headers: authHeader ? { Authorization: authHeader } : undefined,
        });
        if (!response.ok) continue;
        const rows = (await response.json()) as WpPage[];
        if (!Array.isArray(rows) || rows.length === 0) continue;
        const page =
          rows.find((row) => statuses.includes(String(row.status || '').toLowerCase())) || rows[0] || null;
        if (page) return { page, source: url };
      } catch {
        // try the next route shape
      }
    }
  }

  return { page: null, source: null };
}

export function createCmsRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/home', async (c) => {
    try {
      const slug = String(c.env.WP_HOME_PAGE_SLUG || DEFAULT_HOME_PAGE_SLUG).trim();
      const preferDraft = isShadowRequest(new URL(c.req.url).hostname, c.env);
      const { page, source } = await fetchPageBySlug(c.env, slug, preferDraft);
      const rendered = page?.content?.raw || page?.content?.rendered || '';
      const data = rendered ? extractJsonFromContent(rendered) : null;

      return c.json({
        data,
        meta: {
          slug,
          pageStatus: page?.status || null,
          updatedAt: page?.modified || null,
          source,
          preferDraft,
        },
      });
    } catch (error: any) {
      console.error('[cms/home]', error?.message || error);
      return c.json({ data: null, meta: { error: error?.message || 'cms_home_failed' } });
    }
  });

  app.get('/pricing', async (c) => {
    try {
      const slug = String(c.env.WP_PRICING_PAGE_SLUG || DEFAULT_PRICING_PAGE_SLUG).trim();
      const preferDraft = isShadowRequest(new URL(c.req.url).hostname, c.env);
      const { page, source } = await fetchPageBySlug(c.env, slug, preferDraft);
      const rendered = page?.content?.raw || page?.content?.rendered || '';
      const payload = rendered ? extractJsonFromContent(rendered) : null;
      const data = normalizePricingPayload(payload, preferDraft);

      return c.json({
        data,
        meta: {
          slug,
          pageStatus: page?.status || null,
          updatedAt: page?.modified || null,
          source,
          preferDraft,
        },
      });
    } catch (error: any) {
      console.error('[cms/pricing]', error?.message || error);
      return c.json({
        data: { shadow: {}, live: {}, selectedMode: 'live', selectedPrices: {} },
        meta: { error: error?.message || 'cms_pricing_failed' },
      });
    }
  });

  return app;
}
