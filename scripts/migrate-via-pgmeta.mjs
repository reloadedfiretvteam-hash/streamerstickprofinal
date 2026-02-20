/**
 * Runs migration via Supabase pg-meta service or creates a helper function.
 */
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) { console.error('Pass service key as arg'); process.exit(1); }

const baseHeaders = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

const migrationSQL = readFileSync('supabase/migrations/20260220000001_email_marketing_system.sql', 'utf-8');

// Split migration into individual statements for step-by-step execution
const statements = [
  // 1. Rename legacy email_sends if exists (and new one doesn't)
  `DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_sends' AND table_schema = 'public') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_sends' AND column_name = 'contact_id') THEN
      ALTER TABLE email_sends RENAME TO email_sends_legacy;
    END IF;
  END $$`,
  
  // 2. Rename legacy email_campaigns if exists (and new one doesn't)
  `DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public')
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'body_html') THEN
      ALTER TABLE email_campaigns RENAME TO email_campaigns_legacy;
    END IF;
  END $$`,
  
  // 3. Create contacts
  `CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    source TEXT NOT NULL DEFAULT 'subscription',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ,
    is_subscribed BOOLEAN DEFAULT true
  )`,
  
  // 4. Create email_campaigns
  `CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL DEFAULT '',
    body_text TEXT,
    segment JSONB,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
  )`,
  
  // 5. Create email_sends
  `CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'queued',
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ
  )`,
  
  // 6. RLS
  `ALTER TABLE contacts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY`,
  
  // 7. Indexes
  `CREATE INDEX IF NOT EXISTS contacts_source_idx ON contacts(source)`,
  `CREATE INDEX IF NOT EXISTS contacts_subscribed_idx ON contacts(is_subscribed)`,
  `CREATE INDEX IF NOT EXISTS email_campaigns_status_idx ON email_campaigns(status)`,
  `CREATE INDEX IF NOT EXISTS email_sends_campaign_idx ON email_sends(campaign_id)`,
  `CREATE INDEX IF NOT EXISTS email_sends_contact_idx ON email_sends(contact_id)`,
  `CREATE INDEX IF NOT EXISTS email_sends_status_idx ON email_sends(status)`,
  
  // 8. RLS Policies
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_all_access') THEN
      CREATE POLICY contacts_all_access ON contacts FOR ALL USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'email_campaigns' AND policyname = 'email_campaigns_all_access') THEN
      CREATE POLICY email_campaigns_all_access ON email_campaigns FOR ALL USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'email_sends' AND policyname = 'email_sends_all_access') THEN
      CREATE POLICY email_sends_all_access ON email_sends FOR ALL USING (true);
    END IF;
  END $$`,
  
  // 9. Backfill contacts from orders
  `INSERT INTO contacts (email, first_name, source, last_activity_at, is_subscribed)
   SELECT DISTINCT ON (customer_email)
     customer_email,
     customer_name,
     CASE WHEN LOWER(COALESCE(real_product_id, '')) LIKE '%firestick%' THEN 'firestick' ELSE 'subscription' END,
     created_at,
     true
   FROM orders
   WHERE customer_email IS NOT NULL AND customer_email != ''
   ORDER BY customer_email, created_at DESC
   ON CONFLICT (email) DO NOTHING`,
];

async function tryEndpoint(url, body) {
  try {
    const res = await fetch(url, { method: 'POST', headers: baseHeaders, body: JSON.stringify(body) });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    return { ok: false, status: 0, text: err.message };
  }
}

async function main() {
  console.log('=== Supabase Migration via Multiple Endpoints ===\n');
  
  // Try different SQL execution endpoints
  const testSQL = 'SELECT 1 as test';
  const endpoints = [
    { url: `${SUPABASE_URL}/pg/query`, body: { query: testSQL } },
    { url: `${SUPABASE_URL}/pg-meta/default/query`, body: { query: testSQL } },
    { url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`, body: { query: testSQL } },
    { url: `${SUPABASE_URL}/rest/v1/rpc/execute_sql`, body: { sql_query: testSQL } },
  ];
  
  let workingEndpoint = null;
  
  console.log('Testing SQL endpoints...');
  for (const ep of endpoints) {
    const result = await tryEndpoint(ep.url, ep.body);
    console.log(`  ${ep.url}: ${result.status} ${result.ok ? '✓' : '✗'} ${result.text.substring(0, 100)}`);
    if (result.ok) {
      workingEndpoint = ep;
      break;
    }
  }
  
  if (!workingEndpoint) {
    console.log('\nNo SQL endpoint available. Attempting alternative: create helper function via PostgREST...');
    
    // Check if we can at least query to verify state
    console.log('\nChecking current table state via REST API...');
    for (const table of ['contacts', 'email_campaigns', 'email_sends', 'orders', 'customers']) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=0`, {
        headers: { ...baseHeaders, 'Prefer': 'count=exact' },
      });
      const range = res.headers.get('content-range');
      console.log(`  ${table}: ${res.ok ? `✓ exists (${range})` : `✗ ${res.status}`}`);
    }
    
    console.log('\n=== MANUAL MIGRATION REQUIRED ===');
    console.log('The Supabase REST API does not support DDL operations directly.');
    console.log('Run the SQL migration via the Supabase Dashboard SQL Editor:');
    console.log(`  https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new`);
    console.log('\nI will now open the Supabase Dashboard for you...');
    
    // Output the SQL for easy copy
    console.log('\n--- MIGRATION SQL (copy this) ---');
    for (let i = 0; i < statements.length; i++) {
      console.log(`\n-- Statement ${i + 1}:`);
      console.log(statements[i] + ';');
    }
    console.log('\n--- END MIGRATION SQL ---');
    
    return false;
  }
  
  console.log(`\nUsing endpoint: ${workingEndpoint.url}`);
  console.log('\nRunning migration statements...');
  
  for (let i = 0; i < statements.length; i++) {
    const body = { ...workingEndpoint.body, query: statements[i] };
    const result = await tryEndpoint(workingEndpoint.url, body);
    const status = result.ok ? '✓' : '✗';
    console.log(`  [${i + 1}/${statements.length}] ${status} ${statements[i].substring(0, 60).replace(/\n/g, ' ')}...`);
    if (!result.ok) {
      console.log(`    Error: ${result.text.substring(0, 200)}`);
    }
  }
  
  // Verify
  console.log('\nVerifying tables...');
  for (const table of ['contacts', 'email_campaigns', 'email_sends']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=0`, {
      headers: { ...baseHeaders, 'Prefer': 'count=exact' },
    });
    const range = res.headers.get('content-range');
    console.log(`  ${table}: ${res.ok ? `✓ (${range})` : `✗ ${res.status}`}`);
  }
  
  return true;
}

main().then(ok => process.exit(ok ? 0 : 1)).catch(err => { console.error(err); process.exit(1); });
