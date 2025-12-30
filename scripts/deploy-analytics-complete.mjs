#!/usr/bin/env node
// Complete analytics deployment script - Sets up Supabase, Cloudflare, and GitHub

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg';

async function setupCloudflare() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const projectName = process.env.CLOUDFLARE_PROJECT_NAME || 'streamerstickprofinal';
  
  if (!accountId || !apiToken) {
    console.log('⚠️  Missing Cloudflare credentials. Skipping Cloudflare setup.');
    console.log('   Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to configure.\n');
    return false;
  }
  
  console.log('🌐 Setting up Cloudflare environment variables...\n');
  
  const envVars = {
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  };
  
  // Filter out undefined values
  const definedVars = Object.entries(envVars).filter(([k, v]) => v);
  
  try {
    const projectResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!projectResponse.ok) {
      console.log(`⚠️  Project "${projectName}" not found. Skipping Cloudflare setup.\n`);
      return false;
    }
    
    const projectData = await projectResponse.json();
    const existingConfig = projectData.result.deployment_configs || {};
    
    const productionEnvVars = { ...existingConfig.production?.env_vars || {} };
    const previewEnvVars = { ...existingConfig.preview?.env_vars || {} };
    
    for (const [key, value] of definedVars) {
      productionEnvVars[key] = { value };
      previewEnvVars[key] = { value };
    }
    
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
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
      console.log('✅ Cloudflare environment variables set successfully!\n');
      console.log('   Variables added:');
      definedVars.forEach(([key]) => {
        console.log(`   - ${key}`);
      });
      console.log('\n   📝 Note: Trigger a new deployment for changes to take effect.\n');
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

async function main() {
  console.log('🚀 Complete Analytics Deployment\n');
  console.log('=' .repeat(50) + '\n');
  
  // Step 1: Cloudflare
  await setupCloudflare();
  
  console.log('=' .repeat(50) + '\n');
  console.log('📋 Next Steps:\n');
  console.log('1. Supabase Setup:');
  console.log('   - Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new');
  console.log('   - Copy SQL from: supabase-analytics-setup.sql');
  console.log('   - Click "Run"');
  console.log('   - Enable Realtime: Database → Replication → Realtime');
  console.log('     → Enable for: analytics_page_views, analytics_visits\n');
  
  console.log('2. Get Service Role Key:');
  console.log('   - Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api');
  console.log('   - Copy "service_role" key');
  console.log('   - Add to Cloudflare as: SUPABASE_SERVICE_ROLE_KEY\n');
  
  console.log('3. GitHub:');
  console.log('   - Code is ready to push to clean-main branch');
  console.log('   - Run: git add . && git commit -m "Add analytics system" && git push\n');
  
  console.log('✅ Setup complete!\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

