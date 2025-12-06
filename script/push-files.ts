import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken!
      }
    }
  ).then(res => res.json()).then((data: any) => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  return accessToken;
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
  'wrangler.toml',
  'script/build-worker.ts',
  '.github/workflows/deploy-cloudflare.yml',
];

async function getFileSha(octokit: Octokit, filePath: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      ref: BRANCH
    });
    if (!Array.isArray(data) && data.type === 'file') {
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
    console.log(`Skipping ${filePath} - file not found locally`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const sha = await getFileSha(octokit, filePath);
  
  console.log(`Pushing ${filePath}...`);
  
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    message: `Update ${filePath} - Cloudflare Workers migration`,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
    sha: sha || undefined
  });
  
  console.log(`  ✓ ${filePath} pushed`);
}

async function pushAllFiles() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Pushing files to GitHub...\n');
  
  for (const filePath of filesToPush) {
    try {
      await pushFile(octokit, filePath);
    } catch (error: any) {
      console.error(`  ✗ Failed to push ${filePath}: ${error.message}`);
    }
  }
  
  console.log('\nDone! GitHub Actions should now trigger the Cloudflare deployment.');
}

pushAllFiles().catch(console.error);
