import { Hono } from 'hono';
import { createStorage } from '../storage';
import type { Env } from '../index';

export function createVisitorRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', async (c) => {
    try {
      const storage = createStorage(c.env.DATABASE_URL);
      const body = await c.req.json();
      const { sessionId, pageUrl, referrer, userAgent } = body;

      if (!sessionId || !pageUrl) {
        return c.json({ error: "Session ID and page URL are required" }, 400);
      }

      const ipAddress = c.req.header('cf-connecting-ip') || 
                        c.req.header('x-forwarded-for')?.split(',')[0] || 
                        'unknown';

      const cfData = (c.req.raw as any).cf || {};
      
      await storage.trackVisitor({
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

      return c.json({ success: true });
    } catch (error: any) {
      console.error("Error tracking visitor:", error);
      return c.json({ error: "Failed to track visitor" }, 500);
    }
  });

  return app;
}
