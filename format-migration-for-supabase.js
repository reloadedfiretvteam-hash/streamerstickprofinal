/**
 * Formats the migration SQL for easy copy-paste into Supabase SQL Editor
 */

import { readFileSync } from 'fs';

const migrationFile = 'supabase/migrations/20250115000002_create_email_campaigns.sql';
const sql = readFileSync(migrationFile, 'utf8');

console.log('📋 EMAIL CAMPAIGN MIGRATION SQL');
console.log('═'.repeat(60));
console.log('\nCopy everything below this line and paste into Supabase SQL Editor:\n');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('\n✅ Instructions:');
console.log('   1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new');
console.log('   2. Paste the SQL above');
console.log('   3. Click "Run" button');
console.log('   4. Wait for success message\n');
