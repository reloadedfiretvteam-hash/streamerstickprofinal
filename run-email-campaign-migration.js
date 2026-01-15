import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
// Using the service key provided by user
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDQ5MiwiZXhwIjoyMDc5NDYwNDkyfQ.m3xw006mSdP1DeunLo4CoNDonIIXkQSt353VL-ibb0c';

const supabase = createClient(supabaseUrl, serviceKey);

console.log('🔄 Running Email Campaign Migration...\n');

const sql = readFileSync('supabase/migrations/20250115000002_create_email_campaigns.sql', 'utf8');

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('/*') && !s.startsWith('--') && s.length > 10);

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  
  // Skip empty statements and comments
  if (!statement || statement.length < 10) continue;
  
  try {
    console.log(`[${i + 1}/${statements.length}] Executing statement...`);
    
    // Use RPC to execute raw SQL (Supabase doesn't have direct SQL execution, so we'll use the REST API)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
    
    if (error) {
      // Try alternative method - direct query if it's a SELECT, or use REST API
      console.log(`   ⚠️  RPC method failed, trying direct execution...`);
      
      // For CREATE statements, we need to use the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ sql_query: statement }),
      });
      
      if (!response.ok) {
        // If RPC doesn't exist, we'll need to execute via SQL Editor API
        console.log(`   ⚠️  Direct execution not available, please run manually in Supabase SQL Editor`);
        console.log(`   📋 Statement ${i + 1}: ${statement.substring(0, 100)}...`);
        errorCount++;
        continue;
      }
    }
    
    successCount++;
    console.log(`   ✅ Success\n`);
  } catch (error) {
    errorCount++;
    console.error(`   ❌ Error: ${error.message}\n`);
  }
}

console.log('\n📊 Migration Summary:');
console.log(`   ✅ Successful: ${successCount}`);
console.log(`   ❌ Errors: ${errorCount}`);

if (errorCount > 0) {
  console.log('\n⚠️  Some statements failed. Please run the migration manually in Supabase SQL Editor:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Go to SQL Editor');
  console.log('   4. Copy and paste the entire migration file:');
  console.log('      supabase/migrations/20250115000002_create_email_campaigns.sql');
  console.log('   5. Click "Run"');
} else {
  console.log('\n✅ Migration completed successfully!');
  console.log('   Email campaign tables are now ready to use.');
}
