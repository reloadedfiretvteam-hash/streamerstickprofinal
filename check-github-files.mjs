import { Octokit } from '@octokit/rest';

let connectionSettings;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const owner = 'reloadedfiretvteam-hash';
  const repo = 'streamerstickprofinal';
  
  // Check if vite-plugin-meta-images.ts exists in the repo
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'vite-plugin-meta-images.ts',
      ref: 'clean-main'
    });
    console.log('vite-plugin-meta-images.ts exists, size:', data.size);
  } catch (e) {
    console.log('vite-plugin-meta-images.ts NOT FOUND:', e.status);
  }
  
  // Check if client/index.html exists
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'client/index.html',
      ref: 'clean-main'
    });
    console.log('client/index.html exists, size:', data.size);
  } catch (e) {
    console.log('client/index.html NOT FOUND:', e.status);
  }
  
  // List root files
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: '',
      ref: 'clean-main'
    });
    console.log('Root files:', data.map(f => f.name).join(', '));
  } catch (e) {
    console.log('Error listing root:', e.message);
  }
}

main().catch(err => console.error('Error:', err.message));
