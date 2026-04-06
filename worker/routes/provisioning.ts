import { Hono } from 'hono';
import { processPendingProvisioningJobs } from '../lib/provisioning';
import type { Env } from '../index';

function hasValidInternalCronSecret(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  const expected = (c.env.INTERNAL_CRON_SECRET || '').trim();
  if (!expected) return false;
  const provided = (c.req.header('x-internal-cron-secret') || '').trim();
  return provided === expected;
}

export function createProvisioningRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/process-scheduled', async (c) => {
    if (!hasValidInternalCronSecret(c)) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    try {
      const limitRaw = c.req.query('limit');
      const limit = Math.max(1, Math.min(20, Number(limitRaw || '5') || 5));
      const jobs = await processPendingProvisioningJobs(c.env, limit);
      return c.json({
        success: true,
        processed: jobs.length,
        jobs: jobs.map((job) => ({
          id: job.id,
          orderId: job.orderId,
          status: job.status,
          attemptCount: job.attemptCount,
          provider: job.provider,
          lastError: job.lastError,
        })),
      });
    } catch (error: any) {
      console.error('[PROVISIONING] Scheduled processing failed:', error);
      return c.json({ success: false, error: error?.message || 'Processing failed' }, 500);
    }
  });

  return app;
}
