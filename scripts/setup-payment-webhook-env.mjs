#!/usr/bin/env node
// Set up Cloudflare environment variables for payment webhook

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg';
const STRIPE_SECRET_KEY = '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';

async function setupCloudflare() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const projectName = process.env.CLOUDFLARE_PROJECT_NAME || 'streamerstickprofinal';
  
  if (!accountId || !apiToken) {
    console.error('❌ Missing Cloudflare credentials');
    console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }
  
  console.log('🌐 Setting up Cloudflare environment variables for payment webhook...\n');
  
  const envVars = {
    // Stripe
    STRIPE_SECRET_KEY: STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    
    // Resend (for payment emails)
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com',
    OWNER_EMAIL: process.env.OWNER_EMAIL || 'reloadedfiretvteam@gmail.com',
    
    // Supabase
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    
    // Database
    DATABASE_URL: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || '',
  };
  
  // Filter out empty values (except optional ones)
  const definedVars = Object.entries(envVars).filter(([k, v]) => {
    if (['STRIPE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'DATABASE_URL'].includes(k)) {
      return v; // Only include if set
    }
    return v; // Include all others
  });
  
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
      const error = await projectResponse.json();
      console.error(`❌ Failed to fetch project:`, error);
      process.exit(1);
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
      console.log('Variables set:');
      definedVars.forEach(([key]) => {
        const masked = key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')
          ? '***[HIDDEN]'
          : envVars[key];
        console.log(`   ✓ ${key}: ${masked}`);
      });
      console.log('\n📝 Next steps:');
      console.log('   1. Get STRIPE_WEBHOOK_SECRET from Stripe Dashboard → Webhooks → Signing secret');
      console.log('   2. Get RESEND_API_KEY from Resend Dashboard');
      console.log('   3. Get SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API');
      console.log('   4. Run this script again with those values set');
      console.log('   5. Trigger a new deployment in Cloudflare\n');
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

setupCloudflare().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

