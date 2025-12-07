import { Octokit } from '@octokit/rest';
import _sodium from 'libsodium-wrappers';

const REPO_OWNER = 'reloadedfiretvteam-hash';
const REPO_NAME = 'streamerstickprofinal';
const CLOUDFLARE_PROJECT_NAME = 'streamerstickpro-live';

interface Credentials {
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  resend: {
    apiKey: string;
    fromEmail: string;
  };
  github: {
    accessToken: string;
  };
  cloudflare: {
    apiToken: string;
    accountId: string;
  };
  database: {
    url: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
}

async function getReplitConnectorCredentials(connectorName: string): Promise<any> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    return null;
  }

  try {
    const response = await fetch(
      `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=${connectorName}`,
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    const data = await response.json();
    return data.items?.[0]?.settings || null;
  } catch (error) {
    console.error(`Failed to get ${connectorName} connector:`, error);
    return null;
  }
}

async function getAllCredentials(): Promise<Credentials> {
  console.log('Fetching credentials from all sources...\n');

  // Get Stripe credentials from connectors or environment
  const stripeSettings = await getReplitConnectorCredentials('stripe');
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || stripeSettings?.secret_key;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || stripeSettings?.publishable_key;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Get Resend credentials from connectors or environment
  const resendSettings = await getReplitConnectorCredentials('resend');
  const resendApiKey = process.env.RESEND_API_KEY || resendSettings?.api_key;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  // Get GitHub credentials from connectors or environment
  const githubSettings = await getReplitConnectorCredentials('github');
  const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 
                      githubSettings?.access_token ||
                      githubSettings?.oauth?.credentials?.access_token;

  // Get Cloudflare credentials from environment
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  // Get Database URL from environment
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  // Get Supabase credentials from environment (these are public keys, safe to expose)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  return {
    stripe: {
      secretKey: stripeSecretKey!,
      publishableKey: stripePublishableKey!,
      webhookSecret: stripeWebhookSecret!
    },
    resend: {
      apiKey: resendApiKey!,
      fromEmail: resendFromEmail!
    },
    github: {
      accessToken: githubToken!
    },
    cloudflare: {
      apiToken: cloudflareApiToken!,
      accountId: cloudflareAccountId!
    },
    database: {
      url: databaseUrl!
    },
    supabase: {
      url: supabaseUrl!,
      anonKey: supabaseAnonKey!
    }
  };
}

async function encryptSecret(publicKey: string, secretValue: string): Promise<string> {
  await _sodium.ready;
  const sodium = _sodium;
  
  const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
  const binsec = sodium.from_string(secretValue);
  const encBytes = sodium.crypto_box_seal(binsec, binkey);
  return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}

async function setGitHubSecret(octokit: Octokit, secretName: string, secretValue: string): Promise<boolean> {
  try {
    // Get the repository public key for encrypting secrets
    const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
      owner: REPO_OWNER,
      repo: REPO_NAME
    });

    const encryptedValue = await encryptSecret(publicKeyData.key, secretValue);

    await octokit.actions.createOrUpdateRepoSecret({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: publicKeyData.key_id
    });

    console.log(`  ✓ GitHub: ${secretName}`);
    return true;
  } catch (error: any) {
    console.error(`  ✗ GitHub: ${secretName} - ${error.message}`);
    return false;
  }
}

async function setCloudflareEnvVar(
  apiToken: string, 
  accountId: string, 
  varName: string, 
  varValue: string
): Promise<boolean> {
  try {
    // First, get the project to find its ID
    const projectResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${CLOUDFLARE_PROJECT_NAME}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!projectResponse.ok) {
      const error = await projectResponse.text();
      throw new Error(`Failed to get project: ${error}`);
    }

    const projectData = await projectResponse.json();
    const currentEnvVars = projectData.result?.deployment_configs?.production?.env_vars || {};

    // Update with the new variable
    const updatedEnvVars = {
      ...currentEnvVars,
      [varName]: { value: varValue }
    };

    // Update the project with new environment variables
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${CLOUDFLARE_PROJECT_NAME}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deployment_configs: {
            production: {
              env_vars: updatedEnvVars
            }
          }
        })
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update: ${error}`);
    }

    console.log(`  ✓ Cloudflare: ${varName}`);
    return true;
  } catch (error: any) {
    console.error(`  ✗ Cloudflare: ${varName} - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('StreamStickPro - External Secrets Setup');
  console.log('='.repeat(60));
  console.log('');

  const creds = await getAllCredentials();

  // Validate we have all required credentials
  const missing: string[] = [];
  if (!creds.stripe.secretKey) missing.push('STRIPE_SECRET_KEY');
  if (!creds.stripe.publishableKey) missing.push('STRIPE_PUBLISHABLE_KEY');
  if (!creds.stripe.webhookSecret) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!creds.resend.apiKey) missing.push('RESEND_API_KEY');
  if (!creds.resend.fromEmail) missing.push('RESEND_FROM_EMAIL');
  if (!creds.github.accessToken) missing.push('GITHUB_TOKEN');
  if (!creds.cloudflare.apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!creds.cloudflare.accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!creds.database.url) missing.push('DATABASE_URL');
  if (!creds.supabase.url) missing.push('VITE_SUPABASE_URL');
  if (!creds.supabase.anonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    console.log('Missing required credentials:');
    missing.forEach(m => console.log(`  - ${m}`));
    console.log('\nPlease set these environment variables and try again.');
    process.exit(1);
  }

  console.log('All credentials found!\n');

  // Set up GitHub secrets
  console.log('Setting GitHub Repository Secrets...');
  const octokit = new Octokit({ auth: creds.github.accessToken });

  const githubSecrets = {
    'STRIPE_SECRET_KEY': creds.stripe.secretKey,
    'STRIPE_PUBLISHABLE_KEY': creds.stripe.publishableKey,
    'STRIPE_WEBHOOK_SECRET': creds.stripe.webhookSecret,
    'RESEND_API_KEY': creds.resend.apiKey,
    'RESEND_FROM_EMAIL': creds.resend.fromEmail,
    'DATABASE_URL': creds.database.url,
    'VITE_SUPABASE_URL': creds.supabase.url,
    'VITE_SUPABASE_ANON_KEY': creds.supabase.anonKey,
    'CLOUDFLARE_API_TOKEN': creds.cloudflare.apiToken,
    'CLOUDFLARE_ACCOUNT_ID': creds.cloudflare.accountId
  };

  for (const [name, value] of Object.entries(githubSecrets)) {
    await setGitHubSecret(octokit, name, value);
  }

  console.log('');

  // Set up Cloudflare environment variables
  console.log('Setting Cloudflare Pages Environment Variables...');
  
  const cloudflareVars = {
    'DATABASE_URL': creds.database.url,
    'STRIPE_SECRET_KEY': creds.stripe.secretKey,
    'STRIPE_PUBLISHABLE_KEY': creds.stripe.publishableKey,
    'STRIPE_WEBHOOK_SECRET': creds.stripe.webhookSecret,
    'RESEND_API_KEY': creds.resend.apiKey,
    'RESEND_FROM_EMAIL': creds.resend.fromEmail,
    'WEBHOOK_PUBLIC_BASE_URL': 'https://secure.streamstickpro.com',
    'VITE_SECURE_HOSTS': 'secure.streamstickpro.com'
  };

  for (const [name, value] of Object.entries(cloudflareVars)) {
    await setCloudflareEnvVar(
      creds.cloudflare.apiToken,
      creds.cloudflare.accountId,
      name,
      value
    );
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Setup Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Your app is now configured to run independently from Replit.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Push your code to GitHub (clean-main branch)');
  console.log('2. GitHub Actions will automatically deploy to Cloudflare');
  console.log('3. Your app will be live at secure.streamstickpro.com');
}

main().catch(console.error);
