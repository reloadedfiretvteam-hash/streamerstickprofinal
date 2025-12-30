#!/usr/bin/env node
// Verify and set up Supabase analytics tables using Supabase client

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('This script needs the service role key to create tables');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTablesExist() {
  console.log('🔍 Checking if analytics tables exist...\n');
  
  try {
    // Try to query the tables
    const { data: pageViews, error: pageViewsError } = await supabaseAdmin
      .from('analytics_page_views')
      .select('count')
      .limit(1);
    
    const { data: visits, error: visitsError } = await supabaseAdmin
      .from('analytics_visits')
      .select('count')
      .limit(1);
    
    if (!pageViewsError && !visitsError) {
      console.log('✅ Analytics tables already exist!\n');
      return true;
    }
    
    console.log('❌ Tables do not exist. Error:', pageViewsError?.message || visitsError?.message);
    return false;
  } catch (error) {
    console.log('❌ Tables do not exist. Error:', error.message);
    return false;
  }
}

async function setupTables() {
  console.log('📝 NOTE: Supabase requires SQL to be run through the Dashboard.\n');
  console.log('📋 Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('👉 https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new\n\n');
  
  const fs = await import('fs/promises');
  const sqlContent = await fs.readFile('./supabase-analytics-setup.sql', 'utf-8');
  console.log('='.repeat(80));
  console.log(sqlContent);
  console.log('='.repeat(80));
  console.log('\n');
}

async function checkRealtimeEnabled() {
  console.log('🔍 Checking Realtime status...\n');
  console.log('📝 To enable Realtime:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/database/replication');
  console.log('   2. Enable Realtime for:');
  console.log('      - public.analytics_page_views');
  console.log('      - public.analytics_visits\n');
}

async function main() {
  console.log('🚀 Supabase Analytics Setup Verification\n');
  console.log('='.repeat(80));
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);
  
  const tablesExist = await checkTablesExist();
  
  if (!tablesExist) {
    await setupTables();
  }
  
  await checkRealtimeEnabled();
  
  console.log('✅ Verification complete!\n');
}

main().catch(console.error);

