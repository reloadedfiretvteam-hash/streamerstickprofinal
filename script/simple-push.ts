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
  'worker/index.ts',
  'worker/db.ts',
  'worker/storage.ts',
  'worker/email.ts',
  'worker/routes/products.ts',
  'worker/routes/checkout.ts',
  'worker/routes/orders.ts',
  'worker/routes/admin.ts',
  'worker/routes/webhook.ts',
  'worker/routes/visitors.ts',
  'worker/routes/customers.ts',
  'worker/routes/trial.ts',
  'worker/routes/auth.ts',
  'wrangler.toml',
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
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const base64Content = Buffer.from(content).toString('base64');
  
  const existingSha = await getFileSha(octokit, filePath);
  
  console.log(`Pushing ${filePath}...`);
  
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    message: `Update ${filePath}`,
    content: base64Content,
    branch: BRANCH,
    ...(existingSha ? { sha: existingSha } : {}),
  });
  
  console.log(`  Done: ${filePath}`);
}

async function pushFiles() {
  const octokit = await getUncachableGitHubClient();
  
  console.log(`Pushing ${filesToPush.length} files to ${OWNER}/${REPO}@${BRANCH}...`);
  
  for (const filePath of filesToPush) {
    try {
      await pushFile(octokit, filePath);
    } catch (error: any) {
      console.error(`Error pushing ${filePath}:`, error.message);
    }
  }
  
  console.log('\nDone! GitHub Actions should now trigger the Cloudflare deployment.');
}

pushFiles().catch(console.error);
