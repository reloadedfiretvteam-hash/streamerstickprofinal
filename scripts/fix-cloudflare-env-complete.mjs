const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT = process.env.CLOUDFLARE_PROJECT_NAME || 'streamerstickpro-live';
const EMAIL = process.env.CLOUDFLARE_EMAIL;
const API_KEY = process.env.CLOUDFLARE_GLOBAL_API_KEY;

const env = {
  NODE_ENV: { value: 'production', type: 'plain_text' },
  SITE_URL: { value: 'https://streamstickpro.com', type: 'plain_text' },
  RESEND_FROM_EMAIL: { value: 'noreply@streamstickpro.com', type: 'plain_text' },
  VITE_SUPABASE_URL: { value: process.env.VITE_SUPABASE_URL || '', type: 'plain_text' },
  VITE_SUPABASE_ANON_KEY: { value: process.env.VITE_SUPABASE_ANON_KEY || '', type: 'plain_text' },
  VITE_SECURE_HOSTS: { value: 'secure.streamstickpro.com', type: 'plain_text' },
  VITE_STORAGE_BUCKET_NAME: { value: 'imiges', type: 'plain_text' },
  STRIPE_SECRET_KEY: { value: process.env.STRIPE_SECRET_KEY || '', type: 'secret_text' },
  STRIPE_PUBLISHABLE_KEY: { value: process.env.STRIPE_PUBLISHABLE_KEY || '', type: 'secret_text' },
  SUPABASE_SERVICE_KEY: { value: process.env.SUPABASE_SERVICE_KEY || '', type: 'secret_text' },
  ADMIN_USERNAME: { value: process.env.ADMIN_USERNAME || '', type: 'secret_text' },
  ADMIN_PASSWORD: { value: process.env.ADMIN_PASSWORD || '', type: 'secret_text' },
  SESSION_SECRET: { value: process.env.SESSION_SECRET || '', type: 'secret_text' },
  JWT_SECRET: { value: process.env.JWT_SECRET || '', type: 'secret_text' },
  UNSUBSCRIBE_JWT_SECRET: { value: process.env.UNSUBSCRIBE_JWT_SECRET || '', type: 'secret_text' },
};

async function main() {
  const required = [
    ['CLOUDFLARE_ACCOUNT_ID', ACCOUNT_ID],
    ['CLOUDFLARE_EMAIL', EMAIL],
    ['CLOUDFLARE_GLOBAL_API_KEY', API_KEY],
    ['VITE_SUPABASE_URL', env.VITE_SUPABASE_URL.value],
    ['VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY.value],
    ['STRIPE_SECRET_KEY', env.STRIPE_SECRET_KEY.value],
    ['STRIPE_PUBLISHABLE_KEY', env.STRIPE_PUBLISHABLE_KEY.value],
    ['SUPABASE_SERVICE_KEY', env.SUPABASE_SERVICE_KEY.value],
  ];
  const missing = required.filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  const headers = { 'X-Auth-Email': EMAIL, 'X-Auth-Key': API_KEY, 'Content-Type': 'application/json' };
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`;

  // Step 1: Check if RESEND_API_KEY and STRIPE_WEBHOOK_SECRET are in Supabase
  const sbUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
  const sbKey = env.SUPABASE_SERVICE_KEY.value;
  const sbHeaders = { apikey: sbKey, Authorization: `Bearer ${sbKey}` };

  try {
    const r = await fetch(`${sbUrl}/rest/v1/site_settings?select=setting_key,setting_value`, { headers: sbHeaders });
    const settings = await r.json();
    for (const s of settings) {
      if (s.setting_key === 'resend_api_key' && s.setting_value) {
        env.RESEND_API_KEY = { value: s.setting_value, type: 'secret_text' };
        console.log('Found RESEND_API_KEY in Supabase');
      }
      if (s.setting_key === 'stripe_webhook_secret' && s.setting_value) {
        env.STRIPE_WEBHOOK_SECRET = { value: s.setting_value, type: 'secret_text' };
        console.log('Found STRIPE_WEBHOOK_SECRET in Supabase');
      }
    }
  } catch (e) {
    console.log('Could not read site_settings:', e.message);
  }

  // If RESEND_API_KEY not found in Supabase, we still need it - check if we can find it elsewhere
  if (!env.RESEND_API_KEY) {
    console.log('WARNING: RESEND_API_KEY not found in Supabase. Free trials may not send emails.');
    console.log('You may need to add it manually in Cloudflare Dashboard.');
  }
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.log('WARNING: STRIPE_WEBHOOK_SECRET not found. Webhooks may not verify.');
  }

  // Step 2: PATCH the complete env (no GET first)
  console.log(`\nSetting ${Object.keys(env).length} env vars on ${PROJECT}...`);
  const body = { deployment_configs: { production: { env_vars: env }, preview: { env_vars: env } } };
  const r = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const d = await r.json();

  if (d.success) {
    console.log('ENV VARS SET SUCCESSFULLY');
  } else {
    console.log('FAILED:', JSON.stringify(d.errors));
    process.exit(1);
  }

  // Step 3: Retry latest deployment
  console.log('\nRetrying latest deployment...');
  const dr = await fetch(`${url}/deployments?per_page=1`, { headers });
  const dd = await dr.json();
  const depId = dd.result[0].id;
  const rr = await fetch(`${url}/deployments/${depId}/retry`, { method: 'POST', headers });
  const rd = await rr.json();
  console.log('Retry:', rd.success ? 'STARTED' : 'FAILED');

  // Step 4: Wait and test
  console.log('\nWaiting 90 seconds for deployment...');
  await new Promise(r => setTimeout(r, 90000));

  console.log('\n=== TESTING LIVE SITE ===');
  
  try {
    const cr = await fetch('https://streamstickpro.com/api/stripe/config');
    const ct = await cr.json();
    console.log('Stripe config:', cr.status, ct.publishableKey ? 'HAS KEY' : 'MISSING KEY');
  } catch (e) { console.log('Stripe config: ERROR', e.message); }

  try {
    const cr = await fetch('https://streamstickpro.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 'iptv-1mo', quantity: 1 }], customerEmail: 'test@test.com', customerName: 'Test' })
    });
    const ct = await cr.text();
    console.log('Checkout:', cr.status, ct.substring(0, 200));
  } catch (e) { console.log('Checkout: ERROR', e.message); }

  try {
    const sr = await fetch('https://streamstickpro.com/sitemap.xml');
    console.log('Sitemap:', sr.status);
  } catch (e) { console.log('Sitemap: ERROR'); }

  try {
    const rr = await fetch('https://streamstickpro.com/robots.txt');
    console.log('Robots:', rr.status);
  } catch (e) { console.log('Robots: ERROR'); }
}

main().catch(e => { console.error(e); process.exit(1); });
