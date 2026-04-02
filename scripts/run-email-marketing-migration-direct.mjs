import postgres from 'postgres';
import { readFileSync } from 'fs';

const passwords = [
  'Starluna11$$',
  'mJZK7p8M0yxRCpo+yqVNQP5I9fab8LZB73kI5hhj417dmh7PQQtByNS8szRSrwJSPXHg1NfQc589D6YQEyWycQ==',
];

const connectionConfigs = [];
for (const pw of passwords) {
  const encodedPw = encodeURIComponent(pw);
  // Direct connection (username = postgres, no project ref prefix)
  connectionConfigs.push(`postgresql://postgres:${encodedPw}@db.emlqlmfzqsnqokrqvmcm.supabase.co:5432/postgres`);
  // Pooler session mode (username = postgres.project-ref)
  connectionConfigs.push(`postgresql://postgres.emlqlmfzqsnqokrqvmcm:${encodedPw}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`);
  // Pooler transaction mode
  connectionConfigs.push(`postgresql://postgres.emlqlmfzqsnqokrqvmcm:${encodedPw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`);
}

const migrationSQL = readFileSync('supabase/migrations/20260220000001_email_marketing_system.sql', 'utf8');

async function tryConnection(connString) {
  const masked = connString.replace(/:[^:@]+@/, ':***@');
  console.log('Trying:', masked);
  const sql = postgres(connString, { ssl: 'require', connect_timeout: 15, idle_timeout: 10 });
  try {
    const result = await sql`SELECT current_database() as db, current_user as usr`;
    console.log('Connected! DB:', result[0].db, 'User:', result[0].usr);
    return sql;
  } catch (e) {
    console.log('Failed:', e.message);
    try { await sql.end(); } catch {}
    return null;
  }
}

async function main() {
  let sql = null;

  for (const conn of connectionConfigs) {
    sql = await tryConnection(conn);
    if (sql) break;
  }

  if (!sql) {
    console.error('\nAll connection attempts failed');
    process.exit(1);
  }

  console.log('\nRunning email marketing migration...\n');

  try {
    await sql.unsafe(migrationSQL);
    console.log('Migration executed successfully!\n');

    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('contacts', 'email_campaigns', 'email_sends')
      ORDER BY table_name
    `;
    console.log('Tables created:', tables.map(t => t.table_name).join(', '));

    const contactCount = await sql`SELECT count(*) as cnt FROM contacts`;
    console.log('Contacts backfilled from orders:', contactCount[0].cnt);

    console.log('\nEmail marketing migration complete!');
  } catch (e) {
    console.error('Migration error:', e.message);
    if (e.message.includes('already exists')) {
      console.log('(Some objects already exist, which is fine)');
      try {
        const tables = await sql`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name IN ('contacts', 'email_campaigns', 'email_sends')
        `;
        console.log('Existing tables:', tables.map(t => t.table_name).join(', '));
      } catch (e2) {
        console.error('Verify failed:', e2.message);
      }
    }
  } finally {
    await sql.end();
  }
}

main();
