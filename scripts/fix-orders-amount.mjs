import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSchema() {
  console.log('Checking orders table schema...');
  console.log(`Using Supabase URL: ${SUPABASE_URL}`);
  
  // First, let's fetch the current table structure by fetching one row
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error accessing orders table:', error.message);
    console.log('\nYou need to add the "amount" column. Run this in Supabase SQL Editor:');
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0 NOT NULL;');
  } else {
    console.log('Orders table accessible');
    if (data && data.length > 0) {
      console.log('Sample row columns:', Object.keys(data[0]));
      if (!('amount' in data[0])) {
        console.log('\nMissing "amount" column! Run this SQL in Supabase:');
        console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0 NOT NULL;');
      } else {
        console.log('Amount column exists!');
      }
    } else {
      // No rows, try inserting to see if column exists
      const testData = {
        customer_email: 'schema-test@test.com',
        customer_name: 'Schema Test',
        amount: 1000,
        status: 'test_delete'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log('Insert error:', insertError.message);
        if (insertError.message.includes('amount')) {
          console.log('\n=== MISSING AMOUNT COLUMN ===');
          console.log('Run this SQL in Supabase SQL Editor:');
          console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0 NOT NULL;');
        }
      } else {
        console.log('Amount column works! Cleaning up test...');
        if (insertData && insertData[0]) {
          await supabase.from('orders').delete().eq('id', insertData[0].id);
        }
      }
    }
  }
}

fixSchema().catch(console.error);
