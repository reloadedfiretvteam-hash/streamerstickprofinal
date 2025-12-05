
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co'
const supabaseKey = '9c809a380006b9cc16b852d4e34c4ee44e19ef91eb5f4bf'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabase() {
  console.log("Checking Supabase connection...");

  // 1. Check Storage Buckets
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.error("Error listing buckets:", bucketError);
  } else {
    console.log("Buckets found:", buckets.map(b => b.name));
    
    for (const bucket of buckets) {
      console.log(`\nListing files in bucket: ${bucket.name}`);
      const { data: files, error: filesError } = await supabase.storage.from(bucket.name).list();
      if (filesError) {
        console.error(`Error listing files in ${bucket.name}:`, filesError);
      } else {
        files.forEach(f => console.log(` - ${f.name} (${f.metadata?.mimetype})`));
      }
    }
  }

  // 2. Check Tables (Guessing 'products' or similar exists)
  console.log("\nChecking 'products' table...");
  const { data: products, error: tableError } = await supabase.from('products').select('*').limit(5);
  
  if (tableError) {
    console.error("Error querying products table (might not exist or RLS blocked):", tableError.message);
  } else {
    console.log("Products found:", products.length);
    console.log(products);
  }
}

checkSupabase();
