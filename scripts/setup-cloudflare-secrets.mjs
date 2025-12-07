#!/usr/bin/env node
// Script to set all required Cloudflare Pages environment variables/secrets

const requiredSecrets = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY', 
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'JWT_SECRET'
];

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    console.error('Please set these environment variables first.');
    process.exit(1);
  }
  
  console.log('Fetching Cloudflare Pages projects...');
  
  const projectsResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const projectsData = await projectsResponse.json();
  
  if (!projectsData.success) {
    console.error('Failed to list projects:', projectsData.errors);
    process.exit(1);
  }
  
  console.log('\nFound Cloudflare Pages projects:');
  projectsData.result.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} (${p.subdomain}.pages.dev)`);
  });
  
  const project = projectsData.result.find(p => 
    p.name.toLowerCase().includes('stream') || 
    p.name.toLowerCase().includes('stick')
  ) || projectsData.result[0];
  
  if (!project) {
    console.error('\nNo projects found!');
    process.exit(1);
  }
  
  console.log(`\nSelected project: ${project.name}`);
  
  console.log('\n--- CHECKING CURRENT ENVIRONMENT VARIABLES ---\n');
  
  const projectResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project.name}`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const projectDetails = await projectResponse.json();
  
  if (projectDetails.success) {
    const envVars = projectDetails.result?.deployment_configs?.production?.env_vars || {};
    const secretBindings = projectDetails.result?.deployment_configs?.production?.secret_bindings || {};
    
    console.log('Current production environment variables:');
    Object.keys(envVars).forEach(key => {
      console.log(`  ✓ ${key}: ${envVars[key].value ? '[SET]' : '[EMPTY]'}`);
    });
    
    if (Object.keys(envVars).length === 0) {
      console.log('  (none set)');
    }
    
    console.log('\nMissing required secrets:');
    requiredSecrets.forEach(secret => {
      if (!envVars[secret]) {
        console.log(`  ✗ ${secret}`);
      }
    });
  }
  
  console.log('\n--- INSTRUCTIONS TO SET SECRETS ---\n');
  console.log('Option 1: Via Cloudflare Dashboard');
  console.log('1. Go to: https://dash.cloudflare.com');
  console.log(`2. Navigate to: Workers & Pages > ${project.name} > Settings > Environment variables`);
  console.log('3. Click "Add variable" for each missing secret');
  console.log('4. Make sure to set them for PRODUCTION environment');
  console.log('5. Check "Encrypt" for sensitive values like API keys');
  
  console.log('\nOption 2: Via Wrangler CLI (run these commands):');
  console.log('```');
  requiredSecrets.forEach(secret => {
    console.log(`npx wrangler pages secret put ${secret} --project-name=${project.name}`);
  });
  console.log('```');
  
  console.log('\n--- REQUIRED VALUES ---\n');
  console.log('Get these from your Stripe Dashboard, Supabase Dashboard, and Resend Dashboard:');
  console.log('');
  console.log('DATABASE_URL: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
  console.log('STRIPE_SECRET_KEY: sk_live_... (from Stripe Dashboard > Developers > API Keys)');
  console.log('STRIPE_PUBLISHABLE_KEY: pk_live_... (from Stripe Dashboard)');
  console.log('STRIPE_WEBHOOK_SECRET: whsec_... (from Stripe Dashboard > Webhooks)');
  console.log('RESEND_API_KEY: re_... (from Resend Dashboard)');
  console.log('RESEND_FROM_EMAIL: noreply@yourdomain.com');
  console.log('VITE_SUPABASE_URL: https://[project-ref].supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY: eyJ... (from Supabase Dashboard > Settings > API)');
  
  console.log('\n--- AFTER SETTING SECRETS ---\n');
  console.log('1. Trigger a new deployment from GitHub or run:');
  console.log(`   npx wrangler pages deployment create . --project-name=${project.name}`);
  console.log('2. Test checkout on your live site');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
