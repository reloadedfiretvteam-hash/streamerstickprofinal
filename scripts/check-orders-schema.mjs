import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  // Get one row to see columns
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Existing columns:', Object.keys(data[0]).sort().join('\n'));
  } else {
    console.log('No rows in orders table');
    
    // Try to insert a minimal row to see what's required
    const testInsert = await supabase
      .from('orders')
      .insert({ customer_email: 'test@test.com' })
      .select();
    
    if (testInsert.error) {
      console.log('Insert error shows required columns:', testInsert.error.message);
    }
  }
}

checkSchema();
