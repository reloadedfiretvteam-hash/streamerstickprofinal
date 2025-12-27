import { Hono } from 'hono';
import { getStorage } from '../helpers';
import type { Env } from '../index';

export function createVisitorRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', async (c) => {
    try {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitors.ts:8',message:'Visitor tracking endpoint called',timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'D'})}).catch(()=>{});
      }
      // #endregion
      
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { sessionId, pageUrl, referrer, userAgent } = body;

      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitors.ts:16',message:'Received tracking data',data:{hasSessionId:!!sessionId,hasPageUrl:!!pageUrl,pageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'E'})}).catch(()=>{});
      }
      // #endregion

      if (!sessionId || !pageUrl) {
        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitors.ts:22',message:'Missing required fields',data:{hasSessionId:!!sessionId,hasPageUrl:!!pageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'F'})}).catch(()=>{});
        }
        // #endregion
        return c.json({ error: "Session ID and page URL are required" }, 400);
      }

      const ipAddress = c.req.header('cf-connecting-ip') || 
                        c.req.header('x-forwarded-for')?.split(',')[0] || 
                        'unknown';

      const cfData = (c.req.raw as any).cf || {};
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitors.ts:32',message:'About to call storage.trackVisitor',data:{sessionId,pageUrl,ipAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'G'})}).catch(()=>{});
      }
      // #endregion
      
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

      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitors.ts:50',message:'Visitor tracked successfully',data:{visitorId:visitor.id},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'H'})}).catch(()=>{});
      }
      // #endregion

      return c.json({ success: true });
    } catch (error: any) {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitors.ts:57',message:'Visitor tracking error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'I'})}).catch(()=>{});
      }
      // #endregion
      console.error("Error tracking visitor:", error);
      return c.json({ error: "Failed to track visitor" }, 500);
    }
  });

  return app;
}
