/**
 * CMS routes — no WordPress. Content comes from:
 * - Supabase `page_edits` (Visual Editor) via /page-overrides
 * - Supabase `site_settings.cms_pricing_json` for /pricing (optional)
 * - Env `CMS_PRICING_JSON` fallback when DB row is empty
 * - /home and /shadow return no base document; clients use defaults + page_edits
 */
import { Hono } from 'hono';
import type { Env } from '../index';
import { getStorage } from '../helpers';

const CACHE_SECONDS = 300;

function hostsFromEnv(raw?: string | null): string[] {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

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

/** Secure / cloaked hosts use `prices.shadow` from pricing payload when present. */
function useShadowPriceMap(hostname: string, env: Env): boolean {
  if (isDefaultSecureStreamstickHost(hostname)) return true;
  if (hostnameInList(hostname, hostsFromEnv(env.VITE_SECURE_HOSTS))) return true;
  if (hostnameInList(hostname, hostsFromEnv(env.SHADOW_HOSTS))) return true;
  return false;
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
  const live = toMap(root.live ?? root.production ?? root);
  return {
    meta: src.meta ?? undefined,
    hero: src.hero ?? undefined,
    plans: Array.isArray(src.plans) ? src.plans : [],
    faq: src.faq ?? undefined,
    shadow,
    live,
    selectedMode: isShadow ? 'shadow' : 'live',
    selectedPrices: isShadow ? shadow : live,
  };
}

async function loadPricingPayloadFromStorage(env: Env): Promise<unknown | null> {
  try {
    const url = env.VITE_SUPABASE_URL;
    const key =
      env.SUPABASE_SERVICE_KEY ||
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_SERVICE_ROLL_KEY ||
      env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'cms_pricing_json')
      .maybeSingle();
    const raw = String(data?.setting_value || '').trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadPricingPayloadFromEnv(env: Env): unknown | null {
  const raw = String(env.CMS_PRICING_JSON || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createCmsRoutes() {
  const app = new Hono<{ Bindings: Env }>();

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

  /** No remote CMS — base document is null; client merges page_edits (main) onto MainStore defaults. */
  app.get('/home', async (c) => {
    return c.json(
      {
        data: null,
        meta: {
          source: 'supabase-page-edits',
          hint: 'Use Admin Visual Editor with pageId=main',
        },
      },
      200,
      { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
    );
  });

  app.get('/shadow', async (c) => {
    return c.json(
      {
        data: null,
        meta: {
          source: 'supabase-page-edits',
          hint: 'Use Admin Visual Editor with pageId=shadow',
        },
      },
      200,
      { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
    );
  });

  app.get('/pricing', async (c) => {
    try {
      const hostname = new URL(c.req.url).hostname;
      const isShadowHost = useShadowPriceMap(hostname, c.env);
      let payload = await loadPricingPayloadFromStorage(c.env);
      if (payload == null) payload = loadPricingPayloadFromEnv(c.env);
      const data = normalizePricing(payload, isShadowHost);
      return c.json(
        {
          data,
          meta: {
            source: payload ? 'site_settings_or_env' : 'empty',
            isShadowHost,
          },
        },
        200,
        { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
      );
    } catch (e: any) {
      return c.json(
        {
          data: { shadow: {}, live: {}, selectedMode: 'live', selectedPrices: {}, plans: [] },
          meta: { error: e?.message },
        },
        200,
      );
    }
  });

  /** Lightweight health: confirms worker CMS routes are up (no WordPress). */
  app.get('/health', async (c) => {
    return c.json(
      {
        ok: true,
        mode: 'supabase',
        wordpress: false,
        pricing: {
          from: 'site_settings.cms_pricing_json or CMS_PRICING_JSON env',
        },
        home: { source: 'page_edits + client defaults' },
        shadow: { source: 'page_edits + client defaults' },
      },
      200,
      { 'Cache-Control': 'no-store' },
    );
  });

  /** Deprecated: WordPress page proxy removed. */
  app.get('/page/:slug', async (c) => {
    return c.json(
      { error: 'deprecated', slug: c.req.param('slug'), use: 'Visual Editor + site_settings cms_pricing_json' },
      410,
    );
  });

  app.get('/pages', async (c) => {
    return c.json({ data: [], deprecated: true }, 200);
  });

  app.get('/posts', async (c) => {
    return c.json({ data: [], total: 0, deprecated: true }, 200);
  });

  return app;
}
