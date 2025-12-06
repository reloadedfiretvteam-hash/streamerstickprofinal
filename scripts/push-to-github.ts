import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const REPO_OWNER = 'reloadedfiretvteam-hash';
const REPO_NAME = 'streamerstickprofinal';
const TARGET_BRANCH = 'clean-main';

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

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.replit',
  '.local',
  'dist',
  '.cache',
  '.config',
  'scripts/push-to-github.ts',
  '.upm',
  'replit.nix',
  '.breakpoints',
  'generated-icon.png',
  'attached_assets'
];

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => 
    filePath.includes(pattern) || filePath.startsWith(pattern)
  );
}

function getAllFiles(dir: string, baseDir: string = ''): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = baseDir ? path.join(baseDir, item) : item;
    
    if (shouldExclude(relativePath)) continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else if (stat.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      } catch (e) {
        console.log('Skipping binary/unreadable file: ' + relativePath);
      }
    }
  }
  
  return files;
}

async function pushToGitHub() {
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  console.log('Listing branches...');
  const { data: branches } = await octokit.repos.listBranches({
    owner: REPO_OWNER,
    repo: REPO_NAME
  });
  console.log('Available branches: ' + branches.map(b => b.name).join(', '));
  
  console.log('\nPushing to ' + REPO_OWNER + '/' + REPO_NAME + ' branch: ' + TARGET_BRANCH + '...');
  
  let currentCommitSha: string = '';
  let currentTreeSha: string = '';
  
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: 'heads/' + TARGET_BRANCH
    });
    currentCommitSha = ref.object.sha;
    
    const { data: commit } = await octokit.git.getCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      commit_sha: currentCommitSha
    });
    currentTreeSha = commit.tree.sha;
    console.log('Current commit on ' + TARGET_BRANCH + ': ' + currentCommitSha);
  } catch (e: any) {
    console.log('Branch ' + TARGET_BRANCH + ' not found, will create it...');
  }
  
  console.log('Collecting files...');
  const files = getAllFiles('.');
  console.log('Found ' + files.length + ' files to push');
  
  console.log('Creating blobs...');
  const treeItems: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
  
  for (const file of files) {
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64'
      });
      
      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      console.log('  Created blob for: ' + file.path);
    } catch (e: any) {
      console.error('  Failed to create blob for ' + file.path + ': ' + e.message);
    }
  }
  
  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tree: treeItems
  });
  
  console.log('Creating commit...');
  const commitMessage = 'Fix video asset - use Supabase URL instead of local import for Cloudflare compatibility';
  const commitParams: any = {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    message: commitMessage,
    tree: tree.sha
  };
  
  if (currentCommitSha) {
    commitParams.parents = [currentCommitSha];
  }
  
  const { data: newCommit } = await octokit.git.createCommit(commitParams);
  console.log('Created commit: ' + newCommit.sha);
  
  console.log('Updating branch ' + TARGET_BRANCH + '...');
  try {
    await octokit.git.updateRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: 'heads/' + TARGET_BRANCH,
      sha: newCommit.sha,
      force: true
    });
    console.log('Successfully pushed to ' + TARGET_BRANCH + ' branch!');
  } catch (e) {
    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: 'refs/heads/' + TARGET_BRANCH,
      sha: newCommit.sha
    });
    console.log('Created and pushed to ' + TARGET_BRANCH + ' branch!');
  }
  
  console.log('\nDone! View your code at: https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/tree/' + TARGET_BRANCH);
}

pushToGitHub().catch(console.error);
