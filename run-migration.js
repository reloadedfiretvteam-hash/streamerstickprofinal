import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
// ⚠️ SECURITY: Service key should come from environment variable, not hardcoded!
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || '';

if (!serviceKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_KEY environment variable not set!');
  console.error('   Get your service key from: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const sql = readFileSync('supabase/migrations/20250116000001_update_firestick_images.sql', 'utf8');

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('/*') && !s.startsWith('--') && s.length > 10);

console.log(`Executing ${statements.length} SQL statements...`);

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  if (!statement || statement.length < 10) continue;
  
  try {
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
    
    if (error) {
      // Try direct query if RPC doesn't work
      const { error: queryError } = await supabase.from('real_products').select('id').limit(1);
      if (queryError && queryError.code === 'PGRST116') {
        // Table doesn't exist, skip
        console.log(`Skipping statement (table may not exist): ${statement.substring(0, 50)}...`);
        continue;
      }
      console.error(`Error in statement ${i + 1}:`, error.message);
    } else {
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
  } catch (err) {
    console.error(`Error executing statement ${i + 1}:`, err.message);
  }
}

console.log('Migration completed!');

