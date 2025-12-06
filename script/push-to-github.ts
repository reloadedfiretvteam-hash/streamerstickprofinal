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
  'wrangler.toml',
  'script/build-worker.ts',
  '.github/workflows/deploy-cloudflare.yml',
];

async function pushFiles() {
  const octokit = await getUncachableGitHubClient();
  
  console.log('Getting current branch reference...');
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
  });
  const currentSha = ref.object.sha;
  console.log(`Current commit SHA: ${currentSha}`);

  console.log('Getting current commit tree...');
  const { data: currentCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: currentSha,
  });
  const baseTreeSha = currentCommit.tree.sha;

  console.log('Creating blobs for files...');
  const treeItems: Array<{
    path: string;
    mode: '100644';
    type: 'blob';
    sha: string;
  }> = [];

  for (const filePath of filesToPush) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${filePath} - file not found`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    console.log(`Creating blob for ${filePath}...`);
    
    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(content).toString('base64'),
      encoding: 'base64',
    });
    
    treeItems.push({
      path: filePath,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  console.log(`Creating new tree with ${treeItems.length} files...`);
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: 'Cloudflare Workers migration - remove all Replit dependencies',
    tree: newTree.sha,
    parents: [currentSha],
  });
  console.log(`New commit SHA: ${newCommit.sha}`);

  console.log('Updating branch reference...');
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha,
  });

  console.log(`Successfully pushed ${treeItems.length} files to ${BRANCH}!`);
  console.log('GitHub Actions should now trigger the Cloudflare deployment.');
}

pushFiles().catch(console.error);
