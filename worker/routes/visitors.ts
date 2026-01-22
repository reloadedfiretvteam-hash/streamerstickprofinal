import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

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

      const ipAddress = c.req.header('cf-connecting-ip') || 
                        c.req.header('x-forwarded-for')?.split(',')[0] || 
                        'unknown';

      const cfData = (c.req.raw as any).cf || {};
      
      const visitor = await storage.trackVisitor({
        sessionId,
        pageUrl,
        referrer: referrer || null,
        userAgent: userAgent || c.req.header('user-agent') || null,
        ipAddress,
        country: cfData.country || null,
        countryCode: cfData.country || null,
        region: cfData.region || null,
        regionCode: cfData.regionCode || null,
        city: cfData.city || null,
        latitude: cfData.latitude?.toString() || null,
        longitude: cfData.longitude?.toString() || null,
        timezone: cfData.timezone || null,
        isp: cfData.asOrganization || null,
        isProxy: false,
      });

      return c.json({ success: true, visitorId: visitor.id });
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

  app.get('/stats', async (c) => {
    try {
      if (!c.env.VITE_SUPABASE_URL) {
        return c.json({ error: 'Supabase URL not configured' }, 500);
      }
      
      const storage = getStorage(c.env);
      let stats;
      try {
        stats = await storage.getVisitorStats();
      } catch (statsError: any) {
        console.error('[VISITOR_STATS] Error getting stats:', statsError?.message || statsError);
        // Return empty stats instead of failing completely
        stats = {
          totalVisitors: 0,
          todayVisitors: 0,
          weekVisitors: 0,
          monthVisitors: 0,
          onlineNow: 0,
          recentVisitors: []
        };
      }
      
      // Enhance with additional analytics
      // Use service key explicitly to bypass RLS
      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // Get detailed visitor data - service key should bypass RLS
      const { data: allVisitors, error: visitorsError } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);
      
      if (visitorsError) {
        console.error('[VISITOR_STATS] Error fetching visitors:', visitorsError?.message || visitorsError);
      }
      
      // Calculate geo stats
      const countryStats: Record<string, number> = {};
      (allVisitors || []).forEach((v: any) => {
        if (v.country) {
          countryStats[v.country] = (countryStats[v.country] || 0) + 1;
        }
      });
      
      const topCountries = Object.entries(countryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
      
      // Ensure monthVisitors is included (storage.getVisitorStats should return it)
      const finalStats = {
        ...stats,
        monthVisitors: stats.monthVisitors || 0, // Ensure it exists
        topCountries,
        countryBreakdown: topCountries, // alias for compatibility
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 }, // Default if not calculated
        liveVisitors: stats.recentVisitors || [], // Map recentVisitors to liveVisitors
      };
      
      return c.json({ data: finalStats });
    } catch (error: any) {
      console.error('[VISITOR_STATS] Unexpected error:', error?.message || error);
      
      // Always return JSON, even on error
      return c.json({ 
        error: "Failed to fetch visitor stats", 
        details: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  });

  return app;
}
