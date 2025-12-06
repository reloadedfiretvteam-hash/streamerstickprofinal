import { Octokit } from '@octokit/rest';
import { readFile } from 'fs/promises';

let connectionSettings;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  const branch = 'clean-main';
  
  // Read the updated vite.config.ts
  const viteConfig = await readFile('/tmp/vite.config.ts', 'utf-8');
  
  // Get current reference for the branch
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const latestCommitSha = ref.object.sha;
  console.log('Latest commit:', latestCommitSha);
  
  // Get the tree for the latest commit
  const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const treeSha = commit.tree.sha;
  
  // Create blob for the updated vite.config.ts
  const { data: blob } = await octokit.git.createBlob({
    owner,
    repo,
    content: viteConfig,
    encoding: 'utf-8'
  });
  console.log('Created blob for vite.config.ts:', blob.sha);
  
  // Create new tree
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: [{
      path: 'vite.config.ts',
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    }]
  });
  console.log('Created new tree:', newTree.sha);
  
  // Create a new commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Fix vite.config.ts - make Replit plugins conditional for Cloudflare compatibility',
    tree: newTree.sha,
    parents: [latestCommitSha]
  });
  console.log('Created new commit:', newCommit.sha);
  
  // Update the branch reference
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha
  });
  console.log('Updated branch reference to:', newCommit.sha);
  console.log('Successfully pushed vite.config.ts fix to GitHub!');
}

main().catch(err => console.error('Error:', err.message));
