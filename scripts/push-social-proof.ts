import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

const FILES_TO_PUSH = [
  'client/src/components/SocialProofPopup.tsx'
];

async function main() {
  console.log('Pushing social proof changes to GitHub...');
  const octokit = await getUncachableGitHubClient();
  
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`
  });
  const currentSha = ref.object.sha;
  console.log(`Current commit: ${currentSha}`);
  
  const { data: commit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: currentSha
  });
  
  const workDir = process.cwd();
  const treeItems: any[] = [];
  
  for (const file of FILES_TO_PUSH) {
    const fullPath = path.join(workDir, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: content,
      encoding: 'utf-8'
    });
    
    treeItems.push({
      path: file,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
    
    console.log(`Uploaded: ${file}`);
  }
  
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
    base_tree: commit.tree.sha
  });
  
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: 'Fix social proof: less frequent, shorter, more names, max 3 per session',
    tree: tree.sha,
    parents: [currentSha]
  });
  
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha,
    force: true
  });
  
  console.log(`\nSuccess! Pushed to ${OWNER}/${REPO}@${BRANCH}`);
  console.log(`Commit: ${newCommit.sha}`);
}

main().catch(console.error);
