import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getColumns() {
  // Query information_schema to get actual column info
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'orders' });
  
  if (error) {
    console.log('RPC not available, trying alternative...');
    
    // Try inserting with all nulls to see which columns have NOT NULL
    const testData = {
      customer_email: 'schema-check@test.com',
    };
    
    const result = await supabase.from('orders').insert(testData).select();
    if (result.error) {
      console.log('Required columns error:', result.error.message);
    } else {
      console.log('Insert worked! Columns:', Object.keys(result.data[0]));
      // Clean up
      await supabase.from('orders').delete().eq('customer_email', 'schema-check@test.com');
    }
  } else {
    console.log('Columns:', data);
  }
}

getColumns();
