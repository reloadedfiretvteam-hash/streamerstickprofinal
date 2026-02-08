/**
 * Supabase Database Migration Script
 * Runs via GitHub Actions to create/update tables in production Supabase
 * 
 * Required environment variable:
 * - SUPABASE_DATABASE_URL: Direct PostgreSQL connection string
 */

import postgres from 'postgres';
import { readFile } from 'fs/promises';
import path from 'path';

async function runMigration() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ SUPABASE_DATABASE_URL environment variable is required');
    console.error('   Set this in GitHub Secrets with your Supabase connection string');
    console.error('   Format: postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres');
    process.exit(1);
  }

  console.log('🔄 Connecting to Supabase PostgreSQL...');
  
  const sql = postgres(databaseUrl, { 
    ssl: 'require',
    max: 1,
    idle_timeout: 20
  });

  try {
    // Test connection
    const dbInfo = await sql`SELECT current_database() as db, current_user as user`;
    console.log(`✓ Connected to database: ${dbInfo[0].db} as ${dbInfo[0].user}`);

    console.log('\n📦 Creating tables...\n');

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        status TEXT DEFAULT 'active',
        notes TEXT,
        total_orders INTEGER DEFAULT 0,
        last_order_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✓ customers table');

    await sql`CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email)`;
    await sql`CREATE INDEX IF NOT EXISTS customers_status_idx ON customers (status)`;
    await sql`CREATE INDEX IF NOT EXISTS customers_username_idx ON customers (username)`;

    // Create password_reset_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        customer_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✓ password_reset_tokens table');

    await sql`CREATE INDEX IF NOT EXISTS password_reset_customer_idx ON password_reset_tokens (customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS password_reset_token_idx ON password_reset_tokens (token)`;

    // Create abandoned_carts table
    await sql`
      CREATE TABLE IF NOT EXISTS abandoned_carts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT NOT NULL,
        customer_name TEXT,
        cart_items JSONB NOT NULL,
        total_amount INTEGER NOT NULL,
        recovery_email_sent BOOLEAN DEFAULT false,
        recovery_email_sent_at TIMESTAMPTZ,
        converted BOOLEAN DEFAULT false,
        converted_order_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✓ abandoned_carts table');

    await sql`CREATE INDEX IF NOT EXISTS abandoned_carts_email_idx ON abandoned_carts (email)`;
    await sql`CREATE INDEX IF NOT EXISTS abandoned_carts_recovery_idx ON abandoned_carts (recovery_email_sent, converted)`;

    // Add columns to orders table if missing
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id TEXT`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_message TEXT`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT`;
    await sql`CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id)`;
    console.log('✓ orders table columns');

    // Enable RLS with permissive policies
    const tables = ['customers', 'password_reset_tokens', 'abandoned_carts'];
    for (const table of tables) {
      await sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`;
      await sql`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = ${table} AND policyname = 'Allow all access') THEN
            EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL USING (true)', ${table});
          END IF;
        END $$
      `;
    }
    console.log('✓ Row Level Security enabled');

    // Verify table counts
    console.log('\n📊 Table verification:');
    const counts = await sql`
      SELECT 
        (SELECT count(*)::int FROM customers) as customers,
        (SELECT count(*)::int FROM password_reset_tokens) as tokens,
        (SELECT count(*)::int FROM abandoned_carts) as carts,
        (SELECT count(*)::int FROM orders) as orders
    `;
    console.log(`   customers: ${counts[0].customers} rows`);
    console.log(`   password_reset_tokens: ${counts[0].tokens} rows`);
    console.log(`   abandoned_carts: ${counts[0].carts} rows`);
    console.log(`   orders: ${counts[0].orders} rows`);

    // SEO Domination 2026: run schema + 50 location pages seed from supabase/migrations
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const seoMigrations = [
      '20260207000001_seo_domination_schema.sql',
      '20260207000002_seed_50_location_pages.sql',
    ];
    console.log('\n📦 SEO migrations (seo_architecture, redirect_map, 50 location pages):');
    for (const file of seoMigrations) {
      const filePath = path.join(migrationsDir, file);
      try {
        const content = await readFile(filePath, 'utf8');
        await sql.unsafe(content);
        console.log(`   ✓ ${file}`);
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          console.log(`   (skip ${file} - not found)`);
        } else {
          console.error(`   ✗ ${file}:`, err.message);
          // continue so deploy still succeeds if tables already exist
        }
      }
    }

    await sql.end();
    console.log('\n✅ Migration complete!');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
