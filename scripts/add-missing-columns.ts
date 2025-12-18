import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function addMissingColumns() {
  console.log('=== ADDING MISSING COLUMNS VIA SUPABASE RPC ===\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Try the SQL RPC endpoint
  console.log('Attempting to add columns via RPC...');
  
  // Method 1: Try direct SQL via fetch to the SQL API
  const sqlStatements = `
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_message text;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text;
  `;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ q: sqlStatements }),
    });
    
    if (response.ok) {
      console.log('✓ SQL RPC succeeded!');
      const result = await response.json();
      console.log('Result:', result);
    } else {
      const errorText = await response.text();
      console.log('SQL RPC failed:', response.status, errorText);
      
      // Try alternative approach - pg_query function
      console.log('\nTrying pg_query approach...');
      const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sqlStatements }),
      });
      
      if (pgResponse.ok) {
        console.log('✓ pg_query succeeded!');
      } else {
        console.log('pg_query failed:', pgResponse.status, await pgResponse.text());
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Verify columns now exist
  console.log('\n=== VERIFICATION ===');
  const { data, error } = await supabase.from('orders').select('customer_message, customer_phone').limit(1);
  if (error) {
    console.log('❌ Columns still missing:', error.message);
  } else {
    console.log('✓ Columns exist! Orders table is ready.');
  }
}

addMissingColumns();
