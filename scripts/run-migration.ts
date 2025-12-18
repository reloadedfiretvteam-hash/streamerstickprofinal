import postgres from 'postgres';

const passwords = [
  'Starluna11$$',
  'mJZK7p8M0yxRCpo+yqVNQP5I9fab8LZB73kI5hhj417dmh7PQQtByNS8szRSrwJSPXHg1NfQc589D6YQEyWycQ==',
];

const connectionConfigs: string[] = [];
for (const pw of passwords) {
  const encodedPw = encodeURIComponent(pw);
  connectionConfigs.push(`postgresql://postgres.emlqlmfzqsnqokrqvmcm:${encodedPw}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`);
  connectionConfigs.push(`postgresql://postgres.emlqlmfzqsnqokrqvmcm:${encodedPw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`);
}

async function tryConnection(connString: string): Promise<boolean> {
  console.log('Trying:', connString.substring(0, 70) + '...');
  const sql = postgres(connString, { 
    ssl: 'require', 
    connect_timeout: 15,
    idle_timeout: 5
  });
  try {
    const result = await sql`SELECT current_database() as db`;
    console.log('✓ Connected! Database:', result[0].db);
    
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_message TEXT`;
    console.log('✓ Added customer_message column');
    
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT`;
    console.log('✓ Added customer_phone column');
    
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('customer_message', 'customer_phone')`;
    console.log('✓ Verified columns:', cols.map((c: any) => c.column_name).join(', '));
    
    await sql.end();
    console.log('✅ Migration complete!');
    return true;
  } catch (e: any) {
    console.log('✗ Failed:', e.message);
    try { await sql.end(); } catch {}
    return false;
  }
}

async function main() {
  for (const conn of connectionConfigs) {
    const success = await tryConnection(conn);
    if (success) {
      process.exit(0);
    }
  }
  console.log('All connection attempts failed');
  process.exit(1);
}

main();
