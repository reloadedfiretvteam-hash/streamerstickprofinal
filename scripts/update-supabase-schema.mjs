import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateSchema() {
  console.log('Updating Supabase schema...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  
  const alterTableSQL = `
    -- Drop the old real_products table and recreate with correct schema
    DROP TABLE IF EXISTS real_products CASCADE;
    
    CREATE TABLE real_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image_url TEXT,
      category TEXT,
      shadow_product_id TEXT,
      shadow_price_id TEXT,
      is_active BOOLEAN DEFAULT true,
      features TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS real_products_category_idx ON real_products(category);
    CREATE INDEX IF NOT EXISTS real_products_shadow_product_idx ON real_products(shadow_product_id);
    CREATE INDEX IF NOT EXISTS real_products_shadow_price_idx ON real_products(shadow_price_id);
    
    -- Ensure other required tables exist
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      customer_email TEXT NOT NULL,
      customer_name TEXT,
      customer_id TEXT,
      stripe_checkout_session_id TEXT,
      stripe_payment_intent_id TEXT,
      stripe_customer_id TEXT,
      shadow_product_id TEXT,
      shadow_price_id TEXT,
      real_product_id TEXT,
      real_product_name TEXT,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      credentials_sent BOOLEAN DEFAULT false,
      shipping_name TEXT,
      shipping_phone TEXT,
      shipping_street TEXT,
      shipping_city TEXT,
      shipping_state TEXT,
      shipping_zip TEXT,
      shipping_country TEXT,
      fulfillment_status TEXT DEFAULT 'pending',
      amazon_order_id TEXT,
      is_renewal BOOLEAN DEFAULT false,
      existing_username TEXT,
      generated_username TEXT,
      generated_password TEXT,
      country_preference TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
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
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      ip_address TEXT,
      user_agent TEXT,
      page TEXT,
      referrer TEXT,
      country TEXT,
      city TEXT,
      session_id TEXT,
      page_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS page_edits (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      page_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      element_id TEXT NOT NULL,
      element_type TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  console.log('\nExecuting schema update...');
  console.log('NOTE: This requires running the SQL in Supabase SQL Editor.');
  console.log('\n--- COPY THE SQL BELOW AND RUN IN SUPABASE SQL EDITOR ---\n');
  console.log(alterTableSQL);
  console.log('\n--- END OF SQL ---\n');
  
  console.log('After running the SQL, run: node scripts/sync-products-to-supabase.mjs');
}

updateSchema().catch(console.error);
