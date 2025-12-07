import pg from 'pg';

async function main() {
  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  
  if (!supabaseUrl) {
    console.error('SUPABASE_DATABASE_URL not found');
    process.exit(1);
  }
  
  console.log('Connecting to Supabase...');
  
  const client = new pg.Client({
    connectionString: supabaseUrl,
  });
  
  await client.connect();
  console.log('Connected to Supabase\n');
  
  const alterStatements = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_preference TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS existing_username TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS generated_username TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS generated_password TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_street TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zip TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS amazon_order_id TEXT;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id TEXT;",
  ];
  
  for (const sql of alterStatements) {
    try {
      await client.query(sql);
      const colName = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1];
      console.log('✅', colName);
    } catch (err) {
      console.error('❌', sql.substring(0, 50), err.message);
    }
  }
  
  const indexStatements = [
    "CREATE INDEX IF NOT EXISTS orders_fulfillment_status_idx ON orders (fulfillment_status);",
    "CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);",
  ];
  
  console.log('\nCreating indexes...');
  for (const sql of indexStatements) {
    try {
      await client.query(sql);
      console.log('✅ Index created');
    } catch (err) {
      console.log('⚠️ Index:', err.message);
    }
  }
  
  console.log('\nVerifying orders table columns...');
  const query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position";
  const result = await client.query(query);
  
  console.log('\nOrders table columns:');
  result.rows.forEach(row => {
    console.log('  -', row.column_name, ':', row.data_type);
  });
  
  await client.end();
  console.log('\n✅ Supabase schema update complete!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
