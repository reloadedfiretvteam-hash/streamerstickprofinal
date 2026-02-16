import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

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

export function createVisitorRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  // Health check endpoint for visitor tracking
  app.get('/health', async (c) => {
    return c.json({ status: 'ok', message: 'Visitor tracking endpoint is active' });
  });

  // Test endpoint - manually insert a visitor to verify database works
  app.post('/test', async (c) => {
    try {
      // Use service key explicitly to bypass RLS
      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);
      
      const testVisitorData = {
        session_id: 'test-' + Date.now(),
        page_url: 'https://streamstickpro.com/test',
        referrer: 'https://test.com',
        user_agent: 'Test-Agent',
        ip_address: '127.0.0.1',
        country: 'US',
        country_code: 'US',
        region: 'Test',
        region_code: 'TS',
        city: 'Test City',
        latitude: '0',
        longitude: '0',
        timezone: 'UTC',
        isp: 'Test ISP',
        is_proxy: false,
      };
      
      // Try full insert first
      let { data: insertedVisitor, error: insertError } = await supabase
        .from('visitors')
        .insert(testVisitorData)
        .select()
        .single();
      
      // If full insert fails, try minimal
      if (insertError && (insertError.code === '42703' || insertError.message.includes('column'))) {
        const minimalVisitor = {
          session_id: testVisitorData.session_id,
          page_url: testVisitorData.page_url,
          referrer: testVisitorData.referrer,
          user_agent: testVisitorData.user_agent,
        };
        const retryResult = await supabase
          .from('visitors')
          .insert(minimalVisitor)
          .select()
          .single();
        insertedVisitor = retryResult.data;
        insertError = retryResult.error;
      }
      
      if (insertError || !insertedVisitor) {
        throw insertError || new Error('Insert failed but no error returned');
      }
      
      // Now try to read it back
      const storage = getStorage(c.env);
      const stats = await storage.getVisitorStats();
      
      return c.json({
        success: true,
        inserted: {
          id: insertedVisitor.id,
          sessionId: insertedVisitor.session_id,
          pageUrl: insertedVisitor.page_url,
        },
        stats: {
          totalVisitors: stats.totalVisitors,
          todayVisitors: stats.todayVisitors,
          recentCount: stats.recentVisitors.length,
        },
        message: 'Test visitor inserted and read back successfully'
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        message: 'Failed to insert test visitor. Check migration has been run.'
      }, 500);
    }
  });

  app.post('/', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { sessionId, pageUrl, referrer, userAgent } = body;

      if (!sessionId || !pageUrl) {
        return c.json({ error: "Session ID and page URL are required" }, 400);
      }

      const cfData = (c.req.raw as any).cf || {};
      const ua = (userAgent || c.req.header('user-agent') || '').toString();

      // Stable visitor cookie (unique visitor). If missing, create it.
      const cookies = parseCookies(c.req.header('cookie'));
      let vid = cookies['vid'];
      let setCookie: string | null = null;
      if (!vid) {
        vid = crypto.randomUUID();
        setCookie = setCookieHeader('vid', vid, 60 * 60 * 24 * 30);
      }

      const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown';
      const salt = (c.env as any).VISITOR_HASH_SALT || c.env.JWT_SECRET || 'streamstickpro';
      const ip_hash = await sha256Hex(`vid:${vid}|salt:${salt}`) || await sha256Hex(`ip:${ip}|ua:${ua}|salt:${salt}`);

      const url = new URL(pageUrl, 'https://streamstickpro.com');
      const page = url.pathname || '/';

      await storage.trackVisitByHash({
        ip_hash,
        state: cfData.region ?? null,
        city: cfData.city ?? null,
        country: cfData.country ?? null,
        user_agent: ua || null,
        session_id: sessionId || null,
        page,
        page_url: pageUrl || null,
        referrer: referrer || null,
        is_bot: isBotUA(ua),
      });

      if (setCookie) c.header('Set-Cookie', setCookie);
      return c.json({ success: true });
    } catch (error: any) {
      console.error("Error tracking visitor:", error);
      return c.json({ 
        error: "Failed to track visitor", 
        details: error.message,
        code: error.code,
        hint: error.hint,
        suggestion: error.code === '42P01' ? 'Table "visitors" does not exist. Run migrations.' :
                   error.code === '42703' ? 'Column does not exist. Run migration 20250115000001_add_missing_visitor_columns.sql' :
                   error.code === '42501' ? 'Permission denied. Check RLS policies allow anonymous inserts.' :
                   'Check Cloudflare Worker logs for details'
      }, 500);
    }
  });

  // Live visitors by state/city (deduplicated); requires admin auth when under /api/admin/visitors
  app.get('/live', async (c) => {
    try {
      const storage = getStorage(c.env);
      const rows = await storage.getLiveVisitorsByLocation();
      return c.json({ data: rows });
    } catch (err: any) {
      console.error('[visitors/live]', err?.message || err);
      return c.json({ error: 'Failed to fetch live visitors', details: err?.message }, 500);
    }
  });

  app.get('/stats', async (c) => {
    try {
      if (!c.env.VITE_SUPABASE_URL) {
        return c.json({ error: 'Supabase URL not configured' }, 500);
      }

      const storage = getStorage(c.env);
      const stats = await storage.getVisitorStats();

      return c.json({
        data: {
          totalVisitors: stats.totalVisitors,
          todayVisitors: stats.todayVisitors,
          yesterdayVisitors: stats.yesterdayVisitors,
          weekVisitors: stats.weekVisitors,
          monthVisitors: stats.monthVisitors,
          onlineNow: stats.onlineNow,
          deviceBreakdown: stats.deviceBreakdown,
          topCountries: stats.topCountries,
          countryBreakdown: stats.topCountries,
          liveVisitors: stats.recentVisitors,
        },
      });
    } catch (error: any) {
      console.error('[VISITOR_STATS] Unexpected error:', error?.message || error);
      return c.json({
        error: 'Failed to fetch visitor stats',
        details: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      }, 500);
    }
  });

  return app;
}
