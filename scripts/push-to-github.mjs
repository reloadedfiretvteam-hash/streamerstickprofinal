import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  '.local',
  'dist',
  '.replit',
  'replit.nix',
  '.upm',
  '.config',
  'attached_assets',
  'bun.lock',
  '.env',
  'tmp',
  '/tmp',
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.startsWith('/')) {
      return filePath.startsWith(pattern.slice(1));
    }
    return filePath.includes(pattern);
  });
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (shouldExclude(relativePath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  
  return files;
}

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && 
      new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
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

  const accessToken = connectionSettings?.settings?.access_token || 
                      connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  console.log('=== Pushing to GitHub ===\n');
  console.log(`Repository: ${OWNER}/${REPO}`);
  console.log(`Branch: ${BRANCH}\n`);
  
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const baseDir = process.cwd();
  const files = getAllFiles(baseDir);
  
  console.log(`Found ${files.length} files to sync\n`);
  
  const { data: refData } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`
  });
  const latestCommitSha = refData.object.sha;
  console.log(`Latest commit: ${latestCommitSha}\n`);
  
  const { data: commitData } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: latestCommitSha
  });
  const baseTreeSha = commitData.tree.sha;
  
  console.log('Creating blobs for files...\n');
  
  const treeItems = [];
  let processed = 0;
  
  for (const filePath of files) {
    const fullPath = path.join(baseDir, filePath);
    
    try {
      const content = fs.readFileSync(fullPath);
      const isText = !content.includes(0x00);
      
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: isText ? content.toString('utf-8') : content.toString('base64'),
        encoding: isText ? 'utf-8' : 'base64'
      });
      
      treeItems.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      processed++;
      if (processed % 50 === 0) {
        console.log(`Processed ${processed}/${files.length} files...`);
      }
    } catch (err) {
      console.log(`Warning: Could not process ${filePath}: ${err.message}`);
    }
  }
  
  console.log(`\nCreated ${treeItems.length} blobs`);
  console.log('Creating tree...\n');
  
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: treeItems
  });
  
  console.log(`New tree SHA: ${newTree.sha}`);
  console.log('Creating commit...\n');
  
  const commitMessage = `Enhanced Fire Stick product cards - ${new Date().toISOString()}

Updates:
- Multi-layer gradient backgrounds with depth
- Tech grid pattern overlays
- Accent glow effects at card tops
- Corner decorations with gradients
- Animated border glow on hover
- Unique color themes per product tier`;
  
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: commitMessage,
    tree: newTree.sha,
    parents: [latestCommitSha]
  });
  
  console.log(`New commit SHA: ${newCommit.sha}`);
  console.log('Updating branch reference...\n');
  
  try {
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha,
      force: true
    });
  } catch (updateError) {
    console.log('Standard update failed, retrying with force...');
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha,
      force: true
    });
  }
  
  console.log('=== Push Complete! ===\n');
  console.log(`Successfully pushed ${treeItems.length} files to ${OWNER}/${REPO}@${BRANCH}`);
  console.log(`Commit: ${newCommit.sha}`);
  console.log(`\nCloudflare should now automatically deploy the changes.`);
}

main().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
