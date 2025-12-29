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
      // Use service key explicitly to bypass RLS for inserts
      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);
      
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
      
      // Insert directly using Supabase client with service key (bypasses RLS)
      const dbVisitor = {
        session_id: sessionId,
        page_url: pageUrl,
        referrer: referrer || null,
        user_agent: userAgent || c.req.header('user-agent') || null,
        ip_address: ipAddress,
        country: cfData.country || null,
        country_code: cfData.country || null,
        region: cfData.region || null,
        region_code: cfData.regionCode || null,
        city: cfData.city || null,
        latitude: cfData.latitude?.toString() || null,
        longitude: cfData.longitude?.toString() || null,
        timezone: cfData.timezone || null,
        isp: cfData.asOrganization || null,
        is_proxy: false,
      };

      // Try full insert first
      let { data: insertedVisitor, error: insertError } = await supabase
        .from('visitors')
        .insert(dbVisitor)
        .select()
        .single();

      // If full insert fails due to missing columns, try minimal insert
      if (insertError && (insertError.code === '42703' || insertError.message.includes('column'))) {
        console.warn('[VISITOR_TRACK] Column error, trying minimal insert:', insertError.message);
        const minimalVisitor = {
          session_id: dbVisitor.session_id,
          page_url: dbVisitor.page_url,
          referrer: dbVisitor.referrer,
          user_agent: dbVisitor.user_agent,
        };
        const retryResult = await supabase
          .from('visitors')
          .insert(minimalVisitor)
          .select()
          .single();
        insertedVisitor = retryResult.data;
        insertError = retryResult.error;
      }

      if (insertError) {
        console.error('[VISITOR_TRACK] Insert error:', insertError);
        throw insertError;
      }

      if (!insertedVisitor) {
        throw new Error('Visitor insert succeeded but no data returned');
      }

      console.log('[VISITOR_TRACK] Successfully tracked visitor:', insertedVisitor.id);
      return c.json({ 
        success: true, 
        visitorId: insertedVisitor.id,
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
