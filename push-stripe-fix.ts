import { getUncachableGitHubClient } from './server/github';
import * as fs from 'fs';

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

async function pushFile(octokit: any, filePath: string, message: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const { data: currentFile } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    ref: BRANCH
  });
  
  const sha = Array.isArray(currentFile) ? undefined : currentFile.sha;
  
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    message,
    content: Buffer.from(content).toString('base64'),
    sha: sha,
    branch: BRANCH
  });
  
  return data.commit.sha;
}

async function main() {
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  console.log('Pushing server/routes.ts...');
  const sha1 = await pushFile(octokit, 'server/routes.ts', 'Enable dynamic Stripe payment methods (Apple Pay, Google Pay, Link, etc.)');
  console.log('Success! server/routes.ts pushed:', sha1);
  
  console.log('Pushing worker/routes/checkout.ts...');
  const sha2 = await pushFile(octokit, 'worker/routes/checkout.ts', 'Enable dynamic Stripe payment methods for Cloudflare worker');
  console.log('Success! worker/routes/checkout.ts pushed:', sha2);
}

main().catch(console.error);
