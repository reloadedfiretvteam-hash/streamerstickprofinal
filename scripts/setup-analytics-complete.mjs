#!/usr/bin/env node
// Complete analytics setup - verifies tables, sets Cloudflare env vars, and guides setup

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME || 'streamerstickprofinal';

async function checkSupabaseTables() {
  console.log('🔍 Checking Supabase analytics tables...\n');

  if (!SUPABASE_URL?.trim()) {
    console.log('⚠️  Set VITE_SUPABASE_URL or SUPABASE_URL\n');
    return false;
  }

  if (!SUPABASE_SERVICE_KEY) {
    console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment\n');
    console.log('   To get it:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api');
    console.log('   2. Find "service_role" key (secret)');
    console.log('   3. Copy it and set SUPABASE_SERVICE_ROLE_KEY environment variable\n');
    return false;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Try to query the tables
    const { error: pageViewsError } = await supabaseAdmin
      .from('analytics_page_views')
      .select('count')
      .limit(1);
    
    const { error: visitsError } = await supabaseAdmin
      .from('analytics_visits')
      .select('count')
      .limit(1);
    
    if (!pageViewsError && !visitsError) {
      console.log('✅ Analytics tables exist!\n');
      return true;
    }
    
    console.log('❌ Tables do not exist yet.\n');
    console.log('📋 SETUP REQUIRED:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new');
    console.log('   2. Copy and paste the SQL from: supabase-analytics-setup.sql');
    console.log('   3. Click "Run"\n');
    return false;
  } catch (error) {
    console.log('❌ Error checking tables:', error.message);
    console.log('📋 Tables may not exist. Run the SQL setup:\n');
    console.log('   https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new\n');
    return false;
  }
}

async function setupCloudflareEnv() {
  console.log('🌐 Setting up Cloudflare environment variables...\n');
  
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.log('⚠️  Cloudflare credentials not found');
    console.log('   Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN\n');
    return false;
  }

  if (!SUPABASE_ANON_KEY?.trim()) {
    console.log('⚠️  VITE_SUPABASE_ANON_KEY required to sync Supabase vars to Cloudflare\n');
    return false;
  }

  const envVars = {
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  };

  if (SUPABASE_SERVICE_KEY) {
    envVars.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_KEY;
    envVars.SUPABASE_SERVICE_KEY = SUPABASE_SERVICE_KEY;
  }

  try {
    // Get current project config
    const projectResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!projectResponse.ok) {
      const error = await projectResponse.json();
      console.error(`❌ Failed to fetch Cloudflare project:`, error);
      return false;
    }
    
    const projectData = await projectResponse.json();
    const existingConfig = projectData.result.deployment_configs || {};
    const productionEnvVars = { ...existingConfig.production?.env_vars || {} };
    const previewEnvVars = { ...existingConfig.preview?.env_vars || {} };
    
    let needsUpdate = false;
    for (const [key, value] of Object.entries(envVars)) {
      if (productionEnvVars[key]?.value !== value) {
        productionEnvVars[key] = { value };
        previewEnvVars[key] = { value };
        needsUpdate = true;
      }
    }
    
    if (!needsUpdate) {
      console.log('✅ Cloudflare environment variables are already set correctly!\n');
      return true;
    }
    
    // Update project config
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deployment_configs: {
            production: {
              env_vars: productionEnvVars
            },
            preview: {
              env_vars: previewEnvVars
            }
          }
        })
      }
    );
    
    const updateData = await updateResponse.json();
    
    if (updateData.success) {
      console.log('✅ Cloudflare environment variables updated!\n');
      console.log('   Variables set:');
      Object.keys(envVars).forEach(key => {
        console.log(`   - ${key}`);
      });
      console.log('\n   ⚠️  You may need to redeploy for changes to take effect\n');
      return true;
    } else {
      console.error('❌ Failed to update Cloudflare:', updateData.errors);
      return false;
    }
  } catch (error) {
    console.error('❌ Error setting up Cloudflare:', error.message);
    return false;
  }
}

async function showNextSteps() {
  console.log('📝 NEXT STEPS:\n');
  console.log('1. ✅ Supabase SQL Setup (if tables don\'t exist):');
  console.log('   https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new\n');
  
  console.log('2. 🔄 Enable Realtime in Supabase:');
  console.log('   https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/database/replication');
  console.log('   Enable Realtime for:');
  console.log('   - public.analytics_page_views');
  console.log('   - public.analytics_visits\n');
  
  console.log('3. 🚀 Access Analytics Dashboard:');
  console.log('   - Log in at: https://streamstickpro.com/admin');
  console.log('   - Navigate to: /admin/analytics\n');
}

async function main() {
  console.log('🚀 Supabase Analytics Complete Setup\n');
  console.log('='.repeat(80));
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);
  
  const tablesExist = await checkSupabaseTables();
  const cloudflareSetup = await setupCloudflareEnv();
  
  await showNextSteps();
  
  console.log('='.repeat(80));
  if (tablesExist && cloudflareSetup) {
    console.log('\n✅ Setup verification complete!');
    console.log('   Your analytics tracker should be working now.\n');
  } else {
    console.log('\n⚠️  Setup incomplete. Please complete the steps above.\n');
  }
}

main().catch(console.error);



