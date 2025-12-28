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
      const storage = getStorage(c.env);
      const testVisitor = await storage.trackVisitor({
        sessionId: 'test-' + Date.now(),
        pageUrl: 'https://streamstickpro.com/test',
        referrer: 'https://test.com',
        userAgent: 'Test-Agent',
        ipAddress: '127.0.0.1',
        country: 'US',
        countryCode: 'US',
        region: 'Test',
        regionCode: 'TS',
        city: 'Test City',
        latitude: '0',
        longitude: '0',
        timezone: 'UTC',
        isp: 'Test ISP',
        isProxy: false,
      });
      
      // Now try to read it back
      const stats = await storage.getVisitorStats();
      
      return c.json({
        success: true,
        inserted: {
          id: testVisitor.id,
          sessionId: testVisitor.sessionId,
          pageUrl: testVisitor.pageUrl,
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
        console.warn('[VISITOR_TRACK] Missing required fields:', { hasSessionId: !!sessionId, hasPageUrl: !!pageUrl });
        return c.json({ error: "Session ID and page URL are required" }, 400);
      }

      console.log('[VISITOR_TRACK] Tracking visitor:', { sessionId, pageUrl: pageUrl.substring(0, 50) });

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

      console.log('[VISITOR_TRACK] Successfully tracked visitor:', visitor.id);
      return c.json({ 
        success: true, 
        visitorId: visitor.id,
        message: 'Visitor tracked successfully'
      });
    } catch (error: any) {
      console.error("[VISITOR_TRACK] Error tracking visitor:", error);
      console.error("[VISITOR_TRACK] Error details:", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        stack: error.stack?.substring(0, 200)
      });
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

  return app;
}
