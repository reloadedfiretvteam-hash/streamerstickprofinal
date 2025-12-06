import { Octokit } from '@octokit/rest';

let connectionSettings;

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

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  const branch = 'clean-main';
  
  // Read package.json from local
  const fs = await import('fs/promises');
  const packageJsonContent = await fs.readFile('/home/runner/workspace/package.json', 'utf-8');
  const packageLockContent = await fs.readFile('/home/runner/workspace/package-lock.json', 'utf-8');
  
  // Get current reference for the branch
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`
  });
  const latestCommitSha = ref.object.sha;
  console.log('Latest commit:', latestCommitSha);
  
  // Get the tree for the latest commit
  const { data: commit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha
  });
  const treeSha = commit.tree.sha;
  console.log('Tree SHA:', treeSha);
  
  // Create blobs for both files
  const { data: packageJsonBlob } = await octokit.git.createBlob({
    owner,
    repo,
    content: packageJsonContent,
    encoding: 'utf-8'
  });
  console.log('Created package.json blob:', packageJsonBlob.sha);
  
  const { data: packageLockBlob } = await octokit.git.createBlob({
    owner,
    repo,
    content: packageLockContent,
    encoding: 'utf-8'
  });
  console.log('Created package-lock.json blob:', packageLockBlob.sha);
  
  // Create new tree with the updated files
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: [
      {
        path: 'package.json',
        mode: '100644',
        type: 'blob',
        sha: packageJsonBlob.sha
      },
      {
        path: 'package-lock.json',
        mode: '100644',
        type: 'blob',
        sha: packageLockBlob.sha
      }
    ]
  });
  console.log('Created new tree:', newTree.sha);
  
  // Create a new commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Move build tools to regular dependencies for Cloudflare Pages compatibility',
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
  console.log('Successfully pushed changes to GitHub!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
