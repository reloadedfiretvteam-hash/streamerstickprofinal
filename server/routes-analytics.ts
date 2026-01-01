import type { Express, Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('Supabase analytics: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Analytics tracking will be disabled.');
}

export function registerAnalyticsRoutes(app: Express) {
  // Track page view endpoint
  app.post("/api/track-view", async (req: Request, res: Response) => {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Analytics service not configured' });
    }

    try {
      const { path, sessionId, country } = req.body as {
        path: string;
        sessionId: string;
        country?: string;
      };

      if (!path || !sessionId) {
        return res.status(400).json({ error: 'Missing path or sessionId' });
      }

      const ua = req.headers['user-agent'] || '';
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['cf-connecting-ip'] as string) ||
        req.socket.remoteAddress ||
        'unknown';

      // hash IP for privacy
      const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

      const { error } = await supabaseAdmin.rpc('log_page_view', {
        p_path: path,
        p_session_id: sessionId,
        p_ip_hash: ipHash,
        p_user_agent: ua,
        p_country: country || null
      });

      if (error) {
        console.error('log_page_view error', error);
        return res.status(500).json({ error: 'Supabase RPC failed' });
      }

      return res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('track-view error', e);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  });
}

