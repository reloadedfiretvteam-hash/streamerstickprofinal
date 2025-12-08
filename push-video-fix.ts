import { getUncachableGitHubClient } from './server/github';
import * as fs from 'fs';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

async function main() {
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  const filePath = 'client/src/components/DemoVideo.tsx';
  const content = fs.readFileSync(filePath, 'utf-8');
  
  console.log('Getting current file SHA from clean-main...');
  const { data: currentFile } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    ref: BRANCH
  });
  
  const sha = Array.isArray(currentFile) ? undefined : currentFile.sha;
  
  console.log('Updating file on GitHub clean-main branch...');
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    message: 'Fix: Use Supabase URL for demo video instead of local file import',
    content: Buffer.from(content).toString('base64'),
    sha: sha,
    branch: BRANCH
  });
  
  console.log('Success! Commit SHA:', data.commit.sha);
}

main().catch(console.error);
