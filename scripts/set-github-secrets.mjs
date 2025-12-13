// Script to set GitHub repository secrets for CI/CD workflows
import { Octokit } from '@octokit/rest';
import sodium from 'libsodium-wrappers';

async function getGitHubToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (hostname && xReplitToken) {
    try {
      const response = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      );
      const data = await response.json();
      const connectionSettings = data.items?.[0];
      const accessToken = connectionSettings?.settings?.access_token || 
                          connectionSettings?.settings?.oauth?.credentials?.access_token;
      if (accessToken) {
        console.log('✅ Retrieved GitHub token from Replit connector');
        return accessToken;
      }
    } catch (err) {
      console.log('⚠️ Could not fetch GitHub token from connector:', err.message);
    }
  }

  const envToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (envToken) {
    console.log('✅ Using GitHub token from environment variable');
    return envToken;
  }

  throw new Error('No GitHub token available');
}

async function encryptSecret(publicKeyBase64, secretValue) {
  await sodium.ready;
  
  const binKey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);
  const binSec = sodium.from_string(secretValue);
  const encBytes = sodium.crypto_box_seal(binSec, binKey);
  
  return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}

async function main() {
  await sodium.ready;
  
  const token = await getGitHubToken();
  const octokit = new Octokit({ auth: token });
  
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  
  console.log(`\nSetting secrets for repository: ${owner}/${repo}\n`);
  
  const { data: repoPublicKey } = await octokit.actions.getRepoPublicKey({
    owner,
    repo
  });
  
  console.log(`Repository public key ID: ${repoPublicKey.key_id}`);
  
  const secrets = {};
  
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    secrets.CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  }
  if (process.env.CLOUDFLARE_API_TOKEN) {
    secrets.CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  }
  
  if (process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL) {
    secrets.DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  }
  
  const stripeSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (stripeSecretKey) {
    secrets.STRIPE_SECRET_KEY = stripeSecretKey;
  }
  if (stripePublishableKey) {
    secrets.STRIPE_PUBLISHABLE_KEY = stripePublishableKey;
  }
  
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (hostname && xReplitToken) {
      const response = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      );
      const data = await response.json();
      const resendConnection = data.items?.[0];
      if (resendConnection?.settings?.api_key) {
        secrets.RESEND_API_KEY = resendConnection.settings.api_key;
        console.log('✅ Retrieved Resend API key from connector');
      }
    }
  } catch (err) {
    console.log('⚠️ Could not fetch Resend key from connector:', err.message);
  }
  
  if (process.env.VITE_SUPABASE_URL) {
    secrets.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  }
  if (process.env.VITE_SUPABASE_ANON_KEY) {
    secrets.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  }
  if (process.env.SESSION_SECRET) {
    secrets.SESSION_SECRET = process.env.SESSION_SECRET;
  }
  
  // Add additional secrets
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    secrets.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  }
  if (process.env.SUPABASE_SERVICE_KEY) {
    secrets.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  }
  if (process.env.ADMIN_USERNAME) {
    secrets.ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  }
  if (process.env.ADMIN_PASSWORD) {
    secrets.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  }
  const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'streamstickpro-jwt-secret-2025';
  secrets.JWT_SECRET = jwtSecret;

  const requiredSecrets = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_API_TOKEN', 
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'RESEND_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SESSION_SECRET',
    'SUPABASE_SERVICE_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'JWT_SECRET'
  ];
  
  const missingSecrets = requiredSecrets.filter(name => !secrets[name]);
  
  if (missingSecrets.length > 0) {
    console.error('\n❌ Missing required secrets:');
    missingSecrets.forEach(name => console.error(`  - ${name}`));
    console.error('\nPlease ensure all environment variables/connectors are configured.');
    process.exit(1);
  }
  
  console.log(`\nSetting ${Object.keys(secrets).length} secrets...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [name, value] of Object.entries(secrets)) {
    try {
      const encryptedValue = await encryptSecret(repoPublicKey.key, value);
      
      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: name,
        encrypted_value: encryptedValue,
        key_id: repoPublicKey.key_id
      });
      
      console.log(`  ✅ ${name}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ ${name}: ${err.message}`);
      failCount++;
    }
  }
  
  if (failCount > 0) {
    console.error(`\n❌ Failed to set ${failCount} secrets.`);
    process.exit(1);
  }
  
  console.log(`\n✅ All ${successCount} GitHub repository secrets configured successfully!\n`);
  console.log('These secrets are now available in GitHub Actions workflows.');
}

main().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
