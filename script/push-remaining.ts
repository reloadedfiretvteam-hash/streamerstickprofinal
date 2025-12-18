import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken!
      }
    }
  ).then(res => res.json()).then((data: any) => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  return accessToken;
}

const OWNER = 'reloadedfiretvteam-hash';
const REPO = 'streamerstickprofinal';
const BRANCH = 'clean-main';

async function checkAndPush() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Checking wrangler.toml...');
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: 'wrangler.toml',
      ref: BRANCH
    });
    console.log('✓ wrangler.toml exists');
  } catch (error: any) {
    if (error.status === 404) {
      console.log('Pushing wrangler.toml...');
      const content = fs.readFileSync(path.join(process.cwd(), 'wrangler.toml'), 'utf-8');
      await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: 'wrangler.toml',
        message: 'Add wrangler.toml for Cloudflare Workers',
        content: Buffer.from(content).toString('base64'),
        branch: BRANCH
      });
      console.log('✓ wrangler.toml pushed');
    }
  }

  console.log('\nPushing workflow via Git Data API...');
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    const currentSha = ref.object.sha;
    
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: currentSha,
    });

    const workflowContent = fs.readFileSync(
      path.join(process.cwd(), '.github/workflows/deploy-cloudflare.yml'), 
      'utf-8'
    );

    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(workflowContent).toString('base64'),
      encoding: 'base64',
    });

    const { data: tree } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      base_tree: currentCommit.tree.sha,
      tree: [{
        path: '.github/workflows/deploy-cloudflare.yml',
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      }],
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'Add Cloudflare deployment workflow',
      tree: tree.sha,
      parents: [currentSha],
    });

    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha,
    });

    console.log('✓ Workflow file pushed successfully!');
  } catch (error: any) {
    console.error('Failed to push workflow:', error.message);
  }
}

checkAndPush().catch(console.error);
