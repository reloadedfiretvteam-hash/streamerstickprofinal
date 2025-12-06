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

async function checkRepo() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Checking repository access...');
  
  try {
    const { data: repo } = await octokit.repos.get({
      owner: OWNER,
      repo: REPO
    });
    console.log('Repository:', repo.full_name);
    console.log('Default branch:', repo.default_branch);
    console.log('Permissions:', repo.permissions);
    console.log('Private:', repo.private);
    
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    console.log('\nBranch SHA:', ref.object.sha);
    
    const { data: contents } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: '',
      ref: BRANCH
    });
    console.log('\nRoot files:', Array.isArray(contents) ? contents.map((c: any) => c.name).join(', ') : 'single file');
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkRepo().catch(console.error);
