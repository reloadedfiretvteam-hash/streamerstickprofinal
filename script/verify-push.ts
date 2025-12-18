import { Octokit } from '@octokit/rest';

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

async function verifyFiles() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Verifying pushed files...\n');
  
  const directories = ['worker', 'worker/routes', 'script', '.github', '.github/workflows'];
  
  for (const dir of directories) {
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: dir,
        ref: BRANCH
      });
      
      if (Array.isArray(contents)) {
        console.log(`✓ ${dir}/`);
        contents.forEach((f: any) => console.log(`    - ${f.name}`));
      }
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`✗ ${dir}/ - not found`);
      } else {
        console.log(`✗ ${dir}/ - error: ${error.message}`);
      }
    }
  }
  
  console.log('\nChecking GitHub Actions runs...');
  try {
    const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
      owner: OWNER,
      repo: REPO,
      per_page: 5
    });
    
    if (runs.workflow_runs.length === 0) {
      console.log('No workflow runs found.');
    } else {
      console.log('Recent workflow runs:');
      runs.workflow_runs.forEach((run: any) => {
        console.log(`  - ${run.name}: ${run.status} (${run.conclusion || 'in progress'}) - ${run.created_at}`);
      });
    }
  } catch (error: any) {
    console.log('Could not list workflow runs:', error.message);
  }
}

verifyFiles().catch(console.error);
