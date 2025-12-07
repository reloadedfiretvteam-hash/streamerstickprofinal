import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixSchema() {
  console.log('Attempting to fix orders table schema...');
  
  // Use the RPC function to run SQL if it exists, otherwise try direct approach
  // First, let's try to use the REST API to alter the table via a stored procedure
  
  // Check current columns in orders table
  const { data: ordersCheck, error: checkError } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
    
  if (checkError) {
    console.log('Orders table error:', checkError.message);
  } else {
    console.log('Orders table exists');
    if (ordersCheck && ordersCheck.length > 0) {
      console.log('Current columns:', Object.keys(ordersCheck[0]));
    }
  }
  
  // Try to call the Supabase management API to add column
  // This requires using the Database REST API
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0;'
    })
  });
  
  if (response.ok) {
    console.log('SQL executed successfully via RPC!');
  } else {
    const errorText = await response.text();
    console.log('RPC not available:', response.status, errorText);
    
    // Try direct Postgres REST API if available
    console.log('\nAttempting alternative method...');
    
    // Create a workaround: drop and recreate the orders table with proper schema
    // BUT we need to preserve existing data - this is risky
    // Better approach: provide the SQL for the user to run
    
    console.log('\n=================================================');
    console.log('MANUAL STEP REQUIRED');
    console.log('=================================================');
    console.log('\nPlease run this SQL in your Supabase SQL Editor:');
    console.log('https://app.supabase.com/project/emlqlmfzqsnqokrqvmcm/sql/new\n');
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0;');
    console.log('\n=================================================');
  }
}

fixSchema().catch(console.error);
