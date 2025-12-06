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
  
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'vite.config.ts',
      ref: 'clean-main'
    });
    console.log('vite.config.ts found, size:', data.size);
    // Decode content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    console.log('\n--- vite.config.ts content ---');
    console.log(content);
  } catch (e) {
    console.log('vite.config.ts NOT FOUND:', e.status);
  }
}

main().catch(err => console.error('Error:', err.message));
