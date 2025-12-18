import { getUncachableGitHubClient } from './server/github';
import * as fs from 'fs';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

async function main() {
  const octokit = await getUncachableGitHubClient();
  const filePath = 'client/src/pages/ShadowStore.tsx';
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const { data: currentFile } = await octokit.repos.getContent({
    owner: OWNER, repo: REPO, path: filePath, ref: BRANCH
  });
  
  const sha = Array.isArray(currentFile) ? undefined : currentFile.sha;
  
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path: filePath,
    message: 'Add product images and polish to Shadow Store page',
    content: Buffer.from(content).toString('base64'),
    sha, branch: BRANCH
  });
  
  console.log('Pushed ShadowStore.tsx:', data.commit.sha);
}
main().catch(console.error);
