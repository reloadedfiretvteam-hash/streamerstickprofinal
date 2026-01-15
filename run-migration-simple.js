/**
 * Simple Migration Runner
 * Executes the email campaigns migration using Supabase REST API
 */

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
// ⚠️ SECURITY: Service key should come from environment variable, not hardcoded!
// Get from: Supabase Dashboard → Settings → API → service_role key
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || '';

if (!SERVICE_KEY) {
  console.error('❌ ERROR: SUPABASE_SERVICE_KEY environment variable not set!');
  console.error('   Get your service key from: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api');
  console.error('   Then set it: export SUPABASE_SERVICE_KEY="your-key-here"');
  process.exit(1);
}

async function runMigration() {
  console.log('🔄 Running Email Campaign Migration...\n');
  
  // Read the migration file
  const fs = await import('fs');
  const sql = fs.readFileSync('supabase/migrations/20250115000002_create_email_campaigns.sql', 'utf8');
  
  console.log('📝 Migration file loaded\n');
  console.log('⚠️  IMPORTANT: This migration needs to be run in Supabase SQL Editor');
  console.log('   The Supabase REST API does not support executing arbitrary SQL.\n');
  console.log('📋 To complete the migration:\n');
  console.log('   1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new');
  console.log('   2. Copy the entire contents of: supabase/migrations/20250115000002_create_email_campaigns.sql');
  console.log('   3. Paste into the SQL Editor');
  console.log('   4. Click "Run" button\n');
  console.log('✅ After running, the email campaign system will be fully active!\n');
  
  // Verify service key works
  try {
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });
    
    if (testResponse.ok) {
      console.log('✅ Service key verified - connection successful\n');
    }
  } catch (error) {
    console.log('⚠️  Could not verify service key connection\n');
  }
  
  console.log('📄 Migration SQL (first 500 chars):');
  console.log(sql.substring(0, 500) + '...\n');
}

runMigration().catch(console.error);
