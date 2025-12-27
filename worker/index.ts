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
      
      // Try to query visitors table
      const { data: visitors, error: queryError, count } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .limit(5);
      
      // Try a test insert with minimal required fields first
      const testVisitorMinimal = {
        session_id: 'test-session-debug-' + Date.now(),
        page_url: '/test',
        referrer: null,
        user_agent: 'Debug-Test',
      };
      
      let insertTestMinimal = { success: false, error: '', errorCode: '' };
      try {
        const { data: insertedMinimal, error: insertErrorMinimal } = await supabase
          .from('visitors')
          .insert(testVisitorMinimal)
          .select()
          .single();
        
        if (!insertErrorMinimal && insertedMinimal) {
          // Delete the test record
          await supabase.from('visitors').delete().eq('id', insertedMinimal.id);
          insertTestMinimal = { success: true, error: '', errorCode: '' };
        } else {
          insertTestMinimal = { 
            success: false, 
            error: insertErrorMinimal?.message || 'Unknown error',
            errorCode: insertErrorMinimal?.code || ''
          };
        }
      } catch (err: any) {
        insertTestMinimal = { 
          success: false, 
          error: err.message || String(err),
          errorCode: err.code || ''
        };
      }
      
      // Try a test insert with all columns
      const testVisitorFull = {
        session_id: 'test-session-full-' + Date.now(),
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
      
      let insertTestFull = { success: false, error: '', errorCode: '' };
      if (insertTestMinimal.success) {
        try {
          const { data: insertedFull, error: insertErrorFull } = await supabase
            .from('visitors')
            .insert(testVisitorFull)
            .select()
            .single();
          
          if (!insertErrorFull && insertedFull) {
            // Delete the test record
            await supabase.from('visitors').delete().eq('id', insertedFull.id);
            insertTestFull = { success: true, error: '', errorCode: '' };
          } else {
            insertTestFull = { 
              success: false, 
              error: insertErrorFull?.message || 'Unknown error',
              errorCode: insertErrorFull?.code || ''
            };
          }
        } catch (err: any) {
          insertTestFull = { 
            success: false, 
            error: err.message || String(err),
            errorCode: err.code || ''
          };
        }
      }
      
      // Check which columns exist by trying to select them
      const sampleVisitor = visitors && visitors.length > 0 ? visitors[0] : null;
      const hasColumns = {
        ip_address: sampleVisitor?.ip_address !== undefined,
        country: sampleVisitor?.country !== undefined,
        country_code: sampleVisitor?.country_code !== undefined,
        region: sampleVisitor?.region !== undefined,
        region_code: sampleVisitor?.region_code !== undefined,
        city: sampleVisitor?.city !== undefined,
        latitude: sampleVisitor?.latitude !== undefined,
        longitude: sampleVisitor?.longitude !== undefined,
        timezone: sampleVisitor?.timezone !== undefined,
        isp: sampleVisitor?.isp !== undefined,
        is_proxy: sampleVisitor?.is_proxy !== undefined,
      };
      
      const missingColumns = Object.entries(hasColumns)
        .filter(([_, exists]) => !exists)
        .map(([col, _]) => col);
      
      return c.json({
        tableExists: !queryError || queryError.code !== '42P01',
        visitorCount: count || 0,
        sampleVisitorCount: visitors?.length || 0,
        insertTestMinimal,
        insertTestFull,
        hasColumns,
        missingColumns,
        errors: {
          query: queryError?.message,
          code: queryError?.code,
          hint: queryError?.hint,
        },
        recommendation: 
          queryError?.code === '42P01' 
            ? 'Table "visitors" does not exist. Run the initial migration: 20251101185416_create_inferno_tv_tables.sql'
            : insertTestFull.success 
              ? 'Visitor tracking should work. Check if frontend is calling /api/track endpoint.'
              : insertTestFull.error.includes('column') || insertTestFull.errorCode === '42703'
                ? `Missing columns: ${missingColumns.join(', ')}. Run migration 20250115000001_add_missing_visitor_columns.sql in Supabase SQL Editor`
                : insertTestFull.error.includes('permission') || insertTestFull.error.includes('policy') || insertTestFull.errorCode === '42501'
                  ? 'Check RLS policies allow inserts. The migration should fix this, but verify the policy exists.'
                  : insertTestMinimal.success
                    ? 'Table works with minimal columns. Additional columns may be missing. Run migration 20250115000001_add_missing_visitor_columns.sql'
                    : `Error: ${insertTestMinimal.error}. Check Supabase logs for details. Code: ${insertTestMinimal.errorCode}`
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
