import { Hono } from 'hono';
import { sendEmail } from '../email-providers';
import type { Env } from '../index';

async function getSupabase(env: Env) {
  const mod = await import('@supabase/supabase-js');
  const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLL_KEY || env.VITE_SUPABASE_ANON_KEY;
  return mod.createClient(env.VITE_SUPABASE_URL, serviceKey);
}

function buildUnsubFooter(email: string): string {
  const encoded = encodeURIComponent(email);
  return '<div style="text-align:center;margin-top:30px;padding:20px;border-top:1px solid #eee;color:#999;font-size:12px"><p>You received this because you signed up at StreamStickPro.</p><p><a href="https://streamstickpro.com/unsubscribe?email=' + encoded + '" style="color:#999">Unsubscribe</a></p></div>';
}

export function createMarketingRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/contacts', async (c) => {
    const supabase = await getSupabase(c.env);
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) return c.json({ error: error.message }, 500);
    return c.json(data || []);
  });

  app.get('/contacts/count', async (c) => {
    const source = c.req.query('source');
    const subscribed = c.req.query('subscribed');
    const supabase = await getSupabase(c.env);
    let query = supabase.from('contacts').select('id', { count: 'exact', head: true });
    if (source) query = query.eq('source', source);
    if (subscribed) query = query.eq('is_subscribed', subscribed === 'true');
    const { count, error } = await query;
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ count: count || 0 });
  });

  app.patch('/contacts/:id/unsubscribe', async (c) => {
    const supabase = await getSupabase(c.env);
    const { error } = await supabase.from('contacts').update({ is_subscribed: false }).eq('id', c.req.param('id'));
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  });

  app.patch('/contacts/:id/resubscribe', async (c) => {
    const supabase = await getSupabase(c.env);
    const { error } = await supabase.from('contacts').update({ is_subscribed: true }).eq('id', c.req.param('id'));
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  });

  app.get('/campaigns', async (c) => {
    const supabase = await getSupabase(c.env);
    const { data, error } = await supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
    if (error) return c.json({ error: error.message }, 500);
    return c.json(data || []);
  });

  app.get('/campaigns/:id', async (c) => {
    const supabase = await getSupabase(c.env);
    const { data, error } = await supabase.from('email_campaigns').select('*, email_sends(*)').eq('id', c.req.param('id')).single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  });

  app.post('/campaigns', async (c) => {
    const body = await c.req.json();
    const supabase = await getSupabase(c.env);
    const { data, error } = await supabase.from('email_campaigns').insert({
      name: body.name,
      subject: body.subject,
      body_html: body.bodyHtml,
      body_text: body.bodyText || null,
      segment: body.segment || null,
      status: 'draft',
    }).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
  });

  app.put('/campaigns/:id', async (c) => {
    const body = await c.req.json();
    const supabase = await getSupabase(c.env);
    const u: Record<string, any> = {};
    if (body.name !== undefined) u.name = body.name;
    if (body.subject !== undefined) u.subject = body.subject;
    if (body.bodyHtml !== undefined) u.body_html = body.bodyHtml;
    if (body.bodyText !== undefined) u.body_text = body.bodyText;
    if (body.segment !== undefined) u.segment = body.segment;
    if (body.status !== undefined) u.status = body.status;
    const { data, error } = await supabase.from('email_campaigns').update(u).eq('id', c.req.param('id')).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  });

  app.delete('/campaigns/:id', async (c) => {
    const supabase = await getSupabase(c.env);
    const { error } = await supabase.from('email_campaigns').delete().eq('id', c.req.param('id'));
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
  });

  app.post('/campaigns/:id/preview-count', async (c) => {
    const supabase = await getSupabase(c.env);
    const { data: cmp } = await supabase.from('email_campaigns').select('segment').eq('id', c.req.param('id')).single();
    let q = supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('is_subscribed', true);
    if (cmp?.segment?.source) q = q.eq('source', cmp.segment.source);
    const { count, error } = await q;
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ count: count || 0 });
  });

  app.post('/campaigns/:id/test-send', async (c) => {
    const body = await c.req.json();
    if (!body.email) return c.json({ error: 'Test email required' }, 400);
    const supabase = await getSupabase(c.env);
    const { data: cmp, error } = await supabase.from('email_campaigns').select('*').eq('id', c.req.param('id')).single();
    if (error || !cmp) return c.json({ error: 'Campaign not found' }, 404);
    const footer = buildUnsubFooter(body.email);
    const html = (cmp.body_html || '') + footer;
    const result = await sendEmail({ to: body.email, subject: '[TEST] ' + cmp.subject, html }, c.env);
    if (!result.success) return c.json({ error: result.error || 'Send failed' }, 500);
    return c.json({ success: true, provider: result.provider, providerId: result.providerId });
  });

  app.post('/campaigns/:id/send', async (c) => {
    const id = c.req.param('id');
    const supabase = await getSupabase(c.env);
    const { data: cmp, error: cErr } = await supabase.from('email_campaigns').select('*').eq('id', id).single();
    if (cErr || !cmp) return c.json({ error: 'Campaign not found' }, 404);
    if (cmp.status === 'sent') return c.json({ error: 'Already sent' }, 400);
    await supabase.from('email_campaigns').update({ status: 'sending' }).eq('id', id);
    let cq = supabase.from('contacts').select('*').eq('is_subscribed', true);
    if (cmp.segment?.source) cq = cq.eq('source', cmp.segment.source);
    const { data: contacts } = await cq;
    let sent = 0, failed = 0;
    for (const ct of (contacts || [])) {
      try {
        const footer = buildUnsubFooter(ct.email);
        const res = await sendEmail({ to: ct.email, subject: cmp.subject, html: (cmp.body_html || '') + footer }, c.env);
        await supabase.from('email_sends').insert({ campaign_id: id, contact_id: ct.id, status: res.success ? 'sent' : 'failed', provider_message_id: res.providerId || null, error_message: res.error || null, sent_at: res.success ? new Date().toISOString() : null });
        if (res.success) sent++; else failed++;
      } catch (err: any) {
        failed++;
        await supabase.from('email_sends').insert({ campaign_id: id, contact_id: ct.id, status: 'failed', error_message: err.message });
      }
    }
    await supabase.from('email_campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    return c.json({ success: true, sent, failed, total: (contacts || []).length });
  });

  app.post('/send-to-selected', async (c) => {
    const body = await c.req.json();
    if (!body.contactIds?.length || !body.subject || !body.bodyHtml) return c.json({ error: 'contactIds, subject, bodyHtml required' }, 400);
    const supabase = await getSupabase(c.env);
    const { data: contacts } = await supabase.from('contacts').select('*').in('id', body.contactIds);
    let sent = 0, failed = 0;
    for (const ct of (contacts || [])) {
      try {
        const footer = buildUnsubFooter(ct.email);
        const res = await sendEmail({ to: ct.email, subject: body.subject, html: body.bodyHtml + footer }, c.env);
        if (res.success) sent++; else failed++;
      } catch { failed++; }
    }
    return c.json({ success: true, sent, failed });
  });

  return app;
}
