import { Octokit } from '@octokit/rest';
import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

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

async function getImageFiles(dir, prefix = '') {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        // Recursively get files from subdirectories
        const subFiles = await getImageFiles(fullPath, relativePath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Only include image files (exclude videos)
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          const stats = await stat(fullPath);
          // Skip files larger than 10MB
          if (stats.size < 10 * 1024 * 1024) {
            files.push({ localPath: fullPath, repoPath: `attached_assets/${relativePath}` });
          }
        }
      }
    }
  } catch (e) {
    console.log(`Error reading ${dir}:`, e.message);
  }
  return files;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  const branch = 'clean-main';
  
  // Get all image files from attached_assets
  const imageFiles = await getImageFiles('/home/runner/workspace/attached_assets');
  console.log(`Found ${imageFiles.length} image files to push`);
  
  if (imageFiles.length === 0) {
    console.log('No image files found!');
    return;
  }
  
  // Get current reference for the branch
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const latestCommitSha = ref.object.sha;
  console.log('Latest commit:', latestCommitSha);
  
  // Get the tree for the latest commit
  const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const treeSha = commit.tree.sha;
  
  // Create blobs for each image file
  const treeEntries = [];
  for (const file of imageFiles) {
    try {
      const content = await readFile(file.localPath);
      const base64Content = content.toString('base64');
      
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: base64Content,
        encoding: 'base64'
      });
      console.log(`Created blob for ${file.repoPath}: ${blob.sha}`);
      
      treeEntries.push({
        path: file.repoPath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
    } catch (err) {
      console.log(`Error processing ${file.localPath}:`, err.message);
    }
  }
  
  if (treeEntries.length === 0) {
    console.log('No blobs created!');
    return;
  }
  
  // Create new tree with all the image files
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: treeEntries
  });
  console.log('Created new tree:', newTree.sha);
  
  // Create a new commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Add attached_assets image files for production build',
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
  console.log('Successfully pushed all image assets to GitHub!');
}

main().catch(err => console.error('Error:', err.message));
