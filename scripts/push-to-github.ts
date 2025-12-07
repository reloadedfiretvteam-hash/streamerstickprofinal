import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.local',
  'attached_assets',
  '.upm',
  '.config',
  'generated-icon.png',
  '.replit',
  'replit.nix',
  '.gitignore',
  'DEPLOYMENT_GUIDE.md',
  'scripts/push-to-github.ts'
];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
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
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  console.log('Getting current branch ref...');
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`
  });
  const currentSha = ref.object.sha;
  console.log(`Current commit: ${currentSha}`);
  
  console.log('Getting current tree...');
  const { data: commit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: currentSha
  });
  
  console.log('Collecting files...');
  const workDir = process.cwd();
  const files = getAllFiles(workDir);
  console.log(`Found ${files.length} files to upload`);
  
  console.log('Creating blobs...');
  const treeItems: any[] = [];
  
  for (const file of files) {
    const fullPath = path.join(workDir, file);
    const content = fs.readFileSync(fullPath);
    const isText = !file.match(/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/i);
    
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: isText ? content.toString('utf8') : content.toString('base64'),
        encoding: isText ? 'utf-8' : 'base64'
      });
      
      treeItems.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      process.stdout.write('.');
    } catch (error: any) {
      console.error(`\nError uploading ${file}: ${error.message}`);
    }
  }
  
  console.log('\nCreating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
    base_tree: commit.tree.sha
  });
  
  console.log('Creating commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: 'Update: Admin credentials changed to admin/admin123',
    tree: tree.sha,
    parents: [currentSha]
  });
  
  console.log('Updating branch ref...');
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha
  });
  
  console.log(`\nSuccess! Pushed to ${OWNER}/${REPO}@${BRANCH}`);
  console.log(`Commit: ${newCommit.sha}`);
}

main().catch(console.error);
