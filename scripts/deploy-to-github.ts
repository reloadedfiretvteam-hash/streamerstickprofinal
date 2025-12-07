import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  'dist',
  '.replit',
  '.config',
  '.local',
  'attached_assets',
  '*.log',
  '.upm',
  '.DS_Store',
  'package-lock.json'
];

function shouldIgnore(filePath: string): boolean {
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.startsWith('*')) {
      if (filePath.endsWith(pattern.slice(1))) return true;
    } else if (filePath.includes(pattern)) {
      return true;
    }
  }
  return false;
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (shouldIgnore(relativePath)) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function main() {
  console.log('Connecting to GitHub...');
  const octokit = await getUncachableGitHubClient();
  
  // Get the latest commit SHA from clean-main
  console.log(`Getting latest commit from ${BRANCH}...`);
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`
  });
  const latestCommitSha = ref.object.sha;
  console.log(`Latest commit: ${latestCommitSha}`);
  
  // Get the tree from latest commit
  const { data: latestCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: latestCommitSha
  });
  
  // Get all files to upload
  const projectRoot = process.cwd();
  const files = getAllFiles(projectRoot);
  console.log(`Found ${files.length} files to upload`);
  
  // Create blobs for each file
  const tree: Array<{path: string, mode: '100644', type: 'blob', sha: string}> = [];
  
  for (const file of files) {
    const filePath = path.join(projectRoot, file);
    const content = fs.readFileSync(filePath);
    const base64Content = content.toString('base64');
    
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: base64Content,
        encoding: 'base64'
      });
      
      tree.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      console.log(`Uploaded: ${file}`);
    } catch (err: any) {
      console.error(`Failed to upload ${file}: ${err.message}`);
    }
  }
  
  // Create a new tree
  console.log('Creating tree...');
  const { data: newTree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree,
    base_tree: latestCommit.tree.sha
  });
  
  // Create a new commit
  console.log('Creating commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: 'Deploy: Update all files from Replit',
    tree: newTree.sha,
    parents: [latestCommitSha]
  });
  
  // Update the branch reference
  console.log('Updating branch...');
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha
  });
  
  console.log(`Successfully pushed to ${BRANCH}!`);
  console.log(`New commit SHA: ${newCommit.sha}`);
}

main().catch(console.error);
