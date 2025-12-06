// Script to set Cloudflare Pages environment variables via API

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }
  
  const projectName = 'streamerstickprofinal';
  
  console.log(`Setting environment variables for project: ${projectName}\n`);
  
  // Get current project details first
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
    console.error('Failed to get project:', projectData.errors);
    process.exit(1);
  }
  
  console.log('Current project config:');
  console.log(`  Name: ${projectData.result.name}`);
  console.log(`  Subdomain: ${projectData.result.subdomain}`);
  console.log(`  Production branch: ${projectData.result.production_branch}`);
  
  // Define the environment variables to set
  const envVars = {
    // Database
    DATABASE_URL: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL,
    
    // Stripe - check for both naming conventions
    STRIPE_SECRET_KEY: process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
    
    // Resend - fetch from connector
    RESEND_API_KEY: null, // Will be fetched from connector
    RESEND_FROM_EMAIL: 'noreply@streamstickpro.com',
    
    // Supabase
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://emlqlmfzqsnqokrqvmcm.supabase.co',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    
    // Other
    VITE_SECURE_HOSTS: process.env.VITE_SECURE_HOSTS || 'secure.streamstickpro.com',
    SESSION_SECRET: process.env.SESSION_SECRET,
    GITHUB_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  };
  
  // Try to get Resend API key from connector
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (hostname && xReplitToken) {
      const connectorResponse = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      );
      const connectorData = await connectorResponse.json();
      const resendConnection = connectorData.items?.[0];
      if (resendConnection?.settings?.api_key) {
        envVars.RESEND_API_KEY = resendConnection.settings.api_key;
        console.log('\n✅ Retrieved Resend API key from connector');
      }
    }
  } catch (err) {
    console.log('\n⚠️ Could not fetch Resend key from connector:', err.message);
  }
  
  // Filter out undefined/null values
  const definedVars = Object.entries(envVars).filter(([k, v]) => v !== null && v !== undefined);
  
  console.log(`\nSetting ${definedVars.length} environment variables...`);
  
  // Build the deployment_configs structure for the PATCH request
  const existingConfig = projectData.result.deployment_configs || {};
  
  const productionEnvVars = {};
  const previewEnvVars = {};
  
  for (const [key, value] of definedVars) {
    productionEnvVars[key] = { value };
    previewEnvVars[key] = { value };
  }
  
  const patchBody = {
    deployment_configs: {
      production: {
        env_vars: productionEnvVars
      },
      preview: {
        env_vars: previewEnvVars
      }
    }
  };
  
  // Update the project with new environment variables
  const updateResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchBody)
    }
  );
  
  const updateData = await updateResponse.json();
  
  if (!updateData.success) {
    console.error('\n❌ Failed to update environment variables:');
    console.error(JSON.stringify(updateData.errors, null, 2));
    process.exit(1);
  }
  
  console.log('\n✅ Environment variables updated successfully!\n');
  console.log('Variables set:');
  for (const [key, value] of definedVars) {
    const maskedValue = key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN') || key.includes('PASSWORD') || key.includes('URL')
      ? value.substring(0, 10) + '...[HIDDEN]'
      : value;
    console.log(`  ${key}: ${maskedValue}`);
  }
  
  console.log('\n📝 Note: You may need to trigger a new deployment for changes to take effect.');
  console.log('   Go to Cloudflare Dashboard → Pages → streamerstickprofinal → Deployments');
  console.log('   Click "Retry deployment" on the latest deployment.');
}

main().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
