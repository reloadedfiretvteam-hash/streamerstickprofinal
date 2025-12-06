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

async function listWorkflows() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Checking .github/workflows directory...\n');
  
  try {
    const { data: contents } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: '.github/workflows',
      ref: BRANCH
    });
    
    if (Array.isArray(contents)) {
      console.log('Existing workflows:');
      contents.forEach((f: any) => console.log(`  - ${f.name} (sha: ${f.sha})`));
      
      const deployFile = contents.find((f: any) => f.name === 'deploy-cloudflare.yml');
      if (deployFile) {
        console.log('\nUpdating existing deploy-cloudflare.yml...');
        const localContent = fs.readFileSync(path.join(process.cwd(), '.github/workflows/deploy-cloudflare.yml'), 'utf-8');
        
        await octokit.repos.createOrUpdateFileContents({
          owner: OWNER,
          repo: REPO,
          path: '.github/workflows/deploy-cloudflare.yml',
          message: 'Update Cloudflare deployment workflow for Workers',
          content: Buffer.from(localContent).toString('base64'),
          branch: BRANCH,
          sha: deployFile.sha
        });
        console.log('✓ Workflow updated successfully!');
      } else {
        console.log('\nNo deploy-cloudflare.yml found, creating new...');
        const localContent = fs.readFileSync(path.join(process.cwd(), '.github/workflows/deploy-cloudflare.yml'), 'utf-8');
        
        await octokit.repos.createOrUpdateFileContents({
          owner: OWNER,
          repo: REPO,
          path: '.github/workflows/deploy-cloudflare.yml',
          message: 'Add Cloudflare Workers deployment workflow',
          content: Buffer.from(localContent).toString('base64'),
          branch: BRANCH
        });
        console.log('✓ Workflow created successfully!');
      }
    }
  } catch (error: any) {
    if (error.status === 404) {
      console.log('.github/workflows directory does not exist, creating...');
      
      const localContent = fs.readFileSync(path.join(process.cwd(), '.github/workflows/deploy-cloudflare.yml'), 'utf-8');
      
      await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: '.github/workflows/deploy-cloudflare.yml',
        message: 'Add Cloudflare Workers deployment workflow',
        content: Buffer.from(localContent).toString('base64'),
        branch: BRANCH
      });
      console.log('✓ Workflow created successfully!');
    } else {
      console.error('Error:', error.message);
    }
  }
}

listWorkflows().catch(console.error);
