import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

const filesToPush = [
  // Worker files
  'worker/index.ts',
  'worker/db.ts',
  'worker/storage.ts',
  'worker/email.ts',
  'worker/helpers.ts',
  'worker/routes/products.ts',
  'worker/routes/checkout.ts',
  'worker/routes/orders.ts',
  'worker/routes/admin.ts',
  'worker/routes/webhook.ts',
  'worker/routes/visitors.ts',
  'worker/routes/customers.ts',
  'worker/routes/trial.ts',
  'worker/routes/auth.ts',
  'worker/routes/blog.ts',
  
  // Config files
  'wrangler.toml',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'vite.config.cloudflare.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  
  // Build scripts
  'script/build-worker.ts',
  
  // Server files
  'server/index.ts',
  'server/routes.ts',
  'server/storage.ts',
  'server/db.ts',
  'server/seed-products.ts',
  'server/seedBlog.ts',
  'server/webhookHandlers.ts',
  'server/emailService.ts',
  'server/stripeClient.ts',
  'server/stripeClient.cloudflare.ts',
  'server/resendClient.ts',
  'server/resendClient.cloudflare.ts',
  
  // Shared schema
  'shared/schema.ts',
  
  // Client core files
  'client/index.html',
  'client/src/main.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  
  // Client pages
  'client/src/pages/MainStore.tsx',
  'client/src/pages/ShadowStore.tsx',
  'client/src/pages/Checkout.tsx',
  'client/src/pages/Success.tsx',
  'client/src/pages/AdminPanel.tsx',
  'client/src/pages/CustomerLogin.tsx',
  'client/src/pages/CustomerPortal.tsx',
  'client/src/pages/Blog.tsx',
  'client/src/pages/BlogPost.tsx',
  
  // Client lib
  'client/src/lib/api.ts',
  'client/src/lib/store.ts',
  'client/src/lib/supabase.ts',
  'client/src/lib/utils.ts',
];

async function getFileSha(octokit: Octokit, filePath: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      ref: BRANCH,
    });
    if (!Array.isArray(data) && 'sha' in data) {
      return data.sha;
    }
    return null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function pushFile(octokit: Octokit, filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }
  
  const content = fs.readFileSync(fullPath);
  const base64Content = content.toString('base64');
  
  const existingSha = await getFileSha(octokit, filePath);
  
  console.log(`Pushing ${filePath}...`);
  
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      message: `Sync ${filePath} from Replit`,
      content: base64Content,
      branch: BRANCH,
      ...(existingSha && { sha: existingSha }),
    });
    console.log(`  Done: ${filePath}`);
  } catch (error: any) {
    console.error(`Error pushing ${filePath}: ${error.message}`);
  }
}

async function main() {
  const octokit = await getUncachableGitHubClient();
  
  console.log(`Syncing ${filesToPush.length} files to ${OWNER}/${REPO}@${BRANCH}...`);
  
  for (const filePath of filesToPush) {
    await pushFile(octokit, filePath);
  }
  
  console.log('\nSync complete! Cloudflare should automatically deploy.');
}

main().catch(console.error);
