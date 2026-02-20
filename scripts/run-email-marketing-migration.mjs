/**
 * Runs the email marketing migration against Supabase.
 * Uses the Supabase REST API with service role key.
 */

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[2];

if (!SUPABASE_SERVICE_KEY) {
  console.error('Usage: node scripts/run-email-marketing-migration.mjs <SUPABASE_SERVICE_KEY>');
  process.exit(1);
}

const headers = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

async function checkTable(tableName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=id&limit=1`, { headers });
    if (res.ok) {
      console.log(`  ✓ Table "${tableName}" exists`);
      return true;
    }
    const body = await res.text();
    if (body.includes('does not exist') || body.includes('relation') || res.status === 404) {
      console.log(`  ✗ Table "${tableName}" does NOT exist`);
      return false;
    }
    console.log(`  ? Table "${tableName}" status: ${res.status} - ${body.substring(0, 200)}`);
    return res.ok;
  } catch (err) {
    console.error(`  Error checking "${tableName}":`, err.message);
    return false;
  }
}

async function runSQL(sql) {
  // Try the Supabase SQL endpoint (pg/query)
  const endpoints = [
    `${SUPABASE_URL}/pg/query`,
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
  ];

  for (const endpoint of endpoints) {
    try {
      const body = endpoint.includes('rpc/exec_sql')
        ? JSON.stringify({ query: sql })
        : JSON.stringify({ query: sql });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': endpoint.includes('pg/query') ? 'application/json' : 'application/json',
        },
        body,
      });

      if (res.ok) {
        console.log(`  ✓ SQL executed via ${endpoint}`);
        return true;
      }
      const text = await res.text();
      console.log(`  Endpoint ${endpoint}: ${res.status} - ${text.substring(0, 200)}`);
    } catch (err) {
      console.log(`  Endpoint ${endpoint} failed: ${err.message}`);
    }
  }
  return false;
}

async function createTableViaREST(tableName, testQuery) {
  // Check if we can insert/query via REST (tables auto-detected by PostgREST)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=count`, {
      headers: { ...headers, 'Prefer': 'count=exact' },
    });
    if (res.ok) {
      const count = res.headers.get('content-range');
      console.log(`  ✓ Table "${tableName}" accessible via REST, range: ${count}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function main() {
  console.log('=== Email Marketing Migration ===');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Service key: ${SUPABASE_SERVICE_KEY.substring(0, 30)}...`);
  console.log('');

  // Step 1: Check connectivity
  console.log('1. Testing Supabase connectivity...');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers });
    console.log(`  Connection: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error('  FAILED to connect:', err.message);
    process.exit(1);
  }

  // Step 2: Check if tables already exist
  console.log('\n2. Checking existing tables...');
  const contactsExist = await checkTable('contacts');
  const campaignsExist = await checkTable('email_campaigns');
  const sendsExist = await checkTable('email_sends');

  // Also check legacy tables
  const legacyCampaigns = await checkTable('email_campaigns_legacy');

  if (contactsExist && campaignsExist && sendsExist) {
    console.log('\n✓ All email marketing tables already exist!');
    
    // Count records
    for (const table of ['contacts', 'email_campaigns', 'email_sends']) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=0`, {
        headers: { ...headers, 'Prefer': 'count=exact' },
      });
      const range = res.headers.get('content-range');
      console.log(`  ${table}: ${range || 'unknown'} rows`);
    }
    
    console.log('\n3. Testing existing orders table for backfill data...');
    const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=customer_email,customer_name,real_product_id,created_at&limit=5&order=created_at.desc`, { headers });
    if (ordersRes.ok) {
      const orders = await ordersRes.json();
      console.log(`  Found ${orders.length} recent orders (showing up to 5)`);
      orders.forEach(o => console.log(`    - ${o.customer_email} | ${o.real_product_id} | ${o.created_at}`));
    }

    console.log('\nDone! Tables are ready.');
    return;
  }

  // Step 3: Try to create tables via SQL endpoint
  console.log('\n3. Attempting to create tables via SQL endpoint...');

  const migrationSQL = `
    -- Rename legacy tables if they exist
    DO $$ BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_sends' AND table_schema = 'public') 
         AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_sends_legacy' AND table_schema = 'public') THEN
        ALTER TABLE email_sends RENAME TO email_sends_legacy;
      END IF;
    END $$;
    
    DO $$ BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_campaigns' AND table_schema = 'public')
         AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_campaigns_legacy' AND table_schema = 'public')
         AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'body_html') THEN
        ALTER TABLE email_campaigns RENAME TO email_campaigns_legacy;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT,
      source TEXT NOT NULL CHECK (source IN ('free_trial', 'subscription', 'firestick')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_activity_at TIMESTAMPTZ,
      is_subscribed BOOLEAN DEFAULT true
    );
    CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
    CREATE INDEX IF NOT EXISTS contacts_source_idx ON contacts(source);
    CREATE INDEX IF NOT EXISTS contacts_subscribed_idx ON contacts(is_subscribed);

    CREATE TABLE IF NOT EXISTS email_campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      body_text TEXT,
      segment JSONB,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      sent_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS email_sends (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
      contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
      provider_message_id TEXT,
      error_message TEXT,
      sent_at TIMESTAMPTZ
    );

    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Service role full access contacts') THEN
        CREATE POLICY "Service role full access contacts" ON contacts FOR ALL USING (true);
      END IF;
    END $$;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'email_campaigns' AND policyname = 'Service role full access email_campaigns') THEN
        CREATE POLICY "Service role full access email_campaigns" ON email_campaigns FOR ALL USING (true);
      END IF;
    END $$;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'email_sends' AND policyname = 'Service role full access email_sends') THEN
        CREATE POLICY "Service role full access email_sends" ON email_sends FOR ALL USING (true);
      END IF;
    END $$;

    -- Backfill contacts from orders
    INSERT INTO contacts (email, first_name, source, last_activity_at, is_subscribed)
    SELECT DISTINCT ON (customer_email)
      customer_email,
      customer_name,
      CASE WHEN LOWER(COALESCE(real_product_id, '')) LIKE '%firestick%' THEN 'firestick' ELSE 'subscription' END,
      created_at,
      true
    FROM orders
    WHERE customer_email IS NOT NULL AND customer_email != ''
    ORDER BY customer_email, created_at DESC
    ON CONFLICT (email) DO NOTHING;
  `;

  const sqlResult = await runSQL(migrationSQL);

  if (sqlResult) {
    console.log('\n✓ Migration executed via SQL endpoint!');
  } else {
    console.log('\n⚠ Direct SQL endpoint not available. Trying alternative approach...');
    
    // Try creating via individual REST API inserts (won't work for DDL)
    console.log('  The SQL migration needs to be run through the Supabase Dashboard SQL Editor.');
    console.log('  URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql');
    console.log('  Copy and paste the migration from: supabase/migrations/20260220000001_email_marketing_system.sql');
  }

  // Step 4: Verify
  console.log('\n4. Verifying tables after migration...');
  const c2 = await checkTable('contacts');
  const ca2 = await checkTable('email_campaigns');
  const s2 = await checkTable('email_sends');

  if (c2 && ca2 && s2) {
    console.log('\n✓ All tables created successfully!');
  } else {
    console.log('\n⚠ Some tables still missing. Will try Supabase Dashboard approach.');
  }
}

main().catch(console.error);
