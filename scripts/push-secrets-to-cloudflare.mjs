#!/usr/bin/env node
// Automatically push all required secrets to Cloudflare Pages

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const projectName = 'streamerstickpro-live';
  
  if (!accountId || !apiToken) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }
  
  const secrets = {
    DATABASE_URL: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: 'noreply@streamstickpro.com',  // Fixed: Matches wrangler.toml and actual code usage
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    JWT_SECRET: process.env.SESSION_SECRET || 'streamstickpro-jwt-secret-2025',
    NODE_ENV: 'production'
  };
  
  console.log('Checking required secrets...\n');
  
  const missing = [];
  for (const [key, value] of Object.entries(secrets)) {
    if (!value && !['STRIPE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_KEY'].includes(key)) {
      missing.push(key);
      console.log(`✗ ${key}: MISSING`);
    } else if (value) {
      console.log(`✓ ${key}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`○ ${key}: (optional, not set)`);
    }
  }
  
  if (missing.length > 0) {
    console.error(`\nMissing required secrets: ${missing.join(', ')}`);
    console.error('Please set these environment variables first.');
    process.exit(1);
  }
  
  console.log('\nFetching current project configuration...');
  
  const projectResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const projectData = await projectResponse.json();
  
  if (!projectData.success) {
    console.error('Failed to fetch project:', projectData.errors);
    process.exit(1);
  }
  
  console.log(`Found project: ${projectData.result.name}`);
  
  const envVars = {};
  for (const [key, value] of Object.entries(secrets)) {
    if (value) {
      envVars[key] = { value };
    }
  }
  
  console.log(`\nSetting ${Object.keys(envVars).length} environment variables...`);
  
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
            env_vars: envVars
          }
        }
      })
    }
  );
  
  const updateData = await updateResponse.json();
  
  if (!updateData.success) {
    console.error('Failed to update environment variables:', updateData.errors);
    process.exit(1);
  }
  
  console.log('\n✓ All environment variables set successfully!');
  console.log('\nNext steps:');
  console.log('1. Trigger a new deployment from GitHub');
  console.log('   OR run: npx wrangler pages deployment create . --project-name=streamerstickpro-live');
  console.log('2. Wait for deployment to complete');
  console.log('3. Test checkout on your live site: https://streamstickpro.com');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
