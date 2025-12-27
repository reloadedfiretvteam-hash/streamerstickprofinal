import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { createProductRoutes } from './routes/products';
import { createCheckoutRoutes } from './routes/checkout';
import { createOrderRoutes } from './routes/orders';
import { createAdminRoutes } from './routes/admin';
import { createWebhookRoutes } from './routes/webhook';
import { createVisitorRoutes } from './routes/visitors';
import { createCustomerRoutes } from './routes/customers';
import { createTrialRoutes } from './routes/trial';
import { createAuthRoutes, authMiddleware } from './routes/auth';
import { createBlogRoutes } from './routes/blog';
import { createReminderRoutes } from './routes/reminders';

export interface Env {
  // Database connection uses Supabase client (VITE_SUPABASE_URL + SUPABASE_SERVICE_KEY)
  // DATABASE_URL is not used - removed to avoid confusion
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  JWT_SECRET?: string;
  NODE_ENV?: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://streamstickpro.com', 'https://www.streamstickpro.com', 'https://secure.streamstickpro.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  credentials: true,
}));

app.route('/api/auth', createAuthRoutes());
app.route('/api/products', createProductRoutes());
app.route('/api/checkout', createCheckoutRoutes());
app.route('/api/orders', createOrderRoutes());
app.use('/api/admin/*', authMiddleware);
app.route('/api/admin', createAdminRoutes());
app.route('/api/stripe', createWebhookRoutes());
app.route('/api/track', createVisitorRoutes());
app.route('/api/customer', createCustomerRoutes());
app.route('/api/free-trial', createTrialRoutes());
app.route('/api/blog', createBlogRoutes());
app.route('/api/reminders', createReminderRoutes());

app.post('/api/track-cart', async (c) => {
  try {
    const { getStorage } = await import('./helpers');
    const storage = getStorage(c.env);
    const body = await c.req.json();
    const { email, customerName, cartItems, totalAmount } = body;

    if (!email || !cartItems || cartItems.length === 0) {
      return c.json({ error: 'Email and cart items required' }, 400);
    }

    await storage.trackAbandonedCart({
      email,
      customerName: customerName || null,
      cartItems,
      totalAmount: totalAmount || 0,
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking cart:', error);
    return c.json({ success: true });
  }
});

app.get('/api/stripe/config', async (c) => {
  const publishableKey = c.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return c.json({ error: 'Stripe not configured' }, 500);
  }
  return c.json({ publishableKey });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.1' });
});

  app.get('/api/debug/webhook-test', async (c) => {
    // Test endpoint to verify webhook configuration
    return c.json({
      webhookEndpoint: 'https://secure.streamstickpro.com/api/stripe/webhook',
      hasWebhookSecret: !!c.env.STRIPE_WEBHOOK_SECRET,
      hasResendKey: !!c.env.RESEND_API_KEY,
      hasFromEmail: !!c.env.RESEND_FROM_EMAIL,
      fromEmail: c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com',
      message: 'If emails not working, check Stripe Dashboard → Webhooks → URL should be: https://secure.streamstickpro.com/api/stripe/webhook',
      instructions: [
        '1. Go to Stripe Dashboard → Webhooks',
        '2. Verify webhook URL is: https://secure.streamstickpro.com/api/stripe/webhook',
        '3. If URL contains "supabase.co", DELETE it and create new webhook',
        '4. Ensure events include: checkout.session.completed and payment_intent.succeeded',
        '5. Copy webhook signing secret (whsec_...) and add as STRIPE_WEBHOOK_SECRET in Cloudflare',
      ],
    });
  });

  app.get('/api/debug/visitors', async (c) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      
      // Check if visitors table exists and get schema
      const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'visitors' 
          ORDER BY ordinal_position;
        `
      }).catch(() => ({ data: null, error: { message: 'Cannot query table schema directly' } }));
      
      // Try to query visitors table
      const { data: visitors, error: queryError, count } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .limit(5);
      
      // Try a test insert (then rollback)
      const testVisitor = {
        session_id: 'test-session-debug',
        page_url: '/test',
        referrer: null,
        user_agent: 'Debug-Test',
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
      
      let insertTest = { success: false, error: '' };
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('visitors')
          .insert(testVisitor)
          .select()
          .single();
        
        if (!insertError && inserted) {
          // Delete the test record
          await supabase.from('visitors').delete().eq('id', inserted.id);
          insertTest = { success: true, error: '' };
        } else {
          insertTest = { success: false, error: insertError?.message || 'Unknown error' };
        }
      } catch (err: any) {
        insertTest = { success: false, error: err.message || String(err) };
      }
      
      return c.json({
        tableExists: !queryError || queryError.code !== '42P01',
        visitorCount: count || 0,
        sampleVisitors: visitors || [],
        insertTest,
        errors: {
          query: queryError?.message,
          code: queryError?.code,
          hint: queryError?.hint,
        },
        migrationStatus: {
          hasIpAddress: tableInfo?.some((col: any) => col.column_name === 'ip_address') || false,
          hasCountry: tableInfo?.some((col: any) => col.column_name === 'country') || false,
          hasRegion: tableInfo?.some((col: any) => col.column_name === 'region') || false,
          missingColumns: [
            'ip_address',
            'country',
            'country_code',
            'region',
            'region_code',
            'city',
            'latitude',
            'longitude',
            'timezone',
            'isp',
            'is_proxy'
          ].filter(col => !tableInfo?.some((t: any) => t.column_name === col)),
        },
        recommendation: insertTest.success 
          ? 'Visitor tracking should work. Check if frontend is calling /api/track endpoint.'
          : insertTest.error.includes('column') 
            ? 'Run migration 20250115000001_add_missing_visitor_columns.sql in Supabase SQL Editor'
            : insertTest.error.includes('permission') || insertTest.error.includes('policy')
              ? 'Check RLS policies allow inserts. Run the migration to update policies.'
              : `Error: ${insertTest.error}. Check Supabase logs for details.`
      });
    } catch (error: any) {
      return c.json({ error: error.message, stack: error.stack }, 500);
    }
  });

  app.get('/api/debug', async (c) => {
  const supabaseUrl = c.env.VITE_SUPABASE_URL || '';
  const supabaseKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Test Supabase connection
  let supabaseTest = { connected: false, error: '', productCount: 0 };
  try {
    const { getStorage } = await import('./helpers');
    const storage = getStorage(c.env);
    const products = await storage.getRealProducts();
    supabaseTest = { connected: true, error: '', productCount: products.length };
  } catch (err: any) {
    supabaseTest = { connected: false, error: err.message || String(err), productCount: 0 };
  }
  
  // Test Stripe connection
  let stripeTest = { connected: false, error: '' };
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    await stripe.products.list({ limit: 1 });
    stripeTest = { connected: true, error: '' };
  } catch (err: any) {
    stripeTest = { connected: false, error: err.message || String(err) };
  }
  
  return c.json({
    supabase: {
      hasUrl: !!supabaseUrl,
      urlPrefix: supabaseUrl.substring(0, 30) || 'none',
      hasKey: !!supabaseKey,
      keyLength: supabaseKey.length,
      keyPrefix: supabaseKey.substring(0, 10) || 'none',
      test: supabaseTest,
    },
    stripe: {
      hasSecretKey: !!c.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!c.env.STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!c.env.STRIPE_WEBHOOK_SECRET,
      secretKeyPrefix: c.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'none',
      test: stripeTest,
    },
    email: {
      hasResendKey: !!c.env.RESEND_API_KEY,
      hasFromEmail: !!c.env.RESEND_FROM_EMAIL,
      fromEmail: c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com',
    },
    auth: {
      hasAdminUsername: !!c.env.ADMIN_USERNAME,
      hasAdminPassword: !!c.env.ADMIN_PASSWORD,
      hasJwtSecret: !!c.env.JWT_SECRET,
    },
    nodeEnv: c.env.NODE_ENV || 'not set',
  });
});

app.get('*', async (c) => {
  try {
    return await c.env.ASSETS.fetch(c.req.raw);
  } catch {
    return c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)));
  }
});

export default app;
